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
        JSON.stringify({ success: false, error: 'session_id and letter_text required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Saving dispute letter for session:', sessionId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existing } = await supabase
      .from('dispute_letters')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('dispute_letters')
        .update({
          template_text: letterText,
          user_name: userName || null,
          user_address: userAddress || null,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('dispute_letters')
        .insert({
          session_id: sessionId,
          template_text: letterText,
          user_name: userName || null,
          user_address: userAddress || null
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Send to n8n for PDF generation (background)
    try {
      const n8nResponse = await fetch('https://learnlearnlearn.app.n8n.cloud/webhook/save-dispute-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_name: userName,
          user_address: userAddress,
          letter_text: letterText
        })
      });

      if (n8nResponse.ok) {
        const n8nData = await n8nResponse.json();
        if (n8nData.pdf_url) {
          await supabase
            .from('dispute_letters')
            .update({ pdf_url: n8nData.pdf_url })
            .eq('session_id', sessionId);
          result.pdf_url = n8nData.pdf_url;
        }
      }
    } catch (n8nError) {
      console.warn('N8N PDF generation failed (non-critical):', n8nError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dispute letter saved successfully',
        dispute_letter: result
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
