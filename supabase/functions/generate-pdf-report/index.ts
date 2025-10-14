import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const reportSchema = z.object({
  sessionId: z.string().min(1).max(100),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = reportSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId } = validation.data;

    console.log('Generating PDF report for session:', sessionId);

    // Get analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from('bill_analyses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (analysisError || !analysis) {
      return new Response(
        JSON.stringify({ error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for n8n webhook
    const reportData = {
      session_id: sessionId,
      requestType: "detailed_pdf_report",
      hospital_name: analysis.analysis_result?.hospital_name || '',
      high_priority_count: analysis.critical_issues || 0,
      potential_issues_count: analysis.moderate_issues || 0,
      estimated_savings: analysis.estimated_savings || 0,
      data_sources: analysis.analysis_result?.data_sources || [],
      tags: analysis.analysis_result?.tags || [],
      file_url: analysis.file_url,
      analysis_result: analysis.analysis_result
    };

    console.log('Sending to n8n for PDF generation:', reportData);

    // Call n8n webhook to generate PDF
    const n8nResponse = await fetch('https://learnlearnlearn.app.n8n.cloud/webhook/generate-pdf-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData)
    });

    console.log('n8n response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', n8nResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate PDF report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await n8nResponse.json();
    console.log('PDF generation result:', result);

    // Update analysis with PDF URL if provided
    if (result.pdf_url) {
      await supabase
        .from('bill_analyses')
        .update({ 
          pdf_report_url: result.pdf_url,
          pdf_generated_at: new Date().toISOString()
        })
        .eq('id', analysis.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'PDF report generation started',
        pdf_url: result.pdf_url,
        result
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-pdf-report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
