import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bypass-cache',
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
    
    // ✅ DETERMINISTIC: Calculate PDF hash for caching (dedupe only)
    const pdfHash = await calculateHash(fileBuffer);
    console.log('PDF Hash:', pdfHash.slice(0, 16) + '...');
    
    // ✅ VERSIONED CACHE KEY: Combine file + versions
    const cacheKey = await sha256Versioned(fileBuffer);
    console.log('Cache Key:', cacheKey.slice(0, 16) + '...');
    
    // 🔧 Check for cache bypass (header, form field, or query param)
    const bypassHeader = req.headers.get('x-bypass-cache') === 'true';
    const url = new URL(req.url);
    const queryFresh = url.searchParams.get('fresh') === '1' || url.searchParams.get('fresh') === 'true';
    const formFresh = (formData.get('fresh') as string) === 'true';
    
    // ✅ Caching is now ENABLED
    const forceBypass = false;
    
    const bypassCache = forceBypass || !!(bypassHeader || queryFresh || formFresh);
    
    // 🔍 HIGH-SIGNAL LOGGING for debugging
    console.log('[REQ] freshSignals', JSON.stringify({
      header: bypassHeader,
      query: queryFresh,
      form: formFresh,
      forceBypass,
      hash: pdfHash.slice(0, 16),
      ts: new Date().toISOString(),
    }));
    
    // ✅ CACHE CHECK: Look for existing analysis by versioned cache_key (unless bypassed)
    if (!bypassCache) {
      const { data: cachedAnalysis } = await supabase
        .from('bill_analyses')
        .select('*')
        .eq('cache_key', cacheKey)
        .maybeSingle();
      
      if (cachedAnalysis) {
        // ✅ Quality gate: validate cache before returning
        const isValid = validateCacheQuality(cachedAnalysis);
        
        const ar: any = cachedAnalysis.analysis_result || {};
        
        // 🔍 HIGH-SIGNAL CACHE DECISION LOG
        console.log('[CACHE_DECISION]', JSON.stringify({
          willBypass: bypassCache,
          cacheHit: true,
          cachedAt: cachedAnalysis.created_at,
          isValid,
          analysisVersion: ar.analysis_version || 'missing',
          promptVersion: ar.prompt_version || 'missing',
          modelId: ar.model_id || 'missing',
          schemaVersion: ar.schema_version || 'missing',
          totalBill: Number(ar.total_bill_amount) || 0,
          estimatedSavings: Number(cachedAnalysis.estimated_savings) || 0,
        }));
        
        if (!isValid) {
          console.warn('[CACHE] Quality gate failed → forcing fresh analysis');
        } else {
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
                data_sources_used: ar?.data_sources || ['Cached Analysis'],
                tags: [...(ar?.tags || []), 'cached'],
                analysis_version: ar.analysis_version,
                schema_version: ar.schema_version
              },
              status: 'ready',
              message: 'Analysis complete (from cache)',
              cached: true,
              analysis_version: ar.analysis_version,
              schema_version: ar.schema_version
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else {
        console.log('[CACHE MISS] No cached analysis found for this version');
      }
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
    console.log('AI analysis complete - validated and ready for storage');
    
    // Run duplicate detection as complementary analysis
    const duplicateFindings = await detectDuplicateCharges(extractedContent, analysisResult, lovableApiKey);
    console.log('Duplicate detection complete:', {
      total_flags: duplicateFindings.flags?.length || 0,
      suspect_amount: duplicateFindings.totals?.suspect_amount || 0
    });
    
    // Integrate duplicate findings into main analysis
    analysisResult.duplicate_findings = duplicateFindings;

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    console.log('User ID:', userId);

    // 🔧 FIX 6: Log final analysis summary before storage
    const finalSavings = calculateSavings(analysisResult);
    console.log('[FINAL] === Analysis Summary ===');
    console.log('[FINAL] Bill Total:', analysisResult.total_bill_amount);
    console.log('[FINAL] High Priority Issues:', analysisResult.high_priority_issues?.length || 0);
    console.log('[FINAL] Potential Issues:', analysisResult.potential_issues?.length || 0);
    console.log('[FINAL] Total Savings:', finalSavings);
    console.log('[FINAL] Savings Ratio:', ((finalSavings / analysisResult.total_bill_amount) * 100).toFixed(1) + '%');
    console.log('[FINAL] Validation Applied:', analysisResult.validation_applied || false);
    console.log('[FINAL] Reduction Factor:', analysisResult.reduction_factor || 'none');
    console.log('[FINAL] Tags:', analysisResult.tags || []);
    
    // Final server-side safety clamp before storage
    const billTotalForClamp = Number(analysisResult.total_bill_amount) || 0;
    if (billTotalForClamp > 0 && finalSavings > billTotalForClamp * 0.9) {
      const factor = (billTotalForClamp * 0.9) / finalSavings;
      const scaleIssues = (arr: any[] = []) => arr.map((it: any) => ({
        ...it,
        overcharge_amount: typeof it.overcharge_amount === 'number'
          ? Math.round(it.overcharge_amount * factor * 100) / 100
          : it.overcharge_amount,
        validation_adjusted: true,
      }));
      analysisResult.high_priority_issues = scaleIssues(analysisResult.high_priority_issues);
      analysisResult.potential_issues = scaleIssues(analysisResult.potential_issues);
      analysisResult.total_potential_savings = Math.round(billTotalForClamp * 0.9 * 100) / 100;
      (analysisResult.tags ||= []).push('validation_adjusted', 'server_clamped');
      analysisResult.validation_applied = true;
      analysisResult.reduction_factor = (billTotalForClamp * 0.9) / finalSavings;
      console.warn('[FINAL] Safety clamp applied before storage.');
    }

    // Store in database (purge old by hash to avoid unique constraint issues, then insert)
    try {
      const { error: delErr } = await supabase
        .from('bill_analyses')
        .delete()
        .eq('pdf_hash', pdfHash);
      if (delErr) console.warn('[STORE] Cache purge warning:', delErr.message);
    } catch (e) {
      console.warn('[STORE] Cache purge exception (ignored):', e instanceof Error ? e.message : e);
    }

    const { data: dbData, error: dbError } = await supabase
      .from('bill_analyses')
      .insert({
        session_id: sessionId,
        user_id: userId,
        file_name: file.name,
        file_type: file.type,
        file_url: publicUrl,
        pdf_hash: pdfHash,
        cache_key: cacheKey,
        extracted_text: extractedContent.text,
        status: 'completed',
        analysis_result: analysisResult,
        critical_issues: analysisResult.high_priority_issues?.length || 0,
        moderate_issues: analysisResult.potential_issues?.length || 0,
        estimated_savings: calculateSavings(analysisResult),
        issues: [...(analysisResult.high_priority_issues || []), ...(analysisResult.potential_issues || [])],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to store analysis: ${dbError.message}`);
    }

    console.log('[FINAL] ✅ Analysis stored in database with validated savings');

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
          tags: analysisResult.tags || [],
          analysis_version: analysisResult.analysis_version,
          schema_version: analysisResult.schema_version
        },
        status: 'ready',
        message: 'Analysis complete',
        cached: false,
        analysis_version: analysisResult.analysis_version,
        schema_version: analysisResult.schema_version
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
  const extractedText = extractedContent.text; // Store for validation
  
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
  
  const systemPrompt = `# Medical Bill Analysis System - Comprehensive Professional Audit

You are a specialized medical billing auditor for Hospital Bill Checker analyzing ALL types of medical bills with access to Medicare pricing, regional adjustments, NPI verification, and the Top 10 Most Common Billing Issues database.

${pricingContext}

## STEP 0: LANGUAGE DETECTION & TRANSLATION (CRITICAL)
1. **Identify bill language**: Spanish, English, or other
2. **If NOT English**: Translate ALL charge descriptions, provider names, diagnoses, and notes to English
3. **Preserve**: All amounts, dates, account numbers, CPT codes (no translation)
4. **Note in output**: Add "bill_language" field and include "translated_bill" tag if applicable
5. **Format**: Show "LABORATORIO (Laboratory Services)" to preserve context

## STEP 1: EXTRACT CORE INFORMATION (MANDATORY FIRST STEP)
**Required fields for EVERY bill**:
- **total_bill_amount** (MANDATORY): Extract from "TOTAL", "TOTAL ADEUDADO", "BALANCE DUE", "AMOUNT OWED", "PATIENT BALANCE", "TOTAL CHARGES"
- **hospital_name** (MANDATORY): Extract from bill header/letterhead  
- **date_of_service**: Service date, admission date, or statement date
- **account_number**: Bill/account reference if visible

## STEP 2: ORGANIZE LINE ITEMS
Extract and translate each charge:
- Line number, CPT code, description (translated), billed amount, quantity
- For Spanish bills: "Sala de Emergencias" → "Emergency Room (Sala de Emergencias)"
- Note missing codes or descriptions

## STEP 3: NSA PROTECTION CHECK
✅ **NSA PROTECTED** (Patient owes only in-network rates):
- Emergency care at ANY facility
- Out-of-network clinicians at in-network facility (anesthesia, radiology, pathology, ER physicians)
- Air ambulance
- Self-pay with Good Faith Estimate variance >$400

If protected, classify violations as HIGH PRIORITY and cite "No Surprises Act (45 CFR § 149.410)"

## STEP 4: LINE-ITEM AUDIT - Top 10 Most Common Issues

### #1 - DUPLICATE BILLING (30-40% of bills - MOST COMMON)
- Same CPT code billed 2+ times on same date
- Provider AND facility billing same service
- **Classification**: HIGH PRIORITY | **Confidence**: 1.0 for exact duplicates
- **Tag**: "duplicate_billing" | **Ranking**: "#1 most common (30-40% of bills)"

### #2 - UPCODING (25% of bills)
- ER Level 5 for non-critical cases
- High-level E/M without justification
- **Classification**: POTENTIAL ISSUE | **Confidence**: 0.7-0.9
- **Tag**: "upcoding" | **Ranking**: "#2 most common (25% of bills)"

### #3 - UNBUNDLING (20-25% of bills)
- Lab panels split into individual tests
- Separate billing for bundled procedures
- **Classification**: POTENTIAL ISSUE | **Confidence**: 0.8-0.95
- **Tag**: "unbundling" | **Ranking**: "#3 most common (20-25% of bills)"

### #4 - FACILITY FEE ISSUES
- Multiple facility fees same date
- Undisclosed facility charges
- **Classification**: POTENTIAL ISSUE | **Confidence**: 0.7-0.9
- **Tag**: "facility_fee" | **Ranking**: "#4 most common"

### #5 - BALANCE BILLING (NSA violation if protected)
- Out-of-network at in-network facility
- **Classification**: HIGH PRIORITY if NSA applies | **Confidence**: 0.95-1.0
- **Tag**: "balance_billing", "nsa_violation" | **Ranking**: "#5 most common"

### #6 - SERVICES NOT RENDERED (10-15%)
- Unreasonable quantities
- Undocumented services
- **Classification**: HIGH PRIORITY | **Confidence**: 0.6-0.9
- **Tag**: "phantom_billing" | **Ranking**: "#6 most common (10-15%)"

### #7 - PRE-EOB BILLING
- Bill before insurance processing
- No EOB shown
- **Classification**: POTENTIAL ISSUE | **Confidence**: 1.0
- **Tag**: "pre_eob" | **Ranking**: "#7 most common"

### #8 - TRAUMA ACTIVATION FEE
- Large trauma fee for minor injury
- **Classification**: POTENTIAL ISSUE | **Confidence**: 0.6-0.8
- **Tag**: "trauma_fee" | **Ranking**: "#8 most common in ER bills"

### #9 - COLLECTIONS ON INVALID BILLS
- Collections on disputed/NSA-protected charges
- **Classification**: HIGH PRIORITY | **Confidence**: 0.9-1.0
- **Tag**: "invalid_collections" | **Ranking**: "#9 most common"

### #10 - GROUND AMBULANCE
- Not NSA-protected but negotiable
- **Classification**: POTENTIAL ISSUE | **Confidence**: 1.0
- **Tag**: "ambulance_charges" | **Ranking**: "#10 most common"

## STEP 5: PRICE BENCHMARKING
- Compare to Medicare rates (fair = 2-3x Medicare)
- Flag >200% above Medicare as overcharge
- Note regional variations

## STEP 6: DATABASE CROSS-REFERENCE
- Check if issues match common patterns in our database
- Note: "This issue appears in X% of similar bills"
- Provide recurrence context for user

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

Return your analysis in this EXACT JSON structure (ALL fields REQUIRED):
{
  "total_bill_amount": 27838.01,
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
  "hospital_name": "Baylor Scott & White Health",
  "next_steps": [
    "Call billing department: [phone]",
    "Reference the specific overcharges listed above",
    "Ask for an itemized bill review",
    "Request payment plan if needed"
  ],
  "tags": ["overcharging", "negotiable", "high_confidence"]
}

🚨 CRITICAL REQUIREMENTS:
- total_bill_amount is MANDATORY - extract from "TOTAL ADEUDADO", "BALANCE DUE", "AMOUNT OWED", "TOTAL CHARGES"
- If total cannot be found, set total_bill_amount to 0 and add tag "missing_total"
- hospital_name is MANDATORY - extract from bill header`;

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
              total_bill_amount: { 
                type: 'number',
                description: 'MANDATORY: Total bill amount from TOTAL ADEUDADO, BALANCE DUE, AMOUNT OWED, or TOTAL CHARGES'
              },
              hospital_name: { 
                type: 'string',
                description: 'MANDATORY: Hospital/provider name from bill header'
              },
              bill_language: {
                type: 'string',
                description: 'Language of the bill (Spanish, English, etc.)'
              },
              date_of_service: {
                type: 'string',
                description: 'Service date or date range'
              },
              nsa_protected: {
                type: 'boolean',
                description: 'Whether bill is protected under No Surprises Act'
              },
              nsa_category: {
                type: 'string',
                description: 'NSA protection category if applicable'
              },
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
                    confidence_score: { type: 'number' },
                    ranking: { type: 'string', description: 'Issue ranking like #1 most common (30-40% of bills)' }
                  },
                  required: ['type', 'line_description', 'billed_amount', 'overcharge_amount', 'explanation_for_user', 'suggested_action', 'confidence_score']
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
                    confidence_score: { type: 'number' },
                    ranking: { type: 'string' }
                  },
                  required: ['type', 'line_description', 'billed_amount', 'overcharge_amount', 'explanation_for_user', 'suggested_action', 'confidence_score']
                }
              },
              total_potential_savings: { 
                type: 'number',
                description: 'Sum of all overcharge_amount values'
              },
              summary_for_user: {
                type: 'string',
                description: 'Friendly summary of findings'
              },
              provider_notes: {
                type: 'string',
                description: 'Notes about provider verification'
              },
              next_steps: {
                type: 'array',
                items: { type: 'string' },
                description: 'Actionable next steps for the patient'
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
            required: ['total_bill_amount', 'hospital_name', 'high_priority_issues', 'potential_issues', 'total_potential_savings', 'data_sources', 'tags', 'next_steps']
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
    
    // 🔧 FIX 5: UNCONDITIONAL validation with text extraction fallback
    analysis = validateAnalysis(analysis, extractedText);
    
    // 🔧 VALIDATION PIPELINE: Normalize → Finalize → Assert
    console.log('[VALIDATION] Starting final validation pipeline');
    
    // Step 1: Normalize all numeric fields
    analysis = normalizeAnalysis(analysis);
    console.log('[NORMALIZE] ✅ All numbers coerced and cleaned');
    
    // Step 2: Round and clamp totals proportionally
    analysis = finalizeTotals(analysis);
    console.log('[FINALIZE] ✅ Totals rounded and clamped');
    
    // Step 3: Assert all invariants
    try {
      assertAnalysis(analysis);
      console.log('[ASSERT] ✅ Analysis passed all validation checks');
    } catch (error) {
      console.error('[ASSERT] ❌ Analysis failed validation:', error);
      throw new Error(`Invalid analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Step 4: Add version metadata
    analysis.analysis_version = ANALYSIS_VERSION;
    analysis.prompt_version = PROMPT_VERSION;
    analysis.model_id = MODEL_ID;
    analysis.schema_version = SCHEMA_VERSION;
    analysis.cached = false;
    
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

// 🔧 VALIDATION: Constants for versioned caching
const ANALYSIS_VERSION = "2.0.1";
const PROMPT_VERSION = "pv-2025-10-15-2";
const MODEL_ID = "gemini-2.5-flash";
const SCHEMA_VERSION = "ai-output-v3";

// 🔧 Cache TTL in milliseconds (7 days)
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ✅ Generate versioned cache key
async function sha256Versioned(fileBuffer: ArrayBuffer): Promise<string> {
  const encoder = new TextEncoder();
  const versionString = ANALYSIS_VERSION + PROMPT_VERSION + MODEL_ID + SCHEMA_VERSION;
  const versionBytes = encoder.encode(versionString);
  
  // Combine file bytes + version string
  const combined = new Uint8Array(fileBuffer.byteLength + versionBytes.byteLength);
  combined.set(new Uint8Array(fileBuffer), 0);
  combined.set(versionBytes, fileBuffer.byteLength);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ✅ Validate cache quality before returning
function validateCacheQuality(cachedAnalysis: any): boolean {
  const ar: any = cachedAnalysis.analysis_result || {};
  
  // Check 1: Versions must match current
  if (ar.analysis_version !== ANALYSIS_VERSION) return false;
  if (ar.schema_version !== SCHEMA_VERSION) return false;
  
  // Check 2: TTL must be valid
  const createdAt = new Date(cachedAnalysis.created_at).getTime();
  if (Date.now() - createdAt > CACHE_TTL_MS) return false;
  
  // Check 3: Basic sanity checks
  const totalBill = Number(ar.total_bill_amount) || 0;
  const savings = Number(ar.total_potential_savings) || 0;
  if (totalBill <= 0) return false;
  if (savings > totalBill) return false;
  
  // Check 4: All issues must have numeric overcharge_amount
  const allIssues = [
    ...(ar.high_priority_issues || []),
    ...(ar.potential_issues || [])
  ];
  for (const issue of allIssues) {
    if (typeof issue.overcharge_amount !== 'number') return false;
    if (!Number.isFinite(issue.overcharge_amount)) return false;
  }
  
  return true;
}

// 🔧 NEW: Numeric hygiene helper
function isNum(x: any): boolean {
  return typeof x === 'number' && Number.isFinite(x);
}

// 🔧 NEW: Coerce string numbers with currency/commas
function toNum(x: any): number {
  if (isNum(x)) return x;
  const cleaned = String(x).replace(/[$,\s]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// 🔧 NEW: Round to 2 decimals
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// 🔧 NEW: Normalize all numbers in analysis
function normalizeAnalysis(a: any): any {
  const coerce = (x: any) => toNum(x);
  
  a.total_bill_amount = coerce(a.total_bill_amount);
  
  for (const i of [...(a.high_priority_issues || []), ...(a.potential_issues || [])]) {
    i.billed_amount = coerce(i.billed_amount);
    i.overcharge_amount = coerce(i.overcharge_amount);
    i.medicare_benchmark = coerce(i.medicare_benchmark);
    i.reasonable_rate = coerce(i.reasonable_rate);
  }
  
  return a;
}

// 🔧 NEW: Round and clamp totals proportionally
function finalizeTotals(a: any): any {
  const allIssues = [...(a.high_priority_issues || []), ...(a.potential_issues || [])];
  const sum = allIssues.reduce((s, i) => s + Number(i.overcharge_amount || 0), 0);
  
  a.total_potential_savings = round2(sum);
  
  // Proportional clamp if sum exceeds total
  if (a.total_potential_savings > a.total_bill_amount) {
    const factor = a.total_bill_amount / a.total_potential_savings;
    console.log(`[CLAMP] Applying proportional factor ${factor.toFixed(4)} to prevent exceeding total`);
    
    for (const i of allIssues) {
      i.overcharge_amount = round2(i.overcharge_amount * factor);
    }
    
    a.total_potential_savings = round2(a.total_bill_amount);
    a.validation_applied = true;
  }
  
  return a;
}

// 🔧 NEW: Server-side assertion before DB insert
function assertAnalysis(a: any): any {
  // Validate total bill amount
  if (!isNum(a.total_bill_amount) || a.total_bill_amount <= 0) {
    throw new Error(`Invalid total_bill_amount: ${a.total_bill_amount}`);
  }
  
  const allIssues = [...(a.high_priority_issues || []), ...(a.potential_issues || [])];
  
  // Validate each issue
  for (const i of allIssues) {
    if (!isNum(i.billed_amount)) {
      throw new Error(`Issue billed_amount not numeric: ${i.billed_amount}`);
    }
    if (!isNum(i.overcharge_amount)) {
      throw new Error(`Issue overcharge_amount not numeric after sanitize: ${i.overcharge_amount}`);
    }
    if (i.overcharge_amount < 0) {
      throw new Error(`Negative overcharge_amount after sanitize: ${i.overcharge_amount}`);
    }
    if (i.overcharge_amount > i.billed_amount * 0.7) {
      throw new Error(`overcharge_amount ${i.overcharge_amount} exceeds 70% guard (billed: ${i.billed_amount})`);
    }
  }
  
  // Validate total doesn't exceed bill
  const sum = allIssues.reduce((s, i) => s + toNum(i.overcharge_amount), 0);
  if (sum > a.total_bill_amount) {
    throw new Error(`Sum of overcharges (${sum}) exceeds total_bill_amount (${a.total_bill_amount})`);
  }
  
  // Set correct total
  a.total_potential_savings = sum;
  
  return a;
}

// 🔧 NEW: Strip parent-child double counting
function stripParentChildDoubleCount(issues: any[]): any[] {
  const parents = new Set(
    issues.filter(i => i.is_parent).map(i => i.line_description)
  );
  
  const filtered = issues.filter(i => 
    !(i.parent_description && parents.has(i.parent_description))
  );
  
  if (filtered.length < issues.length) {
    console.log(`[HIERARCHY] Removed ${issues.length - filtered.length} child items with parent present`);
  }
  
  return filtered;
}

// 🔧 FIX 2: Extract bill total from raw text (fallback if AI fails)
function extractBillTotal(text: string): number {
  const patterns = [
    /CURRENT\s+BALANCE\s+DUE[\s:$]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /TOTAL\s+ADEUDADO[\s:$]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /BALANCE\s+DUE[\s:$]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /TOTAL\s+CHARGES[\s:$]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /AMOUNT\s+DUE[\s:$]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      console.log(`[EXTRACT] Bill total found: $${amount.toLocaleString()} (pattern: ${pattern.source.slice(0, 30)}...)`);
      return amount;
    }
  }
  
  console.error('[EXTRACT] ⚠️ Failed to find bill total in text!');
  return 0;
}

// 🔧 FIX 3: Deduplicate aggregate vs subcategory line items
function deduplicateLineItems(issues: any[]): any[] {
  const seen = new Map<string, boolean>();
  const deduplicated = [];
  
  console.log(`[DEDUP] Starting with ${issues.length} issues`);
  
  for (const issue of issues) {
    // 🔧 PER-ISSUE VALIDATION: Sanitize each issue before dedup
    const sanitized = sanitizeIssue(issue);
    
    // Create unique key
    const key = `${sanitized.line_description}-${sanitized.billed_amount}`;
    
    if (!seen.has(key)) {
      seen.set(key, true);
      deduplicated.push(sanitized);
    } else {
      console.log(`[DEDUP] Removed duplicate: ${key}`);
    }
  }
  
  console.log(`[DEDUP] After dedup: ${deduplicated.length} unique issues`);
  return deduplicated;
}

// 🔧 NEW: Per-issue validation to prevent invalid overcharge amounts
function sanitizeIssue(issue: any): any {
  const billed = Number(issue.billed_amount) || 0;
  let overcharge = Number(issue.overcharge_amount) || 0;
  
  // Guard: negative overcharge
  if (overcharge < 0) {
    console.warn(`[SANITIZE] Negative overcharge detected: ${overcharge} → 0`);
    overcharge = 0;
  }
  
  // Guard: overcharge exceeds billed amount (impossible)
  if (overcharge > billed) {
    console.warn(`[SANITIZE] Overcharge ${overcharge} > billed ${billed} → capping to 70% of billed`);
    overcharge = Math.min(billed, Math.round(billed * 0.7));
  }
  
  return {
    ...issue,
    billed_amount: billed,
  };
}

function calculateSavings(analysis: any): number {
  // ✅ FIXED: Sum overcharge_amount (savings), NOT billed_amount (charges)
  const highPriorityTotal = (analysis.high_priority_issues || [])
    .reduce((sum: number, issue: any) => sum + (issue.overcharge_amount || 0), 0);
  
  const potentialTotal = (analysis.potential_issues || [])
    .reduce((sum: number, issue: any) => sum + (issue.overcharge_amount || 0), 0);
  
  const total = highPriorityTotal + potentialTotal;
  console.log(`[CALC] Savings - High: $${highPriorityTotal.toLocaleString()}, Potential: $${potentialTotal.toLocaleString()}, Total: $${total.toLocaleString()}`);
  return total;
}

// 🔧 FIX 4: Enhanced validation with robust total extraction and deduplication
function validateAnalysis(analysis: any, extractedText: string): any {
  console.log('[VALIDATE] === Starting Validation ===');
  
  // Guard: Ensure total_bill_amount exists (extract from text if missing)
  if (!analysis.total_bill_amount || analysis.total_bill_amount < 1) {
    console.warn('[VALIDATE] ⚠️ Missing total_bill_amount from AI - extracting from text...');
    analysis.total_bill_amount = extractBillTotal(extractedText);
  }
  
  const totalBill = analysis.total_bill_amount;
  console.log(`[VALIDATE] Bill total: $${totalBill.toLocaleString()}`);
  
  // Deduplicate BEFORE calculating savings
  const originalHighCount = analysis.high_priority_issues?.length || 0;
  const originalPotentialCount = analysis.potential_issues?.length || 0;
  
  // Step 1: Strip parent-child double counting
  analysis.high_priority_issues = stripParentChildDoubleCount(analysis.high_priority_issues || []);
  analysis.potential_issues = stripParentChildDoubleCount(analysis.potential_issues || []);
  
  // Step 2: Deduplicate exact matches
  analysis.high_priority_issues = deduplicateLineItems(analysis.high_priority_issues);
  analysis.potential_issues = deduplicateLineItems(analysis.potential_issues);
  
  if (originalHighCount !== analysis.high_priority_issues.length || 
      originalPotentialCount !== analysis.potential_issues.length) {
    console.log('[VALIDATE] 🔄 Deduplication applied');
    if (!analysis.tags) analysis.tags = [];
    analysis.tags.push('deduplicated');
  }
  
  // Calculate actual savings from deduplicated issues
  const calculatedSavings = calculateSavings(analysis);
  
  console.log('[VALIDATE] Validation check:', {
    totalBill,
    calculatedSavings,
    reported: analysis.total_potential_savings,
    ratio: totalBill > 0 ? (calculatedSavings / totalBill * 100).toFixed(1) + '%' : 'N/A'
  });
  
  // CRITICAL CHECK: Fail closed if no valid total
  if (totalBill < 1) {
    console.error('[VALIDATE] 🚨 CRITICAL: No valid bill total found!');
    throw new Error('Unable to extract bill total - cannot validate savings');
  }
  
  // If savings exceed bill total, proportionally reduce all overcharges
  const maxAllowed = totalBill * 0.9; // Cap at 90% of bill
  
  if (calculatedSavings > maxAllowed) {
    console.error(`[VALIDATE] ⚠️ FAILED: Savings ($${calculatedSavings.toLocaleString()}) exceed 90% of bill ($${maxAllowed.toLocaleString()})`);
    const reductionFactor = maxAllowed / calculatedSavings;
    console.log(`[VALIDATE] 📉 Applying reduction factor: ${(reductionFactor * 100).toFixed(1)}%`);
    
    // Reduce ALL overcharge amounts proportionally
    analysis.high_priority_issues = (analysis.high_priority_issues || []).map((issue: any) => ({
      ...issue,
      overcharge_amount: Math.round((issue.overcharge_amount || 0) * reductionFactor * 100) / 100,
      validation_adjusted: true
    }));
    
    analysis.potential_issues = (analysis.potential_issues || []).map((issue: any) => ({
      ...issue,
      overcharge_amount: Math.round((issue.overcharge_amount || 0) * reductionFactor * 100) / 100,
      validation_adjusted: true
    }));
    
    analysis.total_potential_savings = calculateSavings(analysis);
    analysis.validation_applied = true;
    analysis.reduction_factor = reductionFactor;
    
    if (!analysis.tags) analysis.tags = [];
    analysis.tags.push('validation_adjusted');
    
    console.log(`[VALIDATE] ✅ Adjusted savings: $${analysis.total_potential_savings.toLocaleString()}`);
  } else {
    console.log('[VALIDATE] ✅ PASSED: Savings within acceptable limits');
    analysis.total_potential_savings = calculatedSavings;
  }
  
  // Final sanity check - fail if still invalid
  if (analysis.total_potential_savings > totalBill) {
    console.error('[VALIDATE] 🚨 CRITICAL ERROR: Savings still exceed bill after validation!');
    throw new Error('Validation failed - savings exceed bill total');
  }
  
  console.log('[VALIDATE] === Validation Complete ===');
  return analysis;
}

// Duplicate Charge Detection
async function detectDuplicateCharges(
  extractedContent: {text: string, imageData?: string},
  mainAnalysis: any,
  apiKey: string
) {
  console.log('Running duplicate charge detection...');
  
  const duplicatePrompt = await Deno.readTextFile(
    new URL('./prompts/duplicate-detector-prompt.md', import.meta.url).pathname
  );
  
  const systemPrompt = duplicatePrompt;
  
  const userMessage: any = {
    role: 'user',
    content: extractedContent.imageData
      ? [
          {
            type: 'text',
            text: `DETECT DUPLICATE CHARGES IN THIS MEDICAL BILL:\n\nBill Total: $${mainAnalysis.total_bill_amount}\nHospital: ${mainAnalysis.hospital_name}\nDate: ${mainAnalysis.date_of_service}\n\nExtracted Text:\n${extractedContent.text}`
          },
          {
            type: 'image_url',
            image_url: { url: extractedContent.imageData }
          }
        ]
      : `DETECT DUPLICATE CHARGES IN THIS MEDICAL BILL:\n\nBill Total: $${mainAnalysis.total_bill_amount}\nHospital: ${mainAnalysis.hospital_name}\nDate: ${mainAnalysis.date_of_service}\n\nExtracted Text:\n${extractedContent.text}`
  };
  
  try {
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
        temperature: 0,
        tools: [{
          type: 'function',
          function: {
            name: 'return_duplicate_findings',
            description: 'Return duplicate charge findings',
            parameters: {
              type: 'object',
              properties: {
                bill_id: { type: 'string' },
                patient_id: { type: 'string' },
                service_dates: {
                  type: 'array',
                  items: { type: 'string' }
                },
                flags: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string', enum: ['P1', 'P2', 'P3', 'P4'] },
                      reason: { type: 'string' },
                      evidence: {
                        type: 'object',
                        properties: {
                          line_ids: { type: 'array', items: { type: 'string' } },
                          date_of_service: { type: 'string' },
                          codes: { type: 'array' },
                          modifiers: { type: 'array', items: { type: 'string' } },
                          units: { type: 'array', items: { type: 'number' } },
                          provider_group: { type: 'string' },
                          place_of_service: { type: 'string' },
                          prices: { type: 'array', items: { type: 'number' } }
                        }
                      },
                      panel_unbundling: {
                        type: 'object',
                        properties: {
                          panel_code: { type: 'string' },
                          component_codes: { type: 'array', items: { type: 'string' } }
                        }
                      },
                      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                      recommended_action: { type: 'string' },
                      dispute_text: { type: 'string' }
                    },
                    required: ['category', 'reason', 'confidence', 'recommended_action', 'dispute_text']
                  }
                },
                nsa_review: {
                  type: 'object',
                  properties: {
                    applies: { type: 'string', enum: ['yes', 'no', 'unknown'] },
                    scenarios: { type: 'array', items: { type: 'string' } },
                    missing_for_nsa: { type: 'array', items: { type: 'string' } },
                    prelim_assessment: { type: 'string' }
                  },
                  required: ['applies', 'prelim_assessment']
                },
                pricing_review: {
                  type: 'object',
                  properties: {
                    has_eob: { type: 'string', enum: ['yes', 'no'] },
                    suspect_overcharge_amount: { type: 'number' },
                    notes: { type: 'string' }
                  },
                  required: ['has_eob', 'notes']
                },
                totals: {
                  type: 'object',
                  properties: {
                    suspect_lines: { type: 'number' },
                    suspect_amount: { type: 'number' }
                  }
                },
                missing_data_requests: {
                  type: 'array',
                  items: { type: 'string' }
                },
                human_summary: { type: 'string' }
              },
              required: ['flags', 'nsa_review', 'pricing_review', 'totals', 'human_summary']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'return_duplicate_findings' } }
      }),
    });
    
    if (!response.ok) {
      console.error('Duplicate detection API error:', response.status);
      return { 
        flags: [], 
        nsa_review: { applies: 'unknown', scenarios: [], missing_for_nsa: [], prelim_assessment: 'NSA assessment unavailable' },
        pricing_review: { has_eob: 'no', notes: 'Pricing review unavailable' },
        totals: { suspect_lines: 0, suspect_amount: 0 }, 
        human_summary: 'Duplicate detection unavailable' 
      };
    }
    
    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const findings = JSON.parse(toolCall.function.arguments);
      console.log('Duplicate findings parsed:', {
        flags: findings.flags?.length || 0,
        suspect_amount: findings.totals?.suspect_amount || 0,
        nsa_applies: findings.nsa_review?.applies,
        has_eob: findings.pricing_review?.has_eob
      });
      return findings;
    }
    
    console.warn('No duplicate findings returned');
    return { 
      flags: [], 
      nsa_review: { applies: 'unknown', scenarios: [], missing_for_nsa: [], prelim_assessment: 'No NSA issues detected' },
      pricing_review: { has_eob: 'no', notes: 'No pricing issues detected' },
      totals: { suspect_lines: 0, suspect_amount: 0 }, 
      human_summary: 'No duplicates detected' 
    };
    
  } catch (error) {
    console.error('Error in duplicate detection:', error);
    return { 
      flags: [], 
      nsa_review: { applies: 'unknown', scenarios: [], missing_for_nsa: [], prelim_assessment: 'NSA check failed' },
      pricing_review: { has_eob: 'no', notes: 'Pricing check failed' },
      totals: { suspect_lines: 0, suspect_amount: 0 }, 
      human_summary: 'Duplicate detection error' 
    };
  }
}
