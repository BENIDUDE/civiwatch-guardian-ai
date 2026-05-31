// deno-lint-ignore-file no-explicit-any no-import-prefix
/**
 * @file index.ts (Edge Function: ai-council)
 * @description The Server-Side Intelligence Engine & AI Consensus Orchestrator.
 * FIX: Now respects the Organization's "Sampling Enforcement Strategy". 
 * FIX: Now dynamically routes models and sets thresholds based on organizations.ai_settings JSONB.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const extractJSON = (text: string) => {
  try {
    if (typeof text === 'object' && text !== null) return text;
    const match = text?.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : JSON.parse(text);
  } catch (_e) {
    throw new Error("Failed to parse JSON from AI response.");
  }
};

const getVotePrompt = (report: any) => `
  You are an expert content moderator for CiviWatch, an NGO dedicated to identifying online hate speech, antisemitism, terrorism, violence, and severe platform violations.

  REPORT DETAILS:
  - Description/Context: "${report.content || report.description || 'No description provided'}"
  - Platform: ${report.platform || 'Unknown'}
  - Applied Tags To Verify: ${report.tags ? report.tags.join(', ') : (report.category || 'Unknown')}

  YOUR TASK:
  Phase 1: Determine if this content is actually relevant to our mission. If it is a benign, normal post, it is out of scope.
  Phase 2: If in scope, evaluate EACH tag listed independently.

  Respond ONLY in valid JSON format matching this exact structure:
  {
    "is_in_scope": boolean,
    "scope_reasoning": "1 sentence explanation.",
    "evaluations": [
      {
        "tag": "String (exact tag name)",
        "is_match": boolean,
        "confidence": float (between 0.0 and 1.0)
      }
    ],
    "reasoning": "1-2 sentence overall explanation."
  }
`;

const PROVIDER_MAPPING: Record<string, string> = {
  'github_gpt4o': 'github',
  'groq_llama3': 'groq',
  'openrouter_llama3': 'openrouter',
  'gemini_15_flash': 'gemini'
};

const getThresholds = (category: string, providerCount: number, customThresholds: Record<string, number>) => {
  const cat = (category || 'default').toLowerCase().trim();
  
  const baseRules: Record<string, any> = {
    'terrorism':          { requiresUnanimity: true,  minVotesRatio: 0.6 },
    'incitement':         { requiresUnanimity: true,  minVotesRatio: 0.6 },
    'violence / cruelty': { requiresUnanimity: true,  minVotesRatio: 0.6 },
    'default':            { requiresUnanimity: false, minVotesRatio: 0.5 }
  };
  
  const rule = baseRules[cat] || baseRules['default'];

  let uiThreshold = 70; 
  const thresholdKey = Object.keys(customThresholds).find(k => k.toLowerCase().trim() === cat);
  
  if (thresholdKey !== undefined) {
      uiThreshold = customThresholds[thresholdKey];
  } else if (customThresholds['Default']) {
      uiThreshold = customThresholds['Default'];
  }
  
  const minConfidence = uiThreshold / 100;

  return { ...rule, minConfidence, requiredVotes: Math.max(1, Math.ceil(providerCount * rule.minVotesRatio)) };
};

serve(async (req) => {
  try {
    const payload = await req.json();
    const report = payload.record;

    if (!report || (report.ai_vote_status !== 'Pending' && report.ai_vote_status !== null)) {
      return new Response(JSON.stringify({ message: "Ignored. AI analysis already completed or not required." }), { status: 200 });
    }

    console.log(`[AI Council] Analyzing Report ID: ${report.id}`);

    let samplingRate = 0;
    let qaStrategy = 'global'; 
    let appliedStrategyLog = '';
    let aiSettings: any = null;

    if (report.organization_id) {
       const { data: org, error: orgError } = await supabaseAdmin
         .from('organizations')
         .select('default_sampling, default_sampling_rate, qa_strategy, ai_settings') 
         .eq('id', report.organization_id)
         .single();
       
       if (!orgError && org) {
         samplingRate = Number(org.default_sampling_rate ?? org.default_sampling ?? 0);
         qaStrategy = (org.qa_strategy || 'global').toLowerCase();
         aiSettings = org.ai_settings;
       }
    }

    if (qaStrategy.includes('operator') || qaStrategy.includes('per')) {
        if (report.submitted_by) {
            const { data: user, error: userError } = await supabaseAdmin
              .from('user_profiles')
              .select('current_sampling_rate')
              .eq('id', report.submitted_by)
              .single();
              
            if (!userError && user && user.current_sampling_rate !== null && user.current_sampling_rate !== undefined) {
                samplingRate = Number(user.current_sampling_rate);
                appliedStrategyLog = `Per-Operator Strategy Enforced: Using Override Rate (${samplingRate}%)`;
            } else {
                appliedStrategyLog = `Per-Operator Strategy Enforced: No override found, fell back to baseline (${samplingRate}%)`;
            }
        }
    } else {
        appliedStrategyLog = `Global Strategy Enforced: Using Org Baseline (${samplingRate}%)`;
    }
    console.log(`[AI Council] ${appliedStrategyLog}`);

    const { data: globalProviders, error: providerError } = await supabaseAdmin
      .from('ai_providers')
      .select('*')
      .eq('is_active', true);

    if (providerError || !globalProviders || globalProviders.length === 0) {
      throw new Error("No global AI providers configured.");
    }

    let activeProviders = globalProviders;
    const customThresholds: Record<string, number> = aiSettings?.thresholds || {};

    if (aiSettings?.active_models) {
        const allowedProviderTypes = Object.entries(aiSettings.active_models)
            .filter(([_, isActive]) => isActive)
            .map(([key, _]) => PROVIDER_MAPPING[key]);

        if (allowedProviderTypes.length > 0) {
            activeProviders = globalProviders.filter(p => allowedProviderTypes.includes(p.provider_type.toLowerCase()));
        }
    }

    console.log(`[AI Council] Active Models routed for request: ${activeProviders.map(p => p.name).join(', ')}`);

    let base64Image = null;
    const imageUrl = report.evidence_url || report.image_url;
    if (imageUrl) {
        try {
            const imgRes = await fetch(imageUrl);
            const arrayBuffer = await imgRes.arrayBuffer();
            const base64Str = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
            base64Image = `data:${mimeType};base64,${base64Str}`;
        } catch (_e) {
            console.warn("Failed to fetch image for AI Analysis, proceeding with text only.");
        }
    }

    const tagsToVerify = (report.tags && report.tags.length > 0) ? report.tags : [report.category || 'default'];
    
    const votePromises = activeProviders.map(async (provider) => {
      try {
        const prompt = getVotePrompt(report);
        const { data, error } = await supabaseAdmin.functions.invoke('ai-proxy', {
          body: { 
            provider: provider.provider_type.toLowerCase(), 
            prompt: prompt,
            base64Image: base64Image,
            model: provider.current_model
          }
        });

        if (error || (data && data.error)) throw new Error(error?.message || data?.error);
        const parsedData = extractJSON(data.response !== undefined ? data.response : data);
        return { providerName: provider.name, modelUsed: provider.current_model, ...parsedData, success: true };
      } catch (e: any) {
        return { providerName: provider.name, modelUsed: provider.current_model, success: false, reasoning: e.message };
      }
    });

    const results = await Promise.all(votePromises);
    const successfulVotes = results.filter(r => r.success && typeof r.is_in_scope !== 'undefined' && Array.isArray(r.evaluations));
    const failedCount = results.length - successfulVotes.length;

    if (successfulVotes.length === 0) {
      const errorMetadata = {
        overall_status: 'System Failure: All Providers Offline',
        failures: results.length,
        survivor_mode: true,
        validated_tags: [],
        rejected_tags: [],
        provider_results: results.map(r => ({
          name: r.providerName, model: r.modelUsed, reasoning: `ERROR: ${r.reasoning}`, scope: "Unknown"
        })),
        routing_note: "CRITICAL: The AI Proxy could not connect to external models."
      };

      await supabaseAdmin.from('reports').update({ 
        ai_vote_status: 'Manual Review Required', status: 'Pending Review', ai_reasoning: "All AI providers failed to respond.", routing_metadata: errorMetadata
      }).eq('id', report.id);
      return new Response(JSON.stringify({ message: "All providers failed." }), { status: 200 });
    }

    const inScopeVotes = successfulVotes.filter(v => String(v.is_in_scope).toLowerCase() === 'true').length;
    if ((successfulVotes.length - inScopeVotes) > successfulVotes.length / 2) {
      let finalReasoning = `[SYSTEM OVERRIDE: Report Dismissed - Majority AI consensus determined this content is out of scope.]\n`;
      successfulVotes.forEach(v => finalReasoning += `[${v.providerName}]: ${String(v.is_in_scope).toLowerCase() === 'true' ? 'In Scope' : 'Out of Scope'} - ${v.scope_reasoning}\n`);
      
      const auditMetadata = {
        overall_status: "Report Dismissed", failures: failedCount, survivor_mode: failedCount > 0,
        provider_results: successfulVotes.map(v => ({ name: v.providerName, model: v.modelUsed, reasoning: v.reasoning, scope: String(v.is_in_scope).toLowerCase() === 'true' ? "In Scope" : "Out of Scope" }))
      };

      await supabaseAdmin.from('reports').update({ 
        ai_vote_status: 'Changes Requested', status: 'Pending Review', ai_reasoning: finalReasoning, ai_confidence: 1.0, routing_metadata: auditMetadata
      }).eq('id', report.id);
      return new Response(JSON.stringify({ message: "Out of scope." }), { status: 200 });
    }

    const verifiedTags: string[] = [];
    const rejectedTags: string[] = [];
    const combinedReasoning: string[] = [];
    let highestVerifiedConfidence = 0;

    for (const tag of tagsToVerify) {
      const rules = getThresholds(tag, successfulVotes.length, customThresholds);
      const matchVotes: number[] = [];
      const rejectVotes: number[] = [];

      for (const vote of successfulVotes) {
        const evalForTag = vote.evaluations.find((e: any) => e.tag?.toLowerCase().trim() === tag.toLowerCase().trim());
        if (evalForTag) {
          const isMatch = evalForTag.is_match === true || String(evalForTag.is_match).toLowerCase() === 'true';
          const conf = parseFloat(evalForTag.confidence) || 0;
          isMatch ? matchVotes.push(conf) : rejectVotes.push(conf);
        }
      }

      const matchCount = matchVotes.length;
      const avgMatchConf = matchCount > 0 ? matchVotes.reduce((a, b) => a + b, 0) / matchCount : 0;
      
      if (rules.requiresUnanimity && rejectVotes.length > 0) {
         combinedReasoning.push(`[SYSTEM: Tag '${tag}' escalated - Rule requires unanimity.]`);
      } else if (matchCount >= rules.requiredVotes && avgMatchConf >= rules.minConfidence) {
         verifiedTags.push(tag);
         if (avgMatchConf > highestVerifiedConfidence) highestVerifiedConfidence = avgMatchConf;
         combinedReasoning.push(`[SYSTEM: Tag '${tag}' Verified - Consensus (${matchCount}/${successfulVotes.length}) at ${(avgMatchConf*100).toFixed(0)}%. (Req: ${(rules.minConfidence*100).toFixed(0)}%)]`);
      } else if (rejectVotes.length >= rules.requiredVotes) {
         rejectedTags.push(tag);
         combinedReasoning.push(`[SYSTEM: Tag '${tag}' Rejected - Majority determined no violation.]`);
      } else {
         combinedReasoning.push(`[SYSTEM: Tag '${tag}' Ambiguous - Consensus Failed (Match: ${(avgMatchConf*100).toFixed(0)}% | Req: ${(rules.minConfidence*100).toFixed(0)}%).]`);
      }
    }

    successfulVotes.forEach(v => combinedReasoning.push(`[${v.providerName}]: ${v.reasoning}`));

    let finalStatus = 'Manual Review Required';
    if (verifiedTags.length > 0) {
       finalStatus = 'AI Verified';
       combinedReasoning.unshift(`[SYSTEM OVERALL: Report Actionable. Validated Tags: ${verifiedTags.join(', ')}]`);
    } else if (rejectedTags.length === tagsToVerify.length) {
       finalStatus = 'AI Rejected';
       highestVerifiedConfidence = 1.0; 
       combinedReasoning.unshift(`[SYSTEM OVERALL: Report Rejected. All applied tags were determined false.]`);
    } else {
       combinedReasoning.unshift(`[SYSTEM OVERALL: Escalated for Manual Review due to ambiguous tag consensus.]`);
    }

    let finalReasoningString = combinedReasoning.join('\n');
    if (failedCount > 0) finalReasoningString += `\n*(Note: ${failedCount} provider(s) failed or were disabled via orchestration).*`;

    const auditMetadata: any = {
      overall_status: finalStatus === 'AI Verified' ? 'Report Actionable' : finalStatus === 'AI Rejected' ? 'Report Rejected' : 'Escalated: Ambiguous Consensus',
      validated_tags: verifiedTags, rejected_tags: rejectedTags,
      provider_results: successfulVotes.map(v => ({ name: v.providerName, model: v.modelUsed, reasoning: v.reasoning, scope: "In Scope" })),
      tag_consensus: tagsToVerify.map((tag: string) => {
        const matches = successfulVotes.filter((v: any) => v.evaluations.find((e: any) => e.tag?.toLowerCase().trim() === tag.toLowerCase().trim() && (e.is_match === true || String(e.is_match).toLowerCase() === 'true'))).length;
        return { tag, ratio: `${matches}/${successfulVotes.length}`, status: verifiedTags.includes(tag) ? 'Verified' : (rejectedTags.includes(tag) ? 'Rejected' : 'Ambiguous') };
      }),
      failures: failedCount, survivor_mode: failedCount > 0, routing_note: ""
    };

    const updatePayload: any = { ai_vote_status: finalStatus, ai_confidence: highestVerifiedConfidence };

    if (finalStatus === 'AI Verified' || finalStatus === 'AI Rejected') {
      const roll = Math.random() * 100;
      if (roll <= samplingRate) {
        updatePayload.status = 'Pending Review'; 
        finalReasoningString = `[QA SAMPLE: ${appliedStrategyLog}]\n` + finalReasoningString;
        auditMetadata.routing_note = appliedStrategyLog;
      } else {
        updatePayload.status = finalStatus === 'AI Verified' ? 'Verified' : 'Dismissed'; 
      }
    } else {
      updatePayload.status = 'Pending Review'; 
    }

    updatePayload.ai_reasoning = finalReasoningString;
    updatePayload.routing_metadata = auditMetadata;

    await supabaseAdmin.from('reports').update(updatePayload).eq('id', report.id);

    return new Response(JSON.stringify({ success: true, status: finalStatus }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("Critical AI Council Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})