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
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'sessionId parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get bill analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('bill_analyses')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (analysisError || !analysis) {
      return new Response(
        JSON.stringify({ success: false, error: 'Results not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user form data if exists
    const { data: formData } = await supabase
      .from('user_form_data')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    // Get dispute letter if exists
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
        ui_summary: analysis.analysis_result || {},
        analysis_result: analysis.analysis_result,
        file_name: analysis.file_name,
        file_url: analysis.file_url,
        critical_issues: analysis.critical_issues,
        moderate_issues: analysis.moderate_issues,
        estimated_savings: analysis.estimated_savings,
        total_overcharges: analysis.total_overcharges,
        issues: analysis.issues,
        user_data: formData || null,
        dispute_letter_template: disputeLetter?.template_text || null,
        dispute_letter_pdf_url: disputeLetter?.pdf_url || null,
        created_at: analysis.created_at,
        updated_at: analysis.updated_at
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
