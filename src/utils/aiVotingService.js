/**
 * @file aiVotingService.js
 * @description The "AI Council" Orchestrator & Logic Engine for CiviWatch.
 * This file contains the core algorithmic intelligence of the platform. It handles 
 * pre-ingestion safety checks, automated form filling via OCR/Vision, and the highly 
 * complex multi-model consensus system (The AI Council).
 * * * --- CORE ARCHITECTURE & PROXIES ---
 * All LLM requests are routed through a secure Supabase Edge Function (`ai-proxy`). 
 * This keeps API keys hidden from the client and standardizes the request/response 
 * lifecycle across disparate providers (OpenAI, Anthropic, Groq, etc.).
 * * * --- THE THRESHOLD MATRIX ---
 * The system utilizes a dynamic `getThresholds` configuration to weigh AI decisions. 
 * Different violations require different burdens of proof. For example:
 * - "Terrorism" / "Incitement": Requires 90-95% confidence AND absolute unanimity among all AI models.
 * - "Hate Speech" / "Troll": Requires lower confidence (70-80%) and only a simple majority.
 * * * --- EXPORTED FUNCTIONS ---
 * * @function checkContentScope
 * @description The Front-Door Gatekeeper.
 * A high-speed, lightweight classification check (defaulting to GPT-4o or Llama3). 
 * It determines if the user's uploaded content actually matches the NGO's mission scope 
 * (e.g., hate speech, violence) or if it is benign (e.g., a recipe, a cat photo).
 * @param {string} base64Image - The visual evidence.
 * @param {Array} tags - User-suggested categorizations.
 * @param {string} context - User-provided text context.
 * @returns {Object} { is_in_scope: boolean, reasoning: string }
 * * @function executeAutoFill
 * @description The Vision-to-Data Pipeline.
 * Triggered when an operator drags/pastes an image into the UI. It loops through active 
 * AI providers in a "waterfall" sequence. If one fails, it tries the next. It extracts 
 * the platform, URL, language, and suggested tags directly from the pixels of the screenshot.
 * @param {string} base64Image - The visual evidence to parse.
 * @param {Function} onProgressUpdate - Callback to update the UI loading state.
 * @returns {Object} { success: boolean, data: Object, provider: string }
 * * @function executeAIVote
 * @description The AI Council Consensus Engine. 
 * This is the heaviest and most critical function in the system. It executes a 4-Phase pipeline:
 * * - PHASE 1 (Scope Interceptor): Models independently vote on mission relevance. If the majority 
 * determines the content is out-of-scope, the report is instantly dismissed, overriding any tags.
 * * - PHASE 2 (Independent Tag Evaluation): The system isolates each tag (e.g., Antisemitism) and 
 * checks the votes against the `getThresholds` matrix. It aggregates confidence scores and checks 
 * for required unanimity. Tags are sorted into 'Verified', 'Rejected', or 'Ambiguous'.
 * * - PHASE 3 (Overall Decision): Combines the tag results. If all tags are rejected -> 'AI Rejected'. 
 * If at least one tag is verified -> 'AI Verified'. If there are mixed/ambiguous results -> 
 * 'Manual Review Required' (escalated to humans).
 * * - PHASE 4 (Human-in-the-Loop Routing): The final safety net. Even if the AI verifies a threat, 
 * this phase can override it under three conditions:
 * 1. Urgent Flag: Bypasses automation completely for immediate human eyes.
 * 2. Low Confidence: If the AI consensus is below the global 80% safety net, it escalates to QA.
 * 3. Algorithmic QA Sampling: Uses the Operator's specific `current_sampling_rate` (or the Org's baseline). 
 * It rolls a 100-sided die (`Math.random`). If the roll falls within the sampling rate, the AI's 
 * decision is intercepted and routed to a Moderator for 'Pending Review'.
 * * @param {Object} report - The database row data of the report being analyzed.
 * @param {string} base64Image - The associated evidence image.
 * @returns {Object} { success: boolean, status: string } - The final calculated database state.
 */
