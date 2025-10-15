import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const uploadSchema = z.object({
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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    // Validate input
    const validation = uploadSchema.safeParse({ sessionId });
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!file || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or session ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing upload:', { fileName: file.name, fileType: file.type, sessionId });

    // Upload file to Supabase Storage with user folder
    const fileName = `${user.id}/${sessionId}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-bills')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
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
        user_id: user.id,
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
    console.log('Starting Lovable AI analysis for:', analysisId);
    
    // Step 1: Extract text from file using vision
    let billText = '';
    if (file.type.includes('pdf')) {
      billText = await extractPdfText(file);
    } else if (file.type.includes('image')) {
      billText = await extractImageText(file);
    } else {
      billText = await file.text();
    }

    console.log('Extracted text length:', billText.length);

    if (!billText || billText.length < 50) {
      throw new Error('Could not extract meaningful text from file');
    }

    // Step 2: Get user context from database
    const { data: analysisData } = await supabase
      .from('bill_analyses')
      .select('user_email, user_name')
      .eq('id', analysisId)
      .single();

    const userContext = {
      name: analysisData?.user_name,
      email: analysisData?.user_email,
      sessionId: sessionId
    };

    // Step 3: Call AI analysis function
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/analyze-bill-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        analysisId,
        billText,
        userContext
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI analysis error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    console.log('Lovable AI analysis completed successfully');

    // Step 4: Optionally trigger n8n for orchestration (email, PDF generation, etc.)
    // This is now optional - n8n can handle workflow orchestration while AI analysis stays in Lovable
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('analysis_id', analysisId);
      formData.append('analysis_complete', 'true');

      await fetch('https://learnlearnlearn.app.n8n.cloud/webhook/analysis-complete', {
        method: 'POST',
        body: formData
      });
      console.log('n8n orchestration webhook triggered');
    } catch (n8nError) {
      console.warn('n8n webhook failed but analysis completed:', n8nError);
    }

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