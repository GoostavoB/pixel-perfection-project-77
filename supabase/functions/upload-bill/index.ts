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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or session ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing upload:', { fileName: file.name, fileType: file.type, sessionId });

    // Upload file to storage
    const fileName = `${sessionId}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-bills')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('medical-bills')
      .getPublicUrl(fileName);

    // Create initial analysis record
    const { data: analysisData, error: dbError } = await supabase
      .from('bill_analyses')
      .insert({
        session_id: sessionId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        status: 'processing'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create analysis record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Upload successful, starting analysis...');

    // Start background analysis (don't await)
    analyzeBill(supabase, analysisData.id, file, sessionId).catch(console.error);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId,
        analysisId: analysisData.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in upload-bill:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeBill(supabase: any, analysisId: string, file: File, sessionId: string) {
  try {
    console.log('Starting n8n analysis for:', analysisId);
    
    // Send to n8n webhook for analysis
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);
    formData.append('file_name', file.name);
    formData.append('analysis_id', analysisId);

    console.log('Sending to n8n webhook with data:', { 
      session_id: sessionId, 
      file_name: file.name,
      analysis_id: analysisId 
    });

    const n8nResponse = await fetch('https://learnlearnlearn.app.n8n.cloud/webhook/upload-bill', {
      method: 'POST',
      body: formData
    });

    console.log('n8n webhook response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', n8nResponse.status, errorText);
      throw new Error(`n8n webhook failed: ${n8nResponse.status}`);
    }

    // Try to parse response, but handle empty responses
    const responseText = await n8nResponse.text();
    console.log('n8n raw response:', responseText);
    
    let n8nResult;
    if (responseText && responseText.trim()) {
      try {
        n8nResult = JSON.parse(responseText);
        console.log('n8n analysis complete:', JSON.stringify(n8nResult));
      } catch (parseError) {
        console.warn('Could not parse n8n response as JSON:', responseText);
        n8nResult = { success: true };
      }
    } else {
      console.warn('Empty response from n8n, assuming success');
      n8nResult = { success: true };
    }

    // Map n8n results to our database schema
    const uiSummary = n8nResult.ui_summary || {};
    const mappedAnalysis = {
      summary: {
        critical_issues: uiSummary.high_priority_count || 0,
        moderate_issues: uiSummary.potential_issues_count || 0,
        estimated_savings: uiSummary.estimated_savings_if_corrected || 0,
        total_overcharges: uiSummary.estimated_savings_if_corrected || 0,
      },
      issues: [],
      hospital_name: n8nResult.hospital_name || uiSummary.hospital_name || '',
      data_sources: uiSummary.data_sources_used || [],
      tags: uiSummary.tags || [],
      created_at: n8nResult.created_at || new Date().toISOString(),
      email_sent: n8nResult.email_sent || false
    };

    // Update with final results
    await supabase
      .from('bill_analyses')
      .update({
        status: 'completed',
        analysis_result: mappedAnalysis,
        critical_issues: mappedAnalysis.summary.critical_issues,
        moderate_issues: mappedAnalysis.summary.moderate_issues,
        estimated_savings: mappedAnalysis.summary.estimated_savings,
        total_overcharges: mappedAnalysis.summary.total_overcharges,
        issues: mappedAnalysis.issues
      })
      .eq('id', analysisId);

    console.log('Analysis completed successfully for:', analysisId);
  } catch (error) {
    console.error('Error in analyzeBill:', error);
    await supabase
      .from('bill_analyses')
      .update({ 
        status: 'error',
        analysis_result: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      .eq('id', analysisId);
  }
}

async function extractPdfText(file: File): Promise<string> {
  // For PDF extraction, we'll use a simple approach for now
  // In production, you'd want to use pdf-parse or similar
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(arrayBuffer);
  
  // Extract text between BT and ET markers (simple PDF text extraction)
  const matches = text.match(/\(([^)]+)\)/g);
  if (matches) {
    return matches.map(m => m.slice(1, -1)).join(' ');
  }
  
  return 'PDF text extraction requires additional processing';
}

async function extractImageText(file: File): Promise<string> {
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
    const dataUrl = `data:${file.type};base64,${base64}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this medical bill image. Return the complete text exactly as it appears, maintaining structure and layout.'
              },
              {
                type: 'image_url',
                image_url: { url: dataUrl }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Vision API error:', response.status, await response.text());
      return 'Failed to extract text from image';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Error in extractImageText:', error);
    return 'Error extracting text from image';
  }
}

async function analyzeBillWithAI(billText: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

  const systemPrompt = `You are an expert medical billing auditor. Analyze the provided medical bill for:
1. Billing errors (duplicate charges, incorrect coding, unbundling)
2. Overcharges (charges above reasonable rates, inflated fees)
3. Scam indicators (fake charges, phantom services)
4. Compliance issues (No Surprises Act violations, balance billing)

Return your analysis in this exact JSON format:
{
  "critical_issues": number,
  "moderate_issues": number,
  "estimated_savings": number,
  "total_overcharges": number,
  "issues": [
    {
      "category": "string (Billing Error, Overcharge, Compliance, Scam)",
      "finding": "string (brief description)",
      "severity": "critical" | "moderate" | "low",
      "impact": "$X.XX",
      "cpt_code": "string or null",
      "description": "string (detailed explanation)",
      "details": "string (why this is an issue and how to address it)"
    }
  ],
  "summary": "string (overall assessment)"
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this medical bill:\n\n${billText}` }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  return JSON.parse(content || '{}');
}