import { supabase } from '../supabaseClient';

// ==========================================
// SHARED PROMPTS & HELPERS
// ==========================================

const extractJSON = (text) => {
  try {
    if (typeof text === 'object' && text !== null) {
      return text;
    }

    const match = text?.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : JSON.parse(text);
  } catch (e) {
    console.error("ExtractJSON failed. Payload was:", text);
    throw new Error("Failed to parse JSON from AI response.");
  }
};

const AUTOFILL_PROMPT = `
  Analyze this screenshot of digital content.
  Return a valid JSON object to auto-fill a reporting form with the following keys:
  - "platform": Identify the app/website. Must be exactly one of: "x", "facebook", "instagram", "tiktok", "telegram", "youtube", "linkedin", "reddit", "discord", "truth social", "vk", or "other".
  - "link": Look at the top of the image for a browser address bar. Extract the full URL if visible. If not visible, return an empty string "".
  - "language": Identify the main language of the text. Must be exactly one of: "he", "en", "ar", "ru", or "other".
  - "tags": An array of 1 to 3 relevant string tags describing the abusive behavior. Choose from: Antisemitism, Hate Speech, Harassment, Terrorism, Violence / Cruelty, Pornography, Nudity, Fake News, Troll, or Other.
  - "context": A short 1-sentence summary of what the offensive content is about.
  - "routing": Choose "ai" if the content contains a clear, unambiguous violation from the tags above (like direct threats, blatant antisemitism, or extreme violence), or "human" if the content is complex, nuanced, or ambiguous.
`;

const getVotePrompt = (report) => `
  You are an expert content moderator for CiviWatch, an NGO dedicated to identifying online hate speech, antisemitism, terrorism, violence, and severe platform violations.

  REPORT DETAILS:
  - Description/Context: "${report.content || report.description || 'No description provided'}"
  - Platform: ${report.platform || 'Unknown'}
  - Applied Tags To Verify: ${report.tags ? report.tags.join(', ') : (report.category || 'Unknown')}

  YOUR TASK:
  Phase 1: Determine if this content is actually relevant to our mission. If it is a benign, normal post (like a standard job listing, a recipe, a friendly photo, generic code), it is completely out of scope.
  Phase 2: If the content IS in scope, evaluate EACH tag listed in "Applied Tags To Verify" independently.

  Respond ONLY in valid JSON format matching this exact structure:
  {
    "is_in_scope": boolean,
    "scope_reasoning": "A brief 1-sentence explanation of why this is or isn't relevant to the CiviWatch mission.",
    "evaluations": [
      {
        "tag": "String (the exact tag name being evaluated)",
        "is_match": boolean,
        "confidence": float (between 0.0 and 1.0)
      }
    ],
    "reasoning": "A brief 1-2 sentence overall explanation of your tag decisions."
  }
`;

const markManualReview = async (reportId, reason, confidence = 0) => {
  await supabase
    .from('reports')
    .update({
      ai_vote_status: 'Manual Review Required',
      ai_reasoning: reason,
      ai_confidence: confidence
    })
    .eq('id', reportId);
};

