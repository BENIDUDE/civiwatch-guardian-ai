// deno-lint-ignore-file no-explicit-any no-import-prefix no-unused-vars
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function safeFetchWithRetry(url: string, options: any, providerName: string) {
  const waitTimeMs = 39000; 
  const maxRetries = 1;     

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const res = await fetch(url, options);
    const text = await res.text(); 

    let data;
    try {
      data = JSON.parse(text);
    } catch (_err) {
      if (text.trim().toLowerCase().startsWith("<!doctype") || text.toLowerCase().includes("<html")) {
        if (attempt <= maxRetries) {
          console.warn(`[${providerName}] Received HTML instead of JSON. Waking up model. Retrying in ${waitTimeMs/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTimeMs));
          continue; 
        }
        throw new Error(`${providerName} blocked the request with an HTML page (Cloudflare check or offline model).`);
      }
      throw new Error(`Failed to parse ${providerName} response: ${text.substring(0, 50)}...`);
    }

    if (!res.ok && res.status === 503 && data.error && data.estimated_time) {
      if (attempt <= maxRetries) {
        const sleepTime = Math.max(data.estimated_time * 1000, waitTimeMs);
        console.warn(`[${providerName}] Model loading. Retrying in ${sleepTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, sleepTime));
        continue;
      }
    }

    if (!res.ok) {
      throw new Error(data.error?.message || data.error || `${providerName} API error`);
    }

    // Explicitly handle Gemini's internal "SAFETY" block even if it returns a 200 OK
    if (providerName === 'Gemini' && data.candidates && data.candidates[0].finishReason === 'SAFETY') {
        throw new Error(`Gemini blocked the request internally due to safety filters despite settings.`);
    }

    return data; 
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // --- ADDED SECURITY CHECK FOR SERVER-TO-SERVER AUTH ---
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized Access. Missing Authentication Token.' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  try {
    const { provider, prompt, model, base64Image } = await req.json()
    
    let apiKey = '';
    let responseText = '';

    const hasImage = !!base64Image;
    
    const openAiContent = hasImage ? [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: base64Image } }
    ] : prompt;

    let geminiParts: any[] = [{ text: prompt }];
    if (hasImage) {
      const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64Data = mimeMatch ? mimeMatch[2] : base64Image;
      
      geminiParts.push({
        inline_data: { mime_type: mimeType, data: base64Data }
      });
    }

    if (provider === 'gemini') {
      apiKey = Deno.env.get('GEMINI_API_KEY') || '';
      const targetModel = model || 'gemini-2.5-flash'; 
      
      const data = await safeFetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ parts: geminiParts }],
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          })
        },
        'Gemini'
      );
      
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error("Gemini returned an empty response. (Possible undocumented safety block).");
      }
      responseText = data.candidates[0].content.parts[0].text;

    } else if (provider === 'together') {
      apiKey = Deno.env.get('TOGETHER_API_KEY') || '';
      const targetModel = model || (hasImage ? 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo' : 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo');
      
      const data = await safeFetchWithRetry(
        'https://api.together.xyz/v1/chat/completions',
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ model: targetModel, messages: [{ role: 'user', content: openAiContent }] })
        },
        'Together AI'
      );
      responseText = data.choices[0].message.content;

    } else if (provider === 'groq') {
      apiKey = Deno.env.get('GROQ_API_KEY') || '';
      const targetModel = model || (hasImage ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama3-8b-8192');
      
      const data = await safeFetchWithRetry(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ model: targetModel, messages: [{ role: 'user', content: openAiContent }] })
        },
        'Groq'
      );
      responseText = data.choices[0].message.content;

    } else if (provider === 'openrouter') {
      apiKey = Deno.env.get('OPENROUTER_API_KEY') || '';
      const targetModel = model || (hasImage ? 'meta-llama/llama-3.2-11b-vision-instruct' : 'openai/gpt-3.5-turbo');
      
      const data = await safeFetchWithRetry(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ model: targetModel, messages: [{ role: 'user', content: openAiContent }] })
        },
        'OpenRouter'
      );
      responseText = data.choices[0].message.content;

    } else if (provider === 'github') {
      apiKey = Deno.env.get('GITHUB_TOKEN') || '';
      const targetModel = model || 'gpt-4o'; 
      
      const data = await safeFetchWithRetry(
        'https://models.inference.ai.azure.com/chat/completions',
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ model: targetModel, messages: [{ role: 'user', content: openAiContent }] })
        },
        'GitHub'
      );
      responseText = data.choices[0].message.content;

    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(
      JSON.stringify({ response: responseText, provider: provider }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})