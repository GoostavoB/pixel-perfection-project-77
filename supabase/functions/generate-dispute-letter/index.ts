import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const letterSchema = z.object({
  sessionId: z.string().min(1).max(100),
  patientName: z.string().min(1).max(200).optional(),
  hospitalName: z.string().min(1).max(200).optional(),
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
    const validation = letterSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, patientName, hospitalName } = validation.data;

    console.log('Generating dispute letter for session:', sessionId);

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

    // ✅ PHASE 6: Generate structured line-by-line dispute blocks
    const billData = analysis.analysis_result || {};
    const lineBlocks = (billData.high_priority_issues || []).map((issue: any) => {
      // 1. Identification
      const identification = `Line ${issue.line_id}: ${issue.line_description} (CPT ${issue.cpt_code || 'N/A'}), billed $${issue.billed_amount?.toFixed(2) || '0.00'}`;
      
      // 2. Rule (citation with regulation reference)
      const citation = issue.evidence?.citation || 'reasonable medical billing practices';
      const rule = issue.issue_type === 'duplicate' 
        ? `This represents a duplicate charge in violation of ${citation}`
        : issue.issue_type === 'nsa_violation'
        ? `This violates the No Surprises Act (42 U.S.C. § 300gg-111) regarding ${citation}`
        : `This charge exceeds allowable rates per ${citation}`;
      
      // 3. Comparison (benchmark reference)
      const benchmark = issue.medicare_benchmark || issue.reasonable_rate || 0;
      const benchmarkSource = issue.evidence?.benchmark_source || 'Medicare Fee Schedule 2025-Q1';
      const ratio = benchmark > 0 ? (issue.billed_amount / benchmark).toFixed(1) : 'N/A';
      const comparison = benchmark > 0
        ? `Reference pricing: $${benchmark.toFixed(2)} (${benchmarkSource}), representing a ${ratio}× markup`
        : `This charge lacks reasonable justification`;
      
      // 4. Request (specific adjustment amount)
      const adjustment = issue.overcharge_amount || 0;
      const request = adjustment > 0
        ? `We request adjustment to $${benchmark.toFixed(2)}, reducing balance by $${adjustment.toFixed(2)}`
        : `We request removal of this duplicate charge of $${issue.billed_amount?.toFixed(2) || '0.00'}`;
      
      return `${identification}. ${rule}. ${comparison}. ${request}.`;
    }).join('\n\n');

    // Prepare data for n8n webhook
    const letterData = {
      session_id: sessionId,
      requestType: "dispute_letter",
      patient_name: patientName || "Patient Name",
      hospital_name: hospitalName || analysis.analysis_result?.hospital_name || "Hospital Name",
      critical_issues: analysis.critical_issues || 0,
      moderate_issues: analysis.moderate_issues || 0,
      estimated_savings: analysis.estimated_savings || 0,
      issues: analysis.issues || [],
      tags: analysis.analysis_result?.tags || [],
      analysis_result: analysis.analysis_result,
      structuredLineBlocks: lineBlocks,
      totalIssues: billData.high_priority_issues?.length || 0,
      totalSavings: billData.savings_total || 0
    };

    console.log('Sending to n8n for dispute letter generation:', letterData);

    // Call n8n webhook to generate dispute letter
    const n8nResponse = await fetch('https://learnlearnlearn.app.n8n.cloud/webhook/generate-dispute-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(letterData)
    });

    console.log('n8n response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', n8nResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate dispute letter' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await n8nResponse.json();
    console.log('Dispute letter generation result:', result);

    // Update analysis with letter URL if provided
    if (result.letter_url) {
      await supabase
        .from('bill_analyses')
        .update({ 
          dispute_letter_url: result.letter_url,
          dispute_letter_generated_at: new Date().toISOString()
        })
        .eq('id', analysis.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Dispute letter generation started',
        letter_url: result.letter_url,
        result
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-dispute-letter:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
