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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'session_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: analysis, error: analysisError } = await supabase
      .from('bill_analyses')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (analysisError || !analysis) {
      console.error('Analysis query error:', analysisError);
      return new Response(
        JSON.stringify({ success: false, error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: formData } = await supabase
      .from('user_form_data')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    const { data: disputeLetter } = await supabase
      .from('dispute_letters')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        session_id: analysis.session_id,
        status: analysis.status,
        hospital_name: analysis.analysis_result?.hospital_name || '',
        ui_summary: {
          high_priority_count: analysis.critical_issues || 0,
          potential_issues_count: analysis.moderate_issues || 0,
          estimated_savings_if_corrected: analysis.estimated_savings || 0,
          data_sources_used: analysis.analysis_result?.data_sources || [],
          tags: analysis.analysis_result?.tags || []
        },
        findings: analysis.issues || [],
        full_analysis: analysis.analysis_result || {},
        email_sent: analysis.analysis_result?.email_sent || false,
        user_data: formData || null,
        dispute_letter_template: disputeLetter?.template_text || null,
        dispute_letter_pdf_url: disputeLetter?.pdf_url || null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-full-result:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
