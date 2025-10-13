import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userName, userAddress, letterText } = await req.json();

    if (!sessionId || !letterText) {
      return new Response(
        JSON.stringify({ success: false, error: 'sessionId and letterText are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if dispute letter already exists
    const { data: existing } = await supabase
      .from('dispute_letters')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('dispute_letters')
        .update({
          template_text: letterText,
          user_name: userName,
          user_address: userAddress,
        })
        .eq('session_id', sessionId)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('dispute_letters')
        .insert({
          session_id: sessionId,
          template_text: letterText,
          user_name: userName,
          user_address: userAddress,
        })
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save dispute letter' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optionally forward to n8n for PDF generation
    const n8nWebhook = 'https://learnlearnlearn.app.n8n.cloud/webhook/save-dispute-letter';
    try {
      await fetch(n8nWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_name: userName,
          user_address: userAddress,
          letter_text: letterText
        })
      });
      console.log('Sent to n8n for PDF generation');
    } catch (n8nError) {
      console.warn('n8n webhook failed (non-fatal):', n8nError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Dispute letter saved',
        id: result.data.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in save-dispute-letter:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
