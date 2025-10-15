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
    console.log('Starting bill analysis with Lovable AI...');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('File received:', file.name, file.type, file.size);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique session ID
    const sessionId = crypto.randomUUID();
    console.log('Session ID:', sessionId);

    // Upload file to Supabase Storage
    const fileName = `${sessionId}/${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-bills')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    console.log('File uploaded to storage:', fileName);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('medical-bills')
      .getPublicUrl(fileName);

    // Extract text from PDF (simplified - in production use proper PDF parser)
    const textContent = await extractTextFromFile(fileBuffer, file.type);
    console.log('Text extracted, length:', textContent.length);

    // Analyze with Lovable AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const analysisResult = await analyzeBillWithAI(textContent, lovableApiKey, supabase);
    console.log('AI analysis complete');

    // Store in database
    const { data: dbData, error: dbError } = await supabase
      .from('bill_analyses')
      .insert({
        session_id: sessionId,
        file_name: file.name,
        file_type: file.type,
        file_url: publicUrl,
        extracted_text: textContent,
        status: 'completed',
        analysis_result: analysisResult,
        critical_issues: analysisResult.high_priority_issues?.length || 0,
        moderate_issues: analysisResult.potential_issues?.length || 0,
        estimated_savings: calculateSavings(analysisResult),
        issues: [...(analysisResult.high_priority_issues || []), ...(analysisResult.potential_issues || [])]
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to store analysis: ${dbError.message}`);
    }

    console.log('Analysis stored in database');

    // Return response matching n8n format
    return new Response(
      JSON.stringify({
        success: true,
        session_id: sessionId,
        job_id: dbData.id,
        ui_summary: {
          high_priority_count: analysisResult.high_priority_issues?.length || 0,
          potential_issues_count: analysisResult.potential_issues?.length || 0,
          estimated_savings_if_corrected: calculateSavings(analysisResult),
          data_sources_used: analysisResult.data_sources || ['Lovable AI Analysis'],
          tags: analysisResult.tags || []
        },
        status: 'ready',
        message: 'Analysis complete'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-bill-lovable:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function extractTextFromFile(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  // For PDFs, we'd use a proper PDF parser
  // For now, return a simple text representation
  // In production, integrate with a PDF parsing library or service
  
  if (mimeType === 'application/pdf') {
    // TODO: Implement proper PDF text extraction
    // For now, return placeholder that triggers AI to request better data
    return `PDF file received. File size: ${buffer.byteLength} bytes. Please analyze the medical bill structure.`;
  }
  
  // For images, return metadata
  return `Medical bill image received. File size: ${buffer.byteLength} bytes. MIME type: ${mimeType}`;
}

async function analyzeBillWithAI(textContent: string, apiKey: string, supabase: any) {
  console.log('Calling Lovable AI with pricing data...');
  
  // Fetch Medicare pricing data
  const { data: medicarePrices } = await supabase
    .from('medicare_prices')
    .select('cpt_code, description, medicare_facility_rate')
    .limit(100);

  // Fetch regional adjustments
  const { data: regionalData } = await supabase
    .from('regional_pricing')
    .select('*')
    .limit(50);

  const pricingContext = `
MEDICARE BENCHMARK RATES:
${medicarePrices?.map((p: any) => `${p.cpt_code}: $${p.medicare_facility_rate} - ${p.description}`).join('\n')}

REGIONAL ADJUSTMENTS:
${regionalData?.map((r: any) => `${r.state_code} (${r.region_name}): ${r.adjustment_factor}x`).join('\n')}
`;
  
  const systemPrompt = `You are an expert medical billing auditor with access to Medicare benchmark pricing data. Analyze the medical bill and identify billing errors, overcharges, and issues.

${pricingContext}

IMPORTANT INSTRUCTIONS:
- Compare each charge to Medicare rates (typical hospital markup is 2-3x Medicare)
- Flag charges >3x Medicare rate as HIGH PRIORITY overcharges
- Calculate exact overcharge amounts: (Billed Amount - Reasonable Rate)
- Use regional adjustments when available

Return your analysis in this EXACT JSON structure:
{
  "high_priority_issues": [
    {
      "type": "Excessive Markup",
      "cpt_code": "99283",
      "line_description": "ER visit level 3",
      "billed_amount": 1200,
      "medicare_benchmark": 285,
      "reasonable_rate": 855,
      "overcharge_amount": 345,
      "markup_percentage": 321,
      "explanation_for_user": "Charged 4.2x Medicare rate. Typical is 2-3x.",
      "suggested_action": "Request reduction to reasonable rate of $855 (3x Medicare)",
      "confidence_score": 0.95
    }
  ],
  "potential_issues": [...],
  "data_sources": ["Medicare Fee Schedule", "Regional Pricing Data"],
  "tags": ["overcharging", "excessive_markup"]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this medical bill:\n\n${textContent}` }
      ],
      temperature: 0, // CRITICAL: Ensures consistent results
      tools: [{
        type: 'function',
        function: {
          name: 'return_bill_analysis',
          description: 'Return the structured medical bill analysis',
          parameters: {
            type: 'object',
            properties: {
              high_priority_issues: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    cpt_code: { type: 'string' },
                    line_description: { type: 'string' },
                    billed_amount: { type: 'number' },
                    explanation_for_user: { type: 'string' },
                    suggested_action: { type: 'string' },
                    confidence_score: { type: 'number' }
                  },
                  required: ['type', 'cpt_code', 'line_description', 'billed_amount', 'explanation_for_user', 'suggested_action', 'confidence_score']
                }
              },
              potential_issues: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    cpt_code: { type: 'string' },
                    line_description: { type: 'string' },
                    billed_amount: { type: 'number' },
                    medicare_benchmark: { type: 'number' },
                    reasonable_rate: { type: 'number' },
                    overcharge_amount: { type: 'number' },
                    markup_percentage: { type: 'number' },
                    explanation_for_user: { type: 'string' },
                    suggested_action: { type: 'string' },
                    confidence_score: { type: 'number' }
                  },
                  required: ['type', 'cpt_code', 'line_description', 'billed_amount', 'explanation_for_user', 'suggested_action', 'confidence_score']
                }
              },
              data_sources: {
                type: 'array',
                items: { type: 'string' }
              },
              tags: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['high_priority_issues', 'potential_issues', 'data_sources', 'tags']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'return_bill_analysis' } }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('AI response received');
  
  // Extract structured data from tool call
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Parsed analysis:', {
      high_priority: analysis.high_priority_issues?.length,
      potential: analysis.potential_issues?.length
    });
    return analysis;
  }

  throw new Error('No structured analysis returned from AI');
}

function calculateSavings(analysis: any): number {
  const highPriorityTotal = (analysis.high_priority_issues || [])
    .reduce((sum: number, issue: any) => sum + (issue.billed_amount || 0), 0);
  
  const potentialTotal = (analysis.potential_issues || [])
    .reduce((sum: number, issue: any) => sum + (issue.billed_amount || 0), 0);
  
  return highPriorityTotal + potentialTotal;
}