// ==========================================
// THRESHOLD MATRIX (Category-Specific Rules)
// ==========================================
const getThresholds = (category, successfulProviderCount) => {
  const cat = (category || 'default').toLowerCase().trim();
  
  const configs = {
    'incitement':         { minConfidence: 0.90, requiresUnanimity: true,  minVotesRatio: 0.6 },
    'terrorism':          { minConfidence: 0.95, requiresUnanimity: true,  minVotesRatio: 0.6 },
    'violence / cruelty': { minConfidence: 0.90, requiresUnanimity: true,  minVotesRatio: 0.6 },
    'pornography':        { minConfidence: 0.95, requiresUnanimity: true,  minVotesRatio: 0.7 },
    'nudity':             { minConfidence: 0.85, requiresUnanimity: true,  minVotesRatio: 0.6 },
    'antisemitism':       { minConfidence: 0.80, requiresUnanimity: false, minVotesRatio: 0.5 },
    'hate speech':        { minConfidence: 0.80, requiresUnanimity: false, minVotesRatio: 0.5 },
    'harassment':         { minConfidence: 0.80, requiresUnanimity: false, minVotesRatio: 0.5 },
    'fake news':          { minConfidence: 0.75, requiresUnanimity: false, minVotesRatio: 0.5 },
    'disinformation':     { minConfidence: 0.75, requiresUnanimity: false, minVotesRatio: 0.5 },
    'troll':              { minConfidence: 0.70, requiresUnanimity: false, minVotesRatio: 0.5 },
    'other':              { minConfidence: 0.70, requiresUnanimity: false, minVotesRatio: 0.5 },
    'default':            { minConfidence: 0.70, requiresUnanimity: false, minVotesRatio: 0.5 }
  };

  const rule = configs[cat] || configs['default'];
  
  return {
    ...rule,
    requiredVotes: Math.max(1, Math.ceil(successfulProviderCount * rule.minVotesRatio))
  };
};

// ==========================================
// UNIFIED PROXY CALLER
// ==========================================
const callAIProxy = async (providerType, prompt, base64Image = null, targetModel = null) => {
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: { 
      provider: providerType.toLowerCase(), 
      prompt: prompt,
      base64Image: base64Image,
      model: targetModel
    }
  });

  if (error) {
    throw new Error(`Supabase Proxy Error: ${error.message}`);
  }

  if (data && data.error) {
    throw new Error(`API Error: ${data.error}`);
  }

  console.log(`[${providerType}] Raw Data from Proxy (Model: ${targetModel || 'Default'}):`, data);

  const payloadToParse = data.response !== undefined ? data.response : data;

  return extractJSON(payloadToParse);
};

// ==========================================
// 1. FRONT-DOOR PRE-INGESTION GATEKEEPER
// ==========================================
export const checkContentScope = async (base64Image, tags, context) => {
  try {
    const prompt = `
      You are a rapid pre-ingestion security scanner for CiviWatch. 
      CiviWatch ONLY tracks threats like: Hate Speech, Antisemitism, Terrorism, Harassment, Violence, Cruelty, Pornography, Nudity, Fake News, and Trolls.
      
      Context provided by user: "${context || 'None'}"
      Tags provided by user: "${tags && tags.length > 0 ? tags.join(', ') : 'None'}"

      Analyze this image and the context. Is this content genuinely related to any of these threat categories?
      If the content is benign (e.g., a standard job listing, a recipe, a cute animal, a normal advertisement), it is completely out of scope.

      Respond ONLY in valid JSON format:
      {
        "is_in_scope": boolean,
        "reasoning": "1 sentence explaining your decision."
      }
    `;

    let result;
    try {
      result = await callAIProxy('github', prompt, base64Image, 'gpt-4o');
    } catch (e) {
      result = await callAIProxy('groq', prompt, base64Image, 'llama3-8b-8192');
    }
    
    if (result && typeof result.is_in_scope !== 'undefined') {
      return result;
    }
    return { is_in_scope: true, reasoning: "Fallback: AI scan failed to return proper format, allowing submission." };
  } catch (error) {
    console.error("Scope Check Error:", error);
    return { is_in_scope: true, reasoning: "System error during scan, allowing submission." };
  }
};

