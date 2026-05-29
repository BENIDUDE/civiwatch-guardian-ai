/**
 * @file supabase/functions/invite-user/index.ts
 * @description Securely invites a new user to the CiviWatch platform via Supabase Auth.
 * * ============================================================================
 * HELPER SECTION: UNDERSTANDING THIS EDGE FUNCTION
 * ============================================================================
 * * WHY DO WE NEED THIS FILE?
 * In Supabase, the `supabase.auth.admin.inviteUserByEmail()` command requires 
 * administrative privileges (the Service Role Key). If we put that command directly 
 * into your React frontend (`TeamManager.js`), we would have to expose your Service 
 * Role Key to the public internet, which would allow anyone to bypass your security 
 * and take over your database. 
 * * To keep your app secure, `TeamManager.js` sends a simple, harmless POST request 
 * containing just an email address to this server-side Edge Function. Because this 
 * code runs securely on Supabase's servers, it can safely use the hidden Service 
 * Role Key to dispatch the invite.
 * * HOW IT WORKS:
 * 1. CORS Headers: The function first answers the browser's "pre-flight" security check 
 * (OPTIONS request) to prove it's allowed to talk to your React app.
 * 2. Parse Payload: It reads the `email` address sent from `TeamManager.js`.
 * 3. Build Admin Client: It creates a special "God Mode" Supabase client using the 
 * hidden `SUPABASE_SERVICE_ROLE_KEY` stored in your environment secrets.
 * 4. Dispatch Invite: It tells Supabase Auth to send the official invite email.
 * 5. Redirect Magic: It sets the `redirectTo` parameter so that when the user clicks 
 * the link in their email, they are sent directly to your login page to finish 
 * setting up their password.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email address is required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:3000';

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/login`, 
    });

    if (error) {
      console.error("Auth Admin Error:", error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("Function Execution Error:", err);
    
    // FIX: Safely extract the error message to satisfy TypeScript's strict typing
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});