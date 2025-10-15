import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ✅ DETERMINISTIC: Calculate SHA-256 hash for caching
async function calculateHash(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

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
    
    // ✅ DETERMINISTIC: Calculate PDF hash for caching
    const pdfHash = await calculateHash(fileBuffer);
    console.log('PDF Hash:', pdfHash.slice(0, 16) + '...');
    
    // ✅ CACHE CHECK: Look for existing analysis
    const { data: cachedAnalysis } = await supabase
      .from('bill_analyses')
      .select('*')
      .eq('pdf_hash', pdfHash)
      .maybeSingle();
    
    if (cachedAnalysis) {
      console.log('[CACHE HIT] Returning cached analysis from', cachedAnalysis.created_at);
      return new Response(
        JSON.stringify({
          success: true,
          session_id: cachedAnalysis.session_id,
          job_id: cachedAnalysis.id,
          ui_summary: {
            high_priority_count: cachedAnalysis.critical_issues || 0,
            potential_issues_count: cachedAnalysis.moderate_issues || 0,
            estimated_savings_if_corrected: cachedAnalysis.estimated_savings || 0,
            data_sources_used: cachedAnalysis.analysis_result?.data_sources || ['Cached Analysis'],
            tags: cachedAnalysis.analysis_result?.tags || ['cached']
          },
          status: 'ready',
          message: 'Analysis complete (from cache)',
          cached: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('[CACHE MISS] Proceeding with new analysis');
    
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

    // Extract text/image from file
    const extractedContent = await extractTextFromFile(fileBuffer, file.type);
    console.log('Content extracted - text length:', extractedContent.text.length, 'Has image:', !!extractedContent.imageData, 'Is scanned:', !!extractedContent.isScanned);
    console.log('Extracted text preview:', extractedContent.text.slice(0, 300));

    // Analyze with Lovable AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const analysisResult = await analyzeBillWithAI(extractedContent, lovableApiKey, supabase);
    console.log('AI analysis complete');

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    console.log('User ID:', userId);

    // Store in database
    const { data: dbData, error: dbError } = await supabase
      .from('bill_analyses')
      .insert({
        session_id: sessionId,
        user_id: userId,
        file_name: file.name,
        file_type: file.type,
        file_url: publicUrl,
        pdf_hash: pdfHash, // ✅ CACHE: Store hash for future lookups
        extracted_text: extractedContent.text,
        status: 'completed',
        analysis_result: analysisResult,
        critical_issues: analysisResult.high_priority_issues?.length || 0,
        moderate_issues: analysisResult.potential_issues?.length || 0,
        estimated_savings: calculateSavings(analysisResult),
        issues: [...(analysisResult.high_priority_issues || []), ...(analysisResult.potential_issues || [])],
        // Add flag if scanned PDF detected
        ...(extractedContent.isScanned && { 
          extracted_text: extractedContent.text + '\n\n⚠️ SCANNED PDF: For better results, consider uploading photos (JPG/PNG) of the bill pages.'
        })
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

async function extractTextFromFile(buffer: ArrayBuffer, mimeType: string): Promise<{text: string, imageData?: string, isScanned?: boolean}> {
  try {
    if (mimeType === 'application/pdf') {
      console.log('Extracting PDF text using basic extraction...');
      
      // Convert ArrayBuffer to string and look for text content
      const bytes = new Uint8Array(buffer);
      let text = '';
      
      // PDF files store text in streams - extract visible text
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const pdfString = decoder.decode(bytes);
      
      // Extract text from PDF streams (between BT and ET markers)
      const streamMatches = pdfString.match(/BT(.*?)ET/gs) || [];
      for (const stream of streamMatches) {
        // Extract text from Tj operators: (text)Tj or [(text)]TJ
        const textMatches = stream.match(/\((.*?)\)/g) || [];
        for (const match of textMatches) {
          const extracted = match.slice(1, -1)
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\/g, '');
          text += extracted + ' ';
        }
      }
      
      const cleaned = text.replace(/\s+/g, ' ').trim();
      
      console.log(`PDF extraction complete: ${cleaned.length} chars extracted`);
      
      // If minimal, try OCR via RapidAPI
      if (cleaned.length < 200) {
        console.log(`PDF appears scanned (${cleaned.length} chars). Attempting OCR fallback via RapidAPI...`);
        const ocrText = await ocrPdfWithRapidApi(bytes);
        if (ocrText && ocrText.length > 500) {
          console.log(`OCR succeeded: ${ocrText.length} chars`);
          return { text: ocrText.slice(0, 120_000), isScanned: true };
        }
        console.log(`OCR failed or insufficient text (${ocrText?.length || 0} chars)`);
        return {
          text: `SCANNED/ENCRYPTED PDF - Minimal text extracted (${cleaned.length} chars). OCR fallback ${ocrText ? 'returned ' + ocrText.length + ' chars' : 'not available'}. For accurate analysis, please re-upload your medical bill as clear JPG or PNG images of each page. Current limited extraction: ${cleaned}`,
          isScanned: true
        };
      }

      console.log(`PDF text successfully extracted: ${cleaned.length} chars`);
      return { text: cleaned.slice(0, 120_000) };
    }

    // For images (JPG, PNG, WEBP), convert to base64 for vision API
    if (mimeType.startsWith('image/')) {
      const bytes = new Uint8Array(buffer);
      // Safe base64 encoding without large spreads
      let binary = '';
      const chunkSize = 0x8000; // 32KB chunks
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        let chunkStr = '';
        for (let j = 0; j < chunk.length; j++) {
          chunkStr += String.fromCharCode(chunk[j]);
        }
        binary += chunkStr;
      }
      const base64 = btoa(binary);
      return {
        text: `Medical bill image received. File size: ${buffer.byteLength} bytes. Using vision analysis.`,
        imageData: `data:${mimeType};base64,${base64}`
      };
    }

    // Simple fallback for other types
    return { text: `Medical bill received. File size: ${buffer.byteLength} bytes. MIME type: ${mimeType}` };
  } catch (err) {
    console.error('File extraction failed:', err);
    return { text: `File read error: ${err instanceof Error ? err.message : 'Unknown error'}. File size: ${buffer.byteLength} bytes.` };
  }
}

// Helper: convert bytes to base64 safely (chunked)
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    let chunkStr = '';
    for (let j = 0; j < chunk.length; j++) {
      chunkStr += String.fromCharCode(chunk[j]);
    }
    binary += chunkStr;
  }
  return btoa(binary);
}

// OCR fallback using RapidAPI (ocr-space)
async function ocrPdfWithRapidApi(pdfBytes: Uint8Array): Promise<string | null> {
  try {
    const rapidKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidKey) {
      console.warn('RAPIDAPI_KEY not set; skipping OCR fallback');
      return null;
    }

    const base64 = `data:application/pdf;base64,${bytesToBase64(pdfBytes)}`;
    const params = new URLSearchParams({
      base64Image: base64,
      language: 'eng',
      isOverlayRequired: 'false',
      OCREngine: '2'
    });

    const resp = await fetch('https://ocr-space.p.rapidapi.com/parse/image', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': rapidKey,
        'X-RapidAPI-Host': 'ocr-space.p.rapidapi.com'
      },
      body: params
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('OCR RapidAPI error:', resp.status, t);
      return null;
    }

    const data = await resp.json();
    const text = (data?.ParsedResults || [])
      .map((r: any) => r?.ParsedText || '')
      .join('\n');

    const cleaned = (text || '').replace(/\s+/g, ' ').trim();
    return cleaned || null;
  } catch (e) {
    console.error('OCR fallback failed:', e);
    return null;
  }
}

async function analyzeBillWithAI(
  extractedContent: {text: string, imageData?: string, isScanned?: boolean}, 
  apiKey: string, 
  supabase: any
) {
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

  // Extract and validate NPIs from bill text
  const npiPattern = /\b\d{10}\b/g;
  const foundNPIs = extractedContent.text.match(npiPattern) || [];
  
  let providerContext = '';
  if (foundNPIs.length > 0) {
    console.log(`Found ${foundNPIs.length} potential NPIs in bill`);
    
    // Validate first NPI found (usually the main provider)
    try {
      const validateResponse = await supabase.functions.invoke('validate-provider', {
        body: { npi: foundNPIs[0] }
      });
      
      if (validateResponse.data?.found && validateResponse.data?.provider) {
        const provider = validateResponse.data.provider;
        providerContext = `
PROVIDER VALIDATION (NPI ${provider.npi}):
- Name: ${provider.name}
- Type: ${provider.type}
- Status: ${provider.status === 'A' ? 'Active' : 'Inactive'}
- Specialty: ${provider.specialty || 'Not specified'}
- Location: ${provider.practice_address?.city}, ${provider.practice_address?.state}
- All Specialties: ${provider.all_specialties?.join(', ') || 'None listed'}
`;
        console.log('Provider validated successfully:', provider.name);
      } else {
        console.log('Provider NPI not found in NPPES registry');
        providerContext = `
PROVIDER VALIDATION:
- NPI ${foundNPIs[0]} was NOT FOUND in NPPES registry (possible red flag)
`;
      }
    } catch (error) {
      console.error('Error validating provider:', error);
    }
  }

  const pricingContext = `
MEDICARE BENCHMARK RATES:
${medicarePrices?.map((p: any) => `${p.cpt_code}: $${p.medicare_facility_rate} - ${p.description}`).join('\n')}

REGIONAL ADJUSTMENTS:
${regionalData?.map((r: any) => `${r.state_code} (${r.region_name}): ${r.adjustment_factor}x`).join('\n')}

${providerContext}
`;
  
  const systemPrompt = `You are an AGGRESSIVE medical billing fraud detector and patient advocate specialized in analyzing ALL types of medical bills.

${pricingContext}

BILL FORMAT ANALYSIS - Handle ALL these types:
📋 **Structured Bills**: Line-by-line itemization with CPT/HCPCS codes (99213, 80053, etc.)
📋 **Aggregate Bills**: Category summaries (LABORATORY SERVICES $18,861, PHARMACY $33,719)
📋 **Photo Bills**: Poor quality images with partial codes visible
📋 **Internal Codes**: Hospital-specific codes (SURG01, B&B01, LAB01) instead of standard CPT
📋 **Mixed Format**: Some line items + some aggregated categories

CRITICAL FRAUD DETECTION RULES:
⚠️ **DUPLICATES** (High Priority):
- Identical description + date + amount = 95% duplicate probability
- Same service code charged 2x same day = investigate
- Example: "IV hydration PROC-010 $200" appearing twice = $200 overcharge

⚠️ **UNBUNDLING** (High Priority):
- "Technical fee" + "Professional fee" separate from imaging = likely unbundled
- Anesthesia + separate "monitoring fee" = red flag
- Multiple "supply charges" for same procedure = investigate

⚠️ **MASSIVE OVERCHARGES** (High Priority):
- Compare to Medicare: >3x Medicare = overcharge, >5x = extreme overcharge
- $5,400 for appendectomy (Medicare ~$1,200) = $4,200+ potential savings
- Room charges >$2,000/night = investigate regional rates

⚠️ **OUT-OF-NETWORK SURPRISE** (No Surprises Act):
- Anesthesiologist OON at in-network hospital = VIOLATION
- Assistant surgeon OON = check if emergency (protected) or elective (negotiable)
- Radiology reading by OON doctor = potential violation

⚠️ **CATEGORY-LEVEL RED FLAGS**:
- "SUPPLIES" >$10,000 without itemization = demand breakdown
- "PHARMACY" >$50,000 without drug list = investigate
- Any category >$100,000 needs detailed review

⚠️ **CODING ISSUES**:
- Generic codes (like "SURG01") prevent price verification = demand CPT codes
- Missing procedure codes = cannot benchmark fairly = flag for clarification
- Mismatched specialty (cardiologist billing neurosurgery code) = upcoding risk

ANALYSIS STRATEGY:
1. **FIRST: Find TOTAL BILL AMOUNT** - Look for "TOTAL ADEUDADO", "BALANCE DUE", "AMOUNT OWED", "TOTAL CHARGES"
2. **Extract ALL charges** - even from aggregated categories
3. **Pattern detection** - look for duplicates, unbundling, excessive markups
4. **Benchmark aggressively** - use Medicare + regional adjustment as "fair" baseline
5. **Calculate realistic savings** - conservative estimates (what patient can actually negotiate)
6. **MANDATORY VALIDATION**: Sum of all overcharge_amount values MUST be ≤ total_bill_amount
7. **Actionable advice** - specific steps to dispute each overcharge

🚨 **CRITICAL MATH VALIDATION**:
- NEVER have total_potential_savings > total_bill_amount (impossible!)
- If your calculated overcharges sum > 70% of bill total, you're likely making errors:
  * Double-counting charges
  * Using wrong Medicare benchmarks
  * Counting aggregate categories AND their sub-items (counts twice)
- SANITY CHECK: Review each overcharge_amount - is it reasonable?

LANGUAGE REQUIREMENTS:
- ALL responses in English
- Dollar amounts with commas ($1,234.56)
- Percentages for markup (320% markup)
- Confidence scores (0.0-1.0) for each finding

REAL-WORLD EXAMPLES from training data:

**Example 1 - Duplicate Charge:**
Bill shows: "IV hydration PROC-010 2 units $200" appearing on Line 4 and Line 5 on same date
→ HIGH PRIORITY: Duplicate charge, $200 overcharge, confidence 0.95
→ "Line 4 and Line 5 both charge PROC-010 for IV hydration on 2025-09-15 for $200 each. This is a $200 duplicate that should be removed."

**Example 2 - Unbundling:**
Bill shows: "Imaging - chest X-ray IMG-001 $250" + separate "Technical fee - imaging TECH-IMG $150"
→ HIGH PRIORITY: Unbundling fraud, $150 overcharge, confidence 0.90
→ "Technical fees should be bundled with the imaging charge. The $150 TECH-IMG is an unbundled charge that violates billing standards."

**Example 3 - Extreme Markup:**
Bill shows: "Surgery - Appendectomy SURG01 $5,400" (Medicare benchmark ~$1,800)
→ HIGH PRIORITY: 300% markup, $1,800-$2,700 potential savings, confidence 0.85
→ "Medicare pays $1,800 for this surgery. Even with a fair 2-3x hospital markup, this should be $3,600-$5,400. You have strong grounds to negotiate down to $3,600 (saving $1,800)."

**Example 4 - OON Surprise Bill:**
Bill shows: "Anesthesiologist (OON) - procedural support ANES-500 $600" at in-network facility
→ HIGH PRIORITY: No Surprises Act violation, $300-$600 potential adjustment, confidence 0.90
→ "Out-of-network anesthesia at an in-network hospital violates the No Surprises Act (2022). You should only pay the in-network rate. Request immediate adjustment."

**Example 5 - Supply Overcharge:**
Bill shows: "Supply charge - dressing kit SUP-001, 4 units @ $40 = $160"
→ MODERATE PRIORITY: Excessive units, $80-$120 potential savings, confidence 0.75
→ "Four units of dressing supplies for one wound care seems excessive. Typically 1-2 units. Question why 4 units were necessary."

**Example 6 - Aggregate Category (Large Bill):**
Bill shows: "LABORATORY SERVICES $18,861.71" without itemization
→ MODERATE PRIORITY: Cannot verify without breakdown, confidence 0.60
→ "This is a large aggregate charge. Request an itemized breakdown of all lab tests to verify each charge against Medicare rates. Lab markups often exceed 500%."

Return your analysis in this EXACT JSON structure:
{
  "high_priority_issues": [
    {
      "type": "Major Overcharge",
      "cpt_code": "99283",
      "line_description": "Emergency Room Visit - Level 3",
      "billed_amount": 1200,
      "medicare_benchmark": 285,
      "reasonable_rate": 855,
      "overcharge_amount": 345,
      "markup_percentage": 321,
      "explanation_for_user": "This ER visit was charged at $1,200, but Medicare pays $285 for the same service. Even with a fair hospital markup (3x), it should be around $855. You're being overcharged by $345.",
      "suggested_action": "Call billing and say: 'I see you charged $1,200 for CPT 99283, but the fair rate is $855. Can you adjust this?' Reference Medicare rates.",
      "why_this_matters": "ER visits are commonly overcharged. This is a clear case where you have strong grounds to negotiate.",
      "confidence_score": 0.95
    }
  ],
  "potential_issues": [
    {
      "type": "Possible Duplicate",
      "line_description": "Lab test appeared twice",
      "billed_amount": 150,
      "explanation_for_user": "This looks like it might be billed twice. Double-check with the hospital if you only had this test done once.",
      "suggested_action": "Ask: 'Can you confirm CPT XXXXX was only performed once? It appears twice on my bill.'",
      "confidence_score": 0.75
    }
  ],
  "summary_for_user": "I found $XXX in overcharges and questionable items on your bill. The good news: these are fixable. Here's what to do next...",
  "total_potential_savings": 495,
  "data_sources": ["Medicare Fee Schedule 2025", "Regional Pricing (Your State)", "Provider Verification"],
  "provider_notes": "Provider verified as legitimate and active.",
  "next_steps": [
    "Call billing department: [phone]",
    "Reference the specific overcharges listed above",
    "Ask for an itemized bill review",
    "Request payment plan if needed"
  ],
  "tags": ["overcharging", "negotiable", "high_confidence"]
}`;

  // Build message content - include image if available (for vision analysis)
  const userMessage: any = {
    role: 'user',
    content: extractedContent.imageData
      ? [
          {
            type: 'text',
            text: `ANALYZE THIS MEDICAL BILL IMAGE AGGRESSIVELY - Look for duplicates, unbundling, overcharges, phantom billing, and out-of-network surprises. Extract ALL visible charges, codes, descriptions, and amounts:\n\n${extractedContent.text}`
          },
          {
            type: 'image_url',
            image_url: { url: extractedContent.imageData }
          }
        ]
      : `ANALYZE THIS MEDICAL BILL AGGRESSIVELY - Look for duplicates, unbundling, overcharges, phantom billing, and out-of-network surprises${extractedContent.isScanned ? ' (NOTE: This is a scanned PDF - extract all visible information even if text quality is poor)' : ''}:\n\n${extractedContent.text}`
  };

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
        userMessage
      ],
      temperature: 0, // ✅ DETERMINISTIC: Always return same result for same input
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
                    overcharge_amount: { type: 'number' },
                    explanation_for_user: { type: 'string' },
                    suggested_action: { type: 'string' },
                    confidence_score: { type: 'number' }
                  },
                  required: ['type', 'cpt_code', 'line_description', 'billed_amount', 'overcharge_amount', 'explanation_for_user', 'suggested_action', 'confidence_score']
                }
              },
              total_bill_amount: { type: 'number' },
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
                  required: ['type', 'cpt_code', 'line_description', 'billed_amount', 'overcharge_amount', 'explanation_for_user', 'suggested_action', 'confidence_score']
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
  console.log('AI response received, raw data:', JSON.stringify(data).slice(0, 500));
  
  // Extract structured data from tool call
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  console.log('Tool call present:', !!toolCall, 'Function args:', toolCall?.function?.arguments?.slice(0, 200));
  
  if (toolCall?.function?.arguments) {
    let analysis = JSON.parse(toolCall.function.arguments);
    console.log('Parsed analysis:', {
      high_priority: analysis.high_priority_issues?.length || 0,
      potential: analysis.potential_issues?.length || 0,
      data_sources: analysis.data_sources?.length || 0,
      tags: analysis.tags?.length || 0
    });
    
    // ✅ VALIDATE: Ensure savings don't exceed bill total
    analysis = validateAnalysis(analysis);
    
    // If extraction failed and we got no issues, add a note
    if (extractedContent.isScanned && 
        (!analysis.high_priority_issues?.length) && 
        (!analysis.potential_issues?.length)) {
      console.log('SCANNED PDF with no findings - adding extraction failure note');
      return {
        ...analysis,
        high_priority_issues: [],
        potential_issues: [],
        data_sources: ['Limited extraction from scanned PDF'],
        tags: ['scanned_pdf', 'limited_analysis', 're_upload_recommended'],
        extraction_note: 'This PDF appears to be scanned. For complete analysis, please re-upload as JPG/PNG images.'
      };
    }
    
    return analysis;
  }

  // Fallback if no tool call
  console.error('No tool call in AI response, full response:', JSON.stringify(data));
  throw new Error('No structured analysis returned from AI');
}