// ==========================================
// 2. AUTO-FILL WATERFALL (For Report Form)
// ==========================================
export const executeAutoFill = async (base64Image, onProgressUpdate = null) => {
  try {
    const { data: providers, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (providerError || !providers || providers.length === 0) throw new Error("No active AI providers configured.");

    let scanResult = null;
    let providerUsed = null;

    for (const provider of providers) {
      try {
        if (onProgressUpdate) onProgressUpdate(`Scanning with ${provider.name}...`);
        
        scanResult = await callAIProxy(provider.provider_type, AUTOFILL_PROMPT, base64Image, provider.current_model);

        if (scanResult && scanResult.platform) {
          providerUsed = provider.name;
          break; 
        }
      } catch (err) {
        console.warn(`Provider ${provider.name} failed: ${err.message}`);
      }
    }

    if (scanResult) return { success: true, data: scanResult, provider: providerUsed };
    throw new Error("All AI providers failed to scan the image.");

  } catch (error) {
    console.error("Critical AI Auto-Fill Error:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// 3. HIGH-INTEGRITY AI COUNCIL (For Queue)
// ==========================================
export const executeAIVote = async (report, base64Image = null) => {
  try {
    const { data: providers, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true);

    if (providerError || !providers || providers.length === 0) {
      await markManualReview(report.id, "System Error: No active AI providers configured.");
      return { success: false, status: 'Manual Review Required' };
    }

    const tagsToVerify = (report.tags && report.tags.length > 0) 
      ? report.tags 
      : [report.category || 'default'];

    const votePromises = providers.map(async (provider) => {
      try {
        const prompt = getVotePrompt(report);
        const result = await callAIProxy(provider.provider_type, prompt, base64Image, provider.current_model);
        return { providerName: provider.name, modelUsed: provider.current_model, ...result, success: true };
      } catch (e) {
        return { providerName: provider.name, modelUsed: provider.current_model, success: false, reasoning: e.message };
      }
    });

    const results = await Promise.all(votePromises);
    
    const successfulVotes = results.filter(r => r.success && typeof r.is_in_scope !== 'undefined' && Array.isArray(r.evaluations));
    const failedCount = results.length - successfulVotes.length;

    if (successfulVotes.length === 0) {
      await markManualReview(report.id, "System Error: All AI Council members failed to parse the prompt.");
      return { success: false, status: 'Manual Review Required' };
    }

    const logEntries = successfulVotes.map(vote => ({
      report_id: report.id,
      engine_name: vote.providerName,
      model_used: vote.modelUsed || 'Unknown Model',
      raw_vote: {
        evaluations: vote.evaluations,
        reasoning: vote.reasoning,
        is_in_scope: vote.is_in_scope,
        scope_reasoning: vote.scope_reasoning
      },
      confidence: vote.confidence || 0,
      created_at: new Date().toISOString()
    }));
    await supabase.from('voting_logs').insert(logEntries);

    // --- PHASE 1: THE SCOPE GATEKEEPER INTERCEPTOR ---
    const inScopeVotes = successfulVotes.filter(v => String(v.is_in_scope).toLowerCase() === 'true').length;
    const outOfScopeVotes = successfulVotes.length - inScopeVotes;

    if (outOfScopeVotes > successfulVotes.length / 2) {
      let combinedReasoning = [`[SYSTEM OVERRIDE: Report Dismissed - Majority AI consensus determined this content is benign and out of scope.]`];
      
      successfulVotes.forEach(v => {
        const scopeStr = String(v.is_in_scope).toLowerCase() === 'true' ? 'In Scope' : 'Out of Scope';
        combinedReasoning.push(`[${v.providerName} (${v.modelUsed || 'Default'}): ${scopeStr} - ${v.scope_reasoning || v.reasoning}]`);
      });

      let finalReasoningString = combinedReasoning.join('\n');
      if (failedCount > 0) finalReasoningString += `\n*(Note: ${failedCount} provider(s) failed).*`;

      const auditMetadata = {
        overall_status: "Report Dismissed",
        failures: failedCount,
        survivor_mode: failedCount > 0,
        provider_results: successfulVotes.map(v => ({
          name: v.providerName,
          model: v.modelUsed,
          reasoning: v.reasoning,
          scope: String(v.is_in_scope).toLowerCase() === 'true' ? "In Scope" : "Out of Scope"
        }))
      };

      await supabase
        .from('reports')
        .update({
          ai_vote_status: 'Changes Requested',
          ai_reasoning: finalReasoningString,
          ai_confidence: 1.0,
          routing_metadata: auditMetadata
        })
        .eq('id', report.id);

      return { success: true, status: 'Changes Requested' };
    }

    // --- PHASE 2: INDEPENDENT TAG EVALUATION ---
    let verifiedTags = [];
    let rejectedTags = [];
    let combinedReasoning = [];
    let highestVerifiedConfidence = 0;

    for (const tag of tagsToVerify) {
      const rules = getThresholds(tag, successfulVotes.length);
      const matchVotes = [];
      const rejectVotes = [];

      for (const vote of successfulVotes) {
        const evalForTag = vote.evaluations.find(e => e.tag?.toLowerCase().trim() === tag.toLowerCase().trim());
        
        if (evalForTag) {
          const isMatch = evalForTag.is_match === true || String(evalForTag.is_match).toLowerCase() === 'true';
          const conf = parseFloat(evalForTag.confidence) || 0;
          if (isMatch) matchVotes.push(conf);
          else rejectVotes.push(conf);
        }
      }

      const matchCount = matchVotes.length;
      const avgMatchConfidence = matchCount > 0 ? matchVotes.reduce((a, b) => a + b, 0) / matchCount : 0;
      
      if (rules.requiresUnanimity && rejectVotes.length > 0) {
         combinedReasoning.push(`[SYSTEM: Tag '${tag}' escalated - Rule requires absolute unanimity, but received rejections.]`);
      } else if (matchCount >= rules.requiredVotes && avgMatchConfidence >= rules.minConfidence) {
         verifiedTags.push(tag);
         if (avgMatchConfidence > highestVerifiedConfidence) highestVerifiedConfidence = avgMatchConfidence;
         combinedReasoning.push(`[SYSTEM: Tag '${tag}' Verified - Consensus (${matchCount}/${successfulVotes.length}) at ${(avgMatchConfidence*100).toFixed(0)}%.]`);
      } else if (rejectVotes.length >= rules.requiredVotes) {
         rejectedTags.push(tag);
         combinedReasoning.push(`[SYSTEM: Tag '${tag}' Rejected - Majority determined no violation.]`);
      } else {
         combinedReasoning.push(`[SYSTEM: Tag '${tag}' Ambiguous - No consensus reached.]`);
      }
    }

    successfulVotes.forEach(v => {
      combinedReasoning.push(`[${v.providerName} (${v.modelUsed || 'Default'}): ${v.reasoning}]`);
    });

    // --- PHASE 3: OVERALL DECISION LOGIC ---
    let finalStatus = 'Manual Review Required';
    let targetConfidenceToSave = 0;

    const auditMetadata = {
      overall_status: "",
      validated_tags: verifiedTags,
      rejected_tags: rejectedTags,
      provider_results: successfulVotes.map(v => ({
        name: v.providerName,
        model: v.modelUsed,
        reasoning: v.reasoning,
        scope: "In Scope"
      })),
      tag_consensus: tagsToVerify.map(tag => {
        const matches = successfulVotes.filter(v => 
          v.evaluations.find(e => e.tag?.toLowerCase().trim() === tag.toLowerCase().trim() && (e.is_match === true || String(e.is_match).toLowerCase() === 'true'))
        ).length;
        return {
          tag,
          ratio: `${matches}/${successfulVotes.length}`,
          status: verifiedTags.includes(tag) ? 'Verified' : (rejectedTags.includes(tag) ? 'Rejected' : 'Ambiguous')
        };
      }),
      failures: failedCount,
      survivor_mode: failedCount > 0,
      routing_note: ""
    };

    if (verifiedTags.length > 0) {
       finalStatus = 'AI Verified';
       targetConfidenceToSave = highestVerifiedConfidence;
       combinedReasoning.unshift(`[SYSTEM OVERALL: Report Actionable. Validated Tags: ${verifiedTags.join(', ')}]`);
       auditMetadata.overall_status = "Report Actionable";
    } else if (rejectedTags.length === tagsToVerify.length) {
       finalStatus = 'AI Rejected';
       targetConfidenceToSave = 1.0; 
       combinedReasoning.unshift(`[SYSTEM OVERALL: Report Rejected. All applied tags were determined false.]`);
       auditMetadata.overall_status = "Report Rejected";
    } else {
       finalStatus = 'Manual Review Required';
       combinedReasoning.unshift(`[SYSTEM OVERALL: Escalated for Manual Review due to ambiguous tag consensus.]`);
       auditMetadata.overall_status = "Escalated: Ambiguous Consensus";
    }

    // --- PHASE 4: HUMAN-IN-THE-LOOP ROUTING ENGINE ---
    if (finalStatus === 'AI Verified') {
      if (report.is_urgent === true || report.priority === 'High') {
        finalStatus = 'Manual Review Required';
        combinedReasoning.unshift(`[ROUTING OVERRIDE: Flagged as URGENT. Bypassing automation for immediate escalation.]`);
        auditMetadata.routing_note = "ROUTING OVERRIDE: Urgent Flag Escalation";
      } 
      else if (targetConfidenceToSave < 0.80) {
         finalStatus = 'Pending Review';
         combinedReasoning.unshift(`[ROUTING OVERRIDE: Verified confidence (${(targetConfidenceToSave*100).toFixed(0)}%) is below the global 80% safety net.]`);
         auditMetadata.routing_note = `ROUTING OVERRIDE: Confidence (${(targetConfidenceToSave*100).toFixed(0)}%) below 80% safety net`;
      } 
      else if (report.assigned_to) {
        try {
          const { data: operatorData } = await supabase
            .from('user_profiles')
            .select('current_sampling_rate, organizations(default_sampling_rate)')
            .eq('user_id', report.assigned_to)
            .single();

          if (operatorData) {
            let targetRate = 100; 
            
            if (operatorData.current_sampling_rate !== null) {
               targetRate = operatorData.current_sampling_rate;
            } else if (operatorData.organizations && operatorData.organizations.default_sampling_rate !== null) {
               targetRate = operatorData.organizations.default_sampling_rate;
            }

            const diceRoll = Math.floor(Math.random() * 100) + 1;
            
            if (diceRoll <= targetRate) {
               finalStatus = 'Pending Review';
               combinedReasoning.unshift(`[ROUTING OVERRIDE: Selected for QA Sampling (Target: ${targetRate}%, Rolled: ${diceRoll})]`);
               auditMetadata.routing_note = `QA Sampling Triggered (${diceRoll}% rolled vs ${targetRate}% target)`;
            } else {
               combinedReasoning.unshift(`[SYSTEM LOG: Bypassed QA Sampling (Target: ${targetRate}%, Rolled: ${diceRoll})]`);
               auditMetadata.routing_note = `Bypassed QA Sampling (${diceRoll}% rolled vs ${targetRate}% target)`;
            }
          }
        } catch (sampleErr) {
          console.error("QA Routing Engine Error:", sampleErr);
          finalStatus = 'Pending Review'; 
          combinedReasoning.unshift(`[SYSTEM ERROR: QA Routing failed. Defaulting to safe manual review.]`);
          auditMetadata.routing_note = "QA Routing Engine Error: Defaulted to manual review";
        }
      }
    }

    let finalReasoningString = combinedReasoning.join('\n');
    if (failedCount > 0) finalReasoningString += `\n*(Note: ${failedCount} provider(s) failed. Decision based on survivors).*`;

    await supabase
      .from('reports')
      .update({
        ai_vote_status: finalStatus,
        ai_reasoning: finalReasoningString,
        ai_confidence: targetConfidenceToSave,
        routing_metadata: auditMetadata
      })
      .eq('id', report.id);

    return { success: true, status: finalStatus };
  } catch (error) {
    console.error("Critical AI Voting Error:", error);
    return { success: false, status: 'Manual Review Required' };
  }
};