function calculateSavings(analysis: any): number {
  // ✅ FIXED: Sum overcharge_amount (savings), NOT billed_amount (charges)
  const highPriorityTotal = (analysis.high_priority_issues || [])
    .reduce((sum: number, issue: any) => sum + (issue.overcharge_amount || 0), 0);
  
  const potentialTotal = (analysis.potential_issues || [])
    .reduce((sum: number, issue: any) => sum + (issue.overcharge_amount || 0), 0);
  
  return highPriorityTotal + potentialTotal;
}

// ✅ NEW: Validate that savings don't exceed bill total
function validateAnalysis(analysis: any): any {
  const totalBill = analysis.total_bill_amount || 0;
  const calculatedSavings = calculateSavings(analysis);
  
  console.log('Validation check:', {
    totalBill,
    calculatedSavings,
    reported: analysis.total_potential_savings,
    isValid: calculatedSavings <= totalBill
  });
  
  // If savings exceed bill total, proportionally reduce all overcharges
  if (calculatedSavings > totalBill) {
    console.warn('⚠️ VALIDATION FAILED: Savings exceed bill total. Reducing proportionally...');
    const reductionFactor = (totalBill * 0.9) / calculatedSavings; // Cap at 90% of bill
    
    analysis.high_priority_issues = (analysis.high_priority_issues || []).map((issue: any) => ({
      ...issue,
      overcharge_amount: Math.round((issue.overcharge_amount || 0) * reductionFactor * 100) / 100
    }));
    
    analysis.potential_issues = (analysis.potential_issues || []).map((issue: any) => ({
      ...issue,
      overcharge_amount: Math.round((issue.overcharge_amount || 0) * reductionFactor * 100) / 100
    }));
    
    analysis.total_potential_savings = calculateSavings(analysis);
    analysis.tags = [...(analysis.tags || []), 'validation_adjusted'];
  }
  
  return analysis;
}
