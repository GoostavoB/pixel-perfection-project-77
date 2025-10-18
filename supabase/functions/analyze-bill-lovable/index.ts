import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { 
  analyzeBillSavings, 
  computeAllowedBaseline, 
  type BillLine, 
  type NSAFlag, 
  type BaselineSource,
  type SavingsTotals 
} from "./savings-engine.ts";
import { runQAChecklist } from "./qa-checklist.ts";

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
    
    const analysisResult = await analyzeBillWithAI(extractedContent, lovableApiKey, supabase, pdfHash);
    console.log('AI analysis complete - validated and ready for storage');
    
    // ✅ NEW: Run rule-based duplicate detection (R1-R7)
    console.log('[DUPLICATE DETECTION] === Running Rule-Based Detection (R1-R7) ===');
    const duplicateFindings = await runRuleBasedDuplicateDetection(analysisResult);
    console.log('[DUPLICATE DETECTION] === Complete ===');
    console.log('[DUPLICATE DETECTION] Total flags:', duplicateFindings.flags?.length || 0);
    console.log('[DUPLICATE DETECTION] P1 (definite):', duplicateFindings.flags?.filter((f: any) => f.category === 'P1').length || 0);
    console.log('[DUPLICATE DETECTION] P2 (likely):', duplicateFindings.flags?.filter((f: any) => f.category === 'P2').length || 0);
    console.log('[DUPLICATE DETECTION] Suspect amount: $' + (duplicateFindings.totals?.suspect_amount || 0).toFixed(2));
    
    // Integrate duplicate findings into main analysis
    analysisResult.duplicate_findings = duplicateFindings;
    
    // ✅ PHASE 2: Calculate duplicate savings properly (100% of FIRST duplicate)
    let totalDuplicateSavings = 0;
    let duplicateLineCount = 0;
    
    // Add duplicates to what_if_calculator_items and track savings
    (duplicateFindings.flags || [])
      .filter((f: any) => f.category === 'P1' || f.category === 'P2')
      .forEach((flag: any, idx: number) => {
        const amount = (flag.evidence?.prices || []).reduce((sum: number, p: number) => sum + p, 0);
        const duplicatePrices = flag.evidence?.prices || [];
        const estimatedSavings = duplicatePrices.length > 0 
          ? duplicatePrices[0] // ✅ 100% of FIRST duplicate charge
          : 0;
        
        console.log(`[DUP SAVINGS] Line ${flag.lineIds?.[0]}: prices=${JSON.stringify(duplicatePrices)}, savings=$${estimatedSavings}`);
        
        duplicateLineCount++;
        totalDuplicateSavings += estimatedSavings;
        
        analysisResult.what_if_calculator_items.push({
          id: `duplicate-${idx}`,
          description: flag.reason || 'Potential duplicate charge',
          amount: amount,
          estimatedReduction: estimatedSavings, // ✅ PHASE 2.3: camelCase field name
          reason: flag.dispute_text || 'Potential duplicate - same service billed multiple times'
        });
      });
    
    // ✅ FIX: Update total_issues_count to include duplicates
    const originalIssueCount = analysisResult.total_issues_count || 0;
    analysisResult.total_issues_count = originalIssueCount + duplicateLineCount;
    
    // ✅ FIX: Recalculate estimated_total_savings INCLUDING duplicates
    const originalSavings = await calculateSavings(analysisResult);
    
    // 🔧 CRITICAL FIX: Extract actual savings from savings engine details
    const savingsDetails = (analysisResult as any)._savings_details;
    const actualTotalSavings = savingsDetails 
      ? savingsDetails.total_potential_savings_likely 
      : (originalSavings + totalDuplicateSavings);
    
    analysisResult.estimated_total_savings = actualTotalSavings;
    
    // 🔧 CRITICAL FIX: Update total_issues_count from savings engine
    if (savingsDetails) {
      analysisResult.total_issues_count = savingsDetails.lines_with_issues;
    }
    
    console.log('[INTEGRATION] Updated analysis with duplicates:', {
      original_issues: originalIssueCount,
      duplicate_issues: duplicateLineCount,
      total_issues_from_engine: savingsDetails?.lines_with_issues || 'N/A',
      total_issues_final: analysisResult.total_issues_count,
      original_savings: originalSavings,
      duplicate_savings: totalDuplicateSavings,
      savings_from_engine: savingsDetails?.total_potential_savings_likely || 'N/A',
      total_savings_final: analysisResult.estimated_total_savings,
      what_if_items: analysisResult.what_if_calculator_items?.length
    });
    
    // ✅ PHASE 5.2: Add savings validation
    console.log('[SAVINGS VALIDATION]');
    console.log(`  Duplicate savings: $${totalDuplicateSavings.toFixed(2)} (${duplicateLineCount} lines)`);
    console.log(`  Overcharge savings: $${savingsDetails?.overcharge_savings_subtotal || 0} (${savingsDetails?.overcharge_count || 0} lines)`);
    console.log(`  Total potential savings: $${analysisResult.estimated_total_savings?.toFixed(2) || 0}`);
    console.log(`  Expected for test bill: Duplicates=$450, Overcharges=$5030, Total=$5480`);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    console.log('User ID:', userId);

    // ✅ PHASE 5: Run QA checklist before final storage
    runQAChecklist(analysisResult);
    
    // 🔧 FIX 6: Log final analysis summary before storage
    const finalSavings = await calculateSavings(analysisResult);
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
        estimated_savings: await calculateSavings(analysisResult),
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
          estimated_savings_if_corrected: await calculateSavings(analysisResult),
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
  supabase: any,
  pdfHash: string
) {
  console.log('Calling Lovable AI with pricing data...');
  const extractedText = extractedContent.text; // Store for validation
  
  // ✅ PHASE 3: Analysis metadata for traceability
  const analysisMetadata = {
    version_engine: "2.0.3",
    version_datasets: {
      medicare_pfs: "2025-Q1",
      ncci_edits: "2025-01-15",
      duplicate_rules: "v1.0"
    },
    file_hash: pdfHash,
    analysis_timestamp: new Date().toISOString()
  };
  console.log('[METADATA]', JSON.stringify(analysisMetadata));
  
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
  
  // ✅ PHASE 1: Replace inline prompt with data extraction prompt file
  const systemPrompt = await Deno.readTextFile('./prompts/data-extraction-prompt.md');
  console.log('[PROMPT] Using data extraction prompt, length:', systemPrompt.length);
  console.log('[PROMPT] First 200 chars:', systemPrompt.substring(0, 200));

  // Build message content - include image if available (for vision analysis)
  const userMessage: any = {
    role: 'user',
    content: extractedContent.imageData
      ? [
          {
            type: 'text',
            text: `Extract all structured data from this medical bill. Return only the fields defined in the schema: charges[], account_number, hospital_name, service_dates.

DO NOT analyze, flag duplicates, or calculate overcharges - only extract raw data exactly as it appears on the bill.

Extract ALL visible charges with:
- Date of service (exact, YYYY-MM-DD format)
- Description (verbatim text from bill)
- CPT/HCPCS code (if visible, otherwise "N/A")
- Revenue code (if visible)
- Units/Quantity
- Charge/billed amount (exact dollar amount)
- CRITICAL: "Allowed amount" or "Plan allowed" column (extract exact amount if present, set to null if missing)

${extractedContent.text}`
          },
          {
            type: 'image_url',
            image_url: { url: extractedContent.imageData }
          }
        ]
      : `Extract all structured data from this medical bill. Return only the fields defined in the schema: charges[], account_number, hospital_name, service_dates.

DO NOT analyze, flag duplicates, or calculate overcharges - only extract raw data exactly as it appears on the bill.

Extract ALL visible charges with:
- Date of service (exact, YYYY-MM-DD format)
- Description (verbatim text from bill)
- CPT/HCPCS code (if visible, otherwise "N/A")
- Revenue code (if visible)
- Units/Quantity
- Charge/billed amount (exact dollar amount)
- CRITICAL: "Allowed amount" or "Plan allowed" column (extract exact amount if present, set to null if missing)

${extractedContent.isScanned ? ' (NOTE: This is a scanned PDF - extract all visible information even if text quality is poor)' : ''}

${extractedContent.text}`
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
              account_number: {
                type: 'string',
                description: 'Account or bill number if visible'
              },
              charges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    cpt_code: { type: 'string', description: 'CPT/HCPCS code or "N/A" if missing' },
                    charge_amount: { type: 'number' },
                    billed_amount: { type: 'number', description: 'CRITICAL: For aggregate charges like "PHARMACY $5,000", extract dollar amount and store here' },
                    allowed_amount: { type: 'number', description: 'CRITICAL: Extract from "Allowed", "Plan Allowed", "Insurance Allowed" column if present, otherwise null' },
                    baseline_source: { type: 'string', description: 'Source of baseline used for comparison (e.g., "medicare_pfs_2025q1", "plan_allowed", "regional_benchmark")' },
                    baseline_value: { type: 'number', description: 'Baseline amount used for comparison' },
                    overcharge_pct: { type: 'number', description: 'Percentage overcharge: (billed - baseline) / baseline * 100' },
                    units: { type: 'number' },
                    revenue_code: { type: 'string' },
                    line_id: { type: 'string', description: 'Unique identifier for this charge line' },
                    date_of_service: { type: 'string', format: 'date' },
                    provider_id: { type: 'string' },
                    department: { type: 'string' },
                    modifier: { type: 'string' }
                  }
                }
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
                    category: { type: 'string' },
                    issue_type: { type: 'string', enum: ['duplicate', 'overcharge', 'nsa_violation', 'unbundling', 'other'] },
                    cpt_code: { type: 'string' },
                    line_description: { type: 'string' },
                    billed_amount: { type: 'number' },
                    overcharge_amount: { type: 'number' },
                    reason: { type: 'string', description: 'CRITICAL: DETAILED evidence-based explanation with (1) specific charge, (2) WHY with evidence (federal law citation, pricing benchmark, or matching criteria), (3) dollar amount, (4) legal/rule reference' },
                    explanation_for_user: { type: 'string' },
                    suggested_action: { type: 'string' },
                    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                    confidence_score: { type: 'number' },
                    ranking: { type: 'string', description: 'Issue ranking like #1 most common (30-40% of bills)' },
                    evidence: {
                      type: 'object',
                      properties: {
                        citation: { type: 'string', description: 'Legal citation for NSA violations (e.g., 45 CFR 149.110)' },
                        benchmark: { type: 'string', description: 'Pricing comparison for overcharges (e.g., Medicare $450 vs charged $1,800)' },
                        matching_criteria: { type: 'string', description: 'For duplicates: what matched (e.g., Same CPT, date, provider, no valid modifier)' }
                      }
                    }
                  },
                  required: ['type', 'line_description', 'billed_amount', 'reason', 'explanation_for_user', 'suggested_action', 'confidence_score']
                }
              },
              potential_issues: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    category: { type: 'string' },
                    issue_type: { type: 'string', enum: ['duplicate', 'overcharge', 'nsa_violation', 'unbundling', 'other'] },
                    cpt_code: { type: 'string' },
                    line_description: { type: 'string' },
                    billed_amount: { type: 'number' },
                    medicare_benchmark: { type: 'number' },
                    reasonable_rate: { type: 'number' },
                    overcharge_amount: { type: 'number' },
                    markup_percentage: { type: 'number' },
                    reason: { type: 'string', description: 'CRITICAL: DETAILED evidence-based explanation with (1) specific charge, (2) WHY with evidence (federal law citation, pricing benchmark, or matching criteria), (3) dollar amount, (4) legal/rule reference' },
                    explanation_for_user: { type: 'string' },
                    suggested_action: { type: 'string' },
                    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                    confidence_score: { type: 'number' },
                    ranking: { type: 'string' },
                    evidence: {
                      type: 'object',
                      properties: {
                        citation: { type: 'string', description: 'Legal citation for NSA violations (e.g., 45 CFR 149.420)' },
                        benchmark: { type: 'string', description: 'Pricing comparison for overcharges (e.g., Medicare $450 vs charged $1,800)' },
                        matching_criteria: { type: 'string', description: 'For duplicates: what matched' }
                      }
                    }
                  },
                  required: ['type', 'line_description', 'billed_amount', 'reason', 'explanation_for_user', 'suggested_action', 'confidence_score']
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
    
    // ✅ PHASE 5.1: Add extraction validation
    const chargesWithAllowed = analysis.charges?.filter((c: any) => c.allowed_amount != null).length || 0;
    const chargesWithoutOvercharge = analysis.charges?.filter((c: any) => !c.overcharge_amount).length || 0;
    console.log('[EXTRACTION VALIDATION]', {
      total_lines: analysis.charges?.length || 0,
      lines_with_allowed_amount: chargesWithAllowed,
      lines_without_overcharge: chargesWithoutOvercharge
    });
    console.log(`  Lines with allowed_amount: ${analysis.line_items?.filter((l: any) => l.allowed_amount > 0).length || 0}`);
    console.log(`  Lines with CPT codes: ${analysis.line_items?.filter((l: any) => l.cpt_or_hcpcs && l.cpt_or_hcpcs !== 'N/A').length || 0}`);
    
    // 🔧 FIX 5: UNCONDITIONAL validation with text extraction fallback
    analysis = await validateAnalysis(analysis, extractedText);
    
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
    
    // Step 4: Compute ALL frontend-needed fields
    analysis = computeFrontendFields(analysis);
    console.log('[COMPUTE] ✅ All frontend fields computed');
    
    // Step 4.5: Backfill missing billed_amount values
    backfillMissingAmounts(analysis, Number(analysis.total_bill_amount) || 0);
    console.log('[BACKFILL] ✅ Backfill logic applied');
    
    // ⚡ PHASE 2C: Enrich issues with real-time fair prices
    await enrichIssuesWithFairPrices(analysis);
    console.log('[ENRICH] ✅ Issues enriched with fair price data');
    
    // Step 5: Add version metadata
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
const ANALYSIS_VERSION = "2.0.3";
const PROMPT_VERSION = "pv-2025-10-15-4";
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
    if (i.overcharge_amount > i.billed_amount * 1.0) {
      throw new Error(`overcharge_amount ${i.overcharge_amount} exceeds 100% guard (billed: ${i.billed_amount})`);
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
    console.warn(`[SANITIZE] Overcharge ${overcharge} > billed ${billed} → capping to 100% of billed`);
    overcharge = billed;
  }
  
  return {
    ...issue,
    billed_amount: billed,
    overcharge_amount: overcharge,
  };
}


// 🔧 Compute all frontend-needed fields
function computeFrontendFields(analysis: any): any {
  console.log('[COMPUTE] Computing frontend fields...');
  
  // 1. Compute itemization_status
  const charges = analysis.charges || [];
  const hasAllCodes = charges.every((c: any) => c.cpt_code && c.cpt_code !== 'N/A');
  const hasSomeCodes = charges.some((c: any) => c.cpt_code && c.cpt_code !== 'N/A');
  analysis.itemization_status = hasAllCodes ? 'complete' : hasSomeCodes ? 'partial' : 'missing';
  
  // 2. Compute total_issues_count (will be updated after duplicate detection)
  const highPriorityCount = (analysis.high_priority_issues || []).length;
  const potentialCount = (analysis.potential_issues || []).length;
  analysis.total_issues_count = highPriorityCount + potentialCount;
  
  // 3. Build what_if_calculator_items with reasons
  const whatIfItems: any[] = [];
  
  // Add high priority issues
  (analysis.high_priority_issues || []).forEach((issue: any, idx: number) => {
    whatIfItems.push({
      id: `high-${idx}`,
      description: issue.line_description || issue.explanation_for_user || 'High priority issue',
      amount: issue.billed_amount || 0,
      estimated_reduction: Math.round((issue.overcharge_amount || 0) * 0.8 * 100) / 100,
      reason: issue.reason || issue.explanation_for_user || 'Overcharge detected'
    });
  });
  
  // Add potential issues
  (analysis.potential_issues || []).forEach((issue: any, idx: number) => {
    whatIfItems.push({
      id: `potential-${idx}`,
      description: issue.line_description || issue.explanation_for_user || 'Potential issue',
      amount: issue.billed_amount || 0,
      estimated_reduction: Math.round((issue.overcharge_amount || 0) * 0.6 * 100) / 100,
      reason: issue.reason || issue.explanation_for_user || 'Potential overcharge'
    });
  });
  
  analysis.what_if_calculator_items = whatIfItems;
  
  // 4. estimated_total_savings will be computed by calculateSavings after duplicate detection
  
  console.log('[COMPUTE] Frontend fields:', {
    itemization_status: analysis.itemization_status,
    total_issues_count: analysis.total_issues_count,
    what_if_items: whatIfItems.length
  });
  
  return analysis;
}

// 🔧 BACKFILL LOGIC: Ensure every charge has billed_amount
function backfillMissingAmounts(analysis: any, totalBilled: number): void {
  if (!analysis.charges || analysis.charges.length === 0) {
    console.log('[BACKFILL] No charges to process');
    return;
  }
  
  console.log('[BACKFILL] Processing charges for missing billed_amount...');
  let backfilled = 0;
  
  for (const charge of analysis.charges) {
    // Skip if already has billed_amount
    if (charge.billed_amount && charge.billed_amount > 0) continue;
    
    // Tier 1: Copy from charge_amount if AI populated it
    if (charge.charge_amount && charge.charge_amount > 0) {
      charge.billed_amount = charge.charge_amount;
      console.log(`[BACKFILL] Tier 1 - Copied charge_amount: $${charge.billed_amount}`);
      backfilled++;
      continue;
    }
    
    // Tier 2: Regex extract from description
    if (charge.description) {
      const amountMatch = charge.description.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      if (amountMatch) {
        charge.billed_amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        console.log(`[BACKFILL] Tier 2 - Extracted from description: $${charge.billed_amount}`);
        backfilled++;
        continue;
      }
    }
    
    // Tier 3: Category-based proportional estimate
    if (totalBilled > 0 && charge.description) {
      const desc = charge.description.toLowerCase();
      let estimatedPercent = 0.10; // Default 10% of total bill
      
      // Use same category logic as estimateBaselineFromCategory (lines 157-200)
      if (desc.includes('pharmacy') || desc.includes('medication')) estimatedPercent = 0.15;
      if (desc.includes('laboratory') || desc.includes('lab')) estimatedPercent = 0.12;
      if (desc.includes('imaging') || desc.includes('radiology')) estimatedPercent = 0.18;
      if (desc.includes('surgery') || desc.includes('operating')) estimatedPercent = 0.30;
      if (desc.includes('room') || desc.includes('bed')) estimatedPercent = 0.20;
      if (desc.includes('emergency') || desc.includes('er')) estimatedPercent = 0.25;
      if (desc.includes('supplies')) estimatedPercent = 0.08;
      
      charge.billed_amount = Math.round(totalBilled * estimatedPercent * 100) / 100;
      console.log(`[BACKFILL] Tier 3 - Category estimate (${estimatedPercent * 100}% of total): $${charge.billed_amount}`);
      backfilled++;
    }
  }
  
  const populated = analysis.charges.filter((c: any) => c.billed_amount > 0).length;
  console.log(`[BACKFILL] Result: ${populated}/${analysis.charges.length} charges have billed_amount (backfilled: ${backfilled})`);
}

// ⚡ PHASE 2C: Enrich issues with real-time fair prices from CMS APIs
async function enrichIssuesWithFairPrices(analysis: any): Promise<void> {
  console.log('[ENRICH] === Enriching issues with fair price data ===');
  
  const allIssues = [
    ...(analysis.high_priority_issues || []),
    ...(analysis.potential_issues || [])
  ];
  
  if (allIssues.length === 0) {
    console.log('[ENRICH] No issues to enrich');
    return;
  }
  
  // Extract unique CPT codes from issues
  const cptCodes = Array.from(new Set(
    allIssues
      .map((issue: any) => issue.cpt_code)
      .filter((code: string) => code && code !== 'N/A' && /^\d{5}$/.test(code))
  )) as string[];
  
  if (cptCodes.length === 0) {
    console.log('[ENRICH] No valid CPT codes found in issues');
    return;
  }
  
  console.log(`[ENRICH] Found ${cptCodes.length} unique CPT codes to fetch fair prices for`);
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const enrichClient = createClient(supabaseUrl, supabaseKey);
    
    // Fetch fair prices from our API
    const { data: fairPricesData, error: fairPricesError } = await enrichClient.functions.invoke('fetch-fair-prices', {
      body: {
        cptCodes,
        state: analysis.hospital_state || 'National',
        forceRefresh: false
      }
    });
    
    if (fairPricesError) {
      console.error('[ENRICH] Error fetching fair prices:', fairPricesError);
      return;
    }
    
    if (!fairPricesData?.results) {
      console.log('[ENRICH] No fair price results returned');
      return;
    }
    
    console.log(`[ENRICH] ✓ Received ${fairPricesData.results.length} fair price results`);
    
    // Create a map for quick lookup
    const fairPriceMap = new Map<string, any>();
    fairPricesData.results.forEach((fp: any) => {
      fairPriceMap.set(fp.cpt_code, fp);
    });
    
    // Enrich each issue with fair price data
    let enrichedCount = 0;
    
    const enrichIssue = (issue: any) => {
      const cptCode = issue.cpt_code;
      if (!cptCode || cptCode === 'N/A') return issue;
      
      const fairPrice = fairPriceMap.get(cptCode);
      if (!fairPrice) return issue;
      
      // Add fair price metadata
      issue.fair_price = fairPrice.fair_price;
      issue.fair_price_confidence = fairPrice.confidence;
      issue.fair_price_source = fairPrice.source;
      
      // Update medicare_benchmark with real data
      if (fairPrice.medicare_rate && fairPrice.medicare_rate > 0) {
        issue.medicare_benchmark = fairPrice.medicare_rate;
      }
      
      // Update reasonable_rate to match fair_price (150% of Medicare)
      issue.reasonable_rate = fairPrice.fair_price;
      
      // Recalculate overcharge_amount if we have better data
      if (issue.billed_amount && fairPrice.fair_price) {
        const newOvercharge = Math.max(0, issue.billed_amount - fairPrice.fair_price);
        if (newOvercharge > 0) {
          issue.overcharge_amount = newOvercharge;
        }
      }
      
      enrichedCount++;
      console.log(`[ENRICH] ✓ Enriched ${cptCode}: Fair=$${fairPrice.fair_price}, Medicare=$${fairPrice.medicare_rate}, Confidence=${fairPrice.confidence}`);
      
      return issue;
    };
    
    // Enrich high priority issues
    if (analysis.high_priority_issues) {
      analysis.high_priority_issues = analysis.high_priority_issues.map(enrichIssue);
    }
    
    // Enrich potential issues
    if (analysis.potential_issues) {
      analysis.potential_issues = analysis.potential_issues.map(enrichIssue);
    }
    
    console.log(`[ENRICH] ✅ Enriched ${enrichedCount} issues with fair price data`);
    
    // Add metadata to analysis
    if (!analysis.data_sources) analysis.data_sources = [];
    if (enrichedCount > 0 && !analysis.data_sources.includes('CMS Fair Pricing API')) {
      analysis.data_sources.push('CMS Fair Pricing API');
    }
    
  } catch (error) {
    console.error('[ENRICH] Failed to enrich issues with fair prices:', error);
    // Don't throw - enrichment is optional enhancement
  }
}

// ✅ NEW: Production-ready savings calculation using multi-source baseline
async function calculateSavings(analysis: any): Promise<number> {
  console.log('[CALC] === Starting Production Savings Calculation ===');
  console.log('[CALC] Analysis structure:', {
    has_charges: !!analysis.charges,
    charges_count: (analysis.charges || []).length,
    has_high_priority: !!analysis.high_priority_issues,
    high_priority_count: (analysis.high_priority_issues || []).length,
    has_potential: !!analysis.potential_issues,
    potential_count: (analysis.potential_issues || []).length,
    total_bill_amount: analysis.total_bill_amount
  });
  
  // Extract charges from BOTH charges array AND issues
  let charges = analysis.charges || [];
  
  // ✅ FIX: If no charges array, build from issues
  if (charges.length === 0) {
    console.log('[CALC] No charges array found - building from issues');
    const allIssues = [...(analysis.high_priority_issues || []), ...(analysis.potential_issues || [])];
    charges = allIssues.map((issue: any) => ({
      cpt_code: issue.cpt_code || 'N/A',
      revenue_code: issue.revenue_code,
      description: issue.line_description || issue.explanation_for_user,
      charge_amount: issue.billed_amount || 0,
      units: issue.units || 1,
      overcharge_amount: issue.overcharge_amount || 0
    }));
  }
  
  if (charges.length === 0) {
    console.log('[CALC] No charges or issues found');
    return 0;
  }

  console.log(`[CALC] Processing ${charges.length} line items`);

  // Convert charges to BillLine format
  const lines: BillLine[] = charges.map((charge: any, idx: number) => ({
    line_id: `line_${idx}`,
    cpt_or_hcpcs: charge.cpt_code,
    revenue_code: charge.revenue_code,
    description: charge.description || '',
    billed_amount: Number(charge.charge_amount || charge.billed_amount) || 0,
    quantity: Number(charge.units) || 1,
    patient_cost_share_charged: 0, // Not available in basic analysis
    expected_in_network_cost_share: 0, // Not available
    date_of_service: analysis.date_of_service
  }));

  // Build NSA flags from high_priority_issues and potential_issues
  const nsa_flags = new Map<string, NSAFlag>();
  
  [...(analysis.high_priority_issues || []), ...(analysis.potential_issues || [])].forEach((issue: any, idx: number) => {
    if (issue.type === 'nsa_violation' || issue.issue_type === 'nsa_violation') {
      const line_id = `line_${idx}`;
      nsa_flags.set(line_id, {
        violation: true,
        type: issue.evidence?.citation || '149.110',
        clause_refs: [issue.evidence?.citation || '149.110']
      });
    }
  });

  // ⚡ PHASE 2A: Fetch real-time fair prices from CMS APIs
  console.log('[FAIR_PRICE] === Fetching real-time fair prices from CMS APIs ===');
  const uniqueCptCodes = Array.from(new Set(
    lines
      .map(l => l.cpt_or_hcpcs)
      .filter(code => code && code !== 'N/A' && /^\d{5}$/.test(code))
  ));
  
  console.log(`[FAIR_PRICE] Found ${uniqueCptCodes.length} unique CPT codes to price`);
  
  const fairPricesMap = new Map<string, any>();
  
  if (uniqueCptCodes.length > 0) {
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const fairPriceClient = createClient(supabaseUrl, supabaseKey);
      
      const { data: fairPricesData, error: fairPricesError } = await fairPriceClient.functions.invoke('fetch-fair-prices', {
        body: {
          cptCodes: uniqueCptCodes,
          state: analysis.hospital_state || 'National',
          forceRefresh: false // Use 30-day cache
        }
      });
      
      if (fairPricesError) {
        console.error('[FAIR_PRICE] Error fetching fair prices:', fairPricesError);
      } else if (fairPricesData?.results) {
        console.log(`[FAIR_PRICE] ✓ Received ${fairPricesData.results.length} fair price results`);
        fairPricesData.results.forEach((fp: any) => {
          fairPricesMap.set(fp.cpt_code, fp);
          console.log(`[FAIR_PRICE] ${fp.cpt_code}: Fair=$${fp.fair_price}, Medicare=$${fp.medicare_rate}, Confidence=${fp.confidence}`);
        });
      }
    } catch (apiError) {
      console.error('[FAIR_PRICE] Failed to fetch fair prices:', apiError);
    }
  }

  // Build baseline sources - NOW POWERED BY REAL-TIME FAIR PRICES! 🚀
  const baseline_sources = new Map<string, BaselineSource>();
  
  // ✅ PHASE 3: Extract allowed amounts from charges
  console.log('[BASELINE] Sample check (first 3 lines):');
  
  charges.forEach((charge: any, idx: number) => {
    const line_id = `line_${idx}`;
    const billed = Number(charge.charge_amount || charge.billed_amount) || 0;
    const overcharge = Number(charge.overcharge_amount) || 0;
    const cptCode = charge.cpt_code;
    
    // ✅ PHASE 3.2: Extract allowed_amount from charge (from bill's "Allowed" column)
    const allowed_amount = charge.allowed_amount || null;
    
    if (idx < 3) {
      console.log(`  Line ${idx+1}: Billed=$${billed}, Allowed=${allowed_amount || 'N/A'}`);
    }
    
    // Start with AI-derived baseline as fallback
    let estimated_baseline = billed;
    if (overcharge > 0 && overcharge < billed) {
      estimated_baseline = billed - overcharge;
    }
    
    // ⚡ UPGRADE: Use real-time fair price if available
    const fairPrice = fairPricesMap.get(cptCode);
    
    if (fairPrice && fairPrice.confidence !== 'low') {
      console.log(`[BASELINE] ✓ Using REAL fair price for ${cptCode}: $${fairPrice.fair_price} (${fairPrice.source})`);
      
      baseline_sources.set(line_id, {
        plan_allowed: allowed_amount || fairPrice.fair_price, // ✅ Prioritize allowed_amount from bill
        medicare_allowed: fairPrice.medicare_rate,              // Actual Medicare rate
        regional_benchmark: fairPrice.fair_price_range.recommended, // Same as fair price
        chargemaster_median: undefined
      });
    } else {
      // Use AI estimate as fallback
      console.log(`[BASELINE] Using AI estimate for ${cptCode || 'aggregated'}: $${estimated_baseline}`);
      
      baseline_sources.set(line_id, {
        plan_allowed: allowed_amount || (estimated_baseline > 0 ? estimated_baseline : undefined), // ✅ Prioritize allowed_amount
        medicare_allowed: undefined,
        regional_benchmark: undefined,
        chargemaster_median: undefined
      });
    }
  });

  // 🔍 HIGH-SIGNAL LOGGING: What's going into the savings engine?
  console.log('[SAVINGS_ENGINE_INPUT]', JSON.stringify({
    total_lines: lines.length,
    lines_with_billed_amount: lines.filter(l => l.billed_amount > 0).length,
    lines_with_cpt: lines.filter(l => l.cpt_or_hcpcs && l.cpt_or_hcpcs !== 'N/A').length,
    sample_lines: lines.slice(0, 3).map(l => ({
      description: l.description?.slice(0, 50),
      billed: l.billed_amount,
      cpt: l.cpt_or_hcpcs,
      has_baseline: baseline_sources.has(l.line_id || '')
    })),
    baseline_sources_count: baseline_sources.size,
    nsa_flags_count: nsa_flags.size,
    total_billed_from_lines: lines.reduce((sum, l) => sum + (l.billed_amount || 0), 0),
    expected_total: Number(analysis.total_bill_amount) || 0
  }, null, 2));

  // Run the production savings engine
  const savings_result: SavingsTotals = analyzeBillSavings(
    lines,
    nsa_flags,
    baseline_sources,
    Number(analysis.total_bill_amount) || 0
  );

  console.log(`[CALC] Production Savings Breakdown:`);
  console.log(`  - NSA Violations: $${savings_result.nsa_savings_subtotal.toLocaleString()}`);
  console.log(`  - Duplicate Charges: $${savings_result.duplicate_savings_subtotal.toLocaleString()}`);
  console.log(`  - Overcharges: $${savings_result.overcharge_savings_subtotal.toLocaleString()}`);
  console.log(`  - GROSS TOTAL: $${savings_result.total_potential_savings_gross.toLocaleString()}`);
  console.log(`  - LIKELY TOTAL (weighted): $${savings_result.total_potential_savings_likely.toLocaleString()}`);
  console.log(`  - Issues: ${savings_result.lines_with_issues}/${savings_result.total_lines} (${(savings_result.issue_ratio * 100).toFixed(1)}%)`);
  console.log(`  - Color: ${savings_result.color}`);

  // Store detailed savings in analysis for frontend use
  (analysis as any)._savings_details = savings_result;

  // 🔧 NEW: Rebuild what-if calculator items with correct savings
  rebuildWhatIfItemsFromSavingsEngine(analysis);

  // Return likely total (weighted by confidence)
  return savings_result.total_potential_savings_likely;
}

// 🔧 NEW: Rebuild what-if calculator items using savings engine results
function rebuildWhatIfItemsFromSavingsEngine(analysis: any): void {
  const savingsDetails = (analysis as any)._savings_details;
  if (!savingsDetails || !savingsDetails.line_details) {
    console.warn('[REBUILD] No savings engine details available - keeping original what_if items');
    return;
  }
  
  console.log('[REBUILD] Rebuilding what_if_calculator_items from savings engine...');
  
  const newWhatIfItems: any[] = [];
  const high_priority = analysis.high_priority_issues || [];
  const potential = analysis.potential_issues || [];
  
  // Map line_id to issue for quick lookup
  const issueMap = new Map<string, any>();
  [...high_priority, ...potential].forEach((issue, idx) => {
    const lineId = issue.line_id || `line_${idx}`;
    issueMap.set(lineId, issue);
  });
  
  // Rebuild items from savings engine line_details
  savingsDetails.line_details.forEach((lineDetail: any) => {
    const issue = issueMap.get(lineDetail.line_id);
    if (!issue) return;
    
    const totalLineSavings = lineDetail.total_line_savings || 0;
    const confidence = lineDetail.confidence || 0.8;
    
    // Only include items with savings > 0
    if (totalLineSavings <= 0) return;
    
    // Determine if high or potential based on confidence
    const isHighPriority = confidence >= 0.8;
    const idPrefix = isHighPriority ? 'high' : 'potential';
    
    newWhatIfItems.push({
      id: `${idPrefix}-${lineDetail.line_id}`,
      description: issue.line_description || issue.explanation_for_user || 'Billing issue',
      amount: issue.billed_amount || 0,
      estimatedReduction: Math.round(totalLineSavings * 100) / 100,
      reason: issue.reason || issue.explanation_for_user || 'Potential overcharge'
    });
  });
  
  analysis.what_if_calculator_items = newWhatIfItems;
  
  console.log(`[REBUILD] Rebuilt ${newWhatIfItems.length} what-if items with correct savings`);
}

// 🔧 FIX 4: Enhanced validation with robust total extraction and deduplication
async function validateAnalysis(analysis: any, extractedText: string): Promise<any> {
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
  const calculatedSavings = await calculateSavings(analysis);
  
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
    
    analysis.total_potential_savings = await calculateSavings(analysis);
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

// ✅ NEW: Rule-based duplicate detection using R1-R7
async function runRuleBasedDuplicateDetection(analysisResult: any) {
  console.log('[R1-R7] Running rule-based duplicate detection...');
  
  // Extract bill lines from analysis result
  const billLines = (analysisResult.charges || []).map((charge: any, idx: number) => ({
    line_id: `line_${idx + 1}`,
    date_of_service: charge.date_of_service || analysisResult.date_of_service,
    cpt_or_hcpcs: charge.cpt_code !== 'N/A' ? charge.cpt_code : undefined,
    revenue_code: charge.revenue_code,
    description: charge.description,
    billed_amount: charge.charge_amount || charge.billed_amount || 0,
    quantity: charge.units || 1,
    provider_id_ref: charge.provider_npi || 'UNKNOWN'
  }));
  
  if (billLines.length === 0) {
    console.warn('[R1-R7] No bill lines found in analysis result');
    return {
      flags: [],
      totals: { suspect_lines: 0, suspect_amount: 0 }
    };
  }
  
  // Import and run duplicate detection rules
  const { detectAllDuplicates } = await import('./duplicate-rules.ts');
  const duplicateMatches = detectAllDuplicates(billLines);
  
  console.log(`[R1-R7] Detected ${duplicateMatches.length} duplicate matches`);
  
  // Convert to expected format
  const flags = duplicateMatches.map((match: any) => ({
    category: match.category,
    reason: match.reason,
    evidence: {
      lineIds: match.lineIds,
      dates: match.evidence?.dates || [],
      descriptions: match.evidence?.descriptions || [],
      amounts: match.evidence?.amounts || [],
      departments: match.evidence?.departments || [],
      providers: match.evidence?.providers || []
    },
    confidence: match.confidence >= 0.8 ? 'high' : match.confidence >= 0.5 ? 'medium' : 'low',
    potential_savings: match.potential_savings || 0,
    recommended_action: `Request removal of duplicate charge (${match.rule})`,
    dispute_text: match.reason
  }));
  
  const suspectAmount = duplicateMatches.reduce((sum: number, m: any) => sum + (m.potential_savings || 0), 0);
  
  return {
    flags,
    totals: {
      suspect_lines: duplicateMatches.length,
      suspect_amount: Math.round(suspectAmount * 100) / 100
    }
  };
}

// Duplicate Charge Detection (legacy - kept for backwards compatibility)
async function detectDuplicateCharges(
  extractedContent: {text: string, imageData?: string},
  mainAnalysis: any,
  apiKey: string
) {
  console.log('Running duplicate charge detection...');
  
  const duplicatePrompt = `# Duplicate Charge Detector

## Objective
Identify potential duplicate charges on medical bills for itemized PDFs, basic statements, and EOBs.
Return precise flags with evidence and plain-language explanations.

## Inputs You May Receive
- Patient name or ID
- Dates of service
- Line items with: CPT, HCPCS, ICD-10-PCS, revenue code, NDC, modifiers, units, department, provider, place of service, descriptions, prices
- Claim numbers, line control numbers
- Clinical notes or timestamps when available
- Payer EOB lines and denial codes

## Strict Rules
1. Do not guess. If evidence is missing, say what is missing and classify as P2 or P3.
2. Never confuse facility vs professional claims when tax IDs differ.
3. Always normalize text before matching.
4. Always prefer code matches over description matches.
5. Use the categories P1 to P4 below.
6. Return only the JSON schema defined in "Output format" plus a short human summary.

## Normalization
- Trim and lowercase descriptions
- Strip punctuation and extra spaces
- Normalize prices to decimal
- Normalize dates to YYYY-MM-DD
- Map provider NPIs to a provider group key if available
- For descriptions, map common synonyms: CMP → comprehensive metabolic panel, ER visit → emergency department level, X-ray → radiograph

## What to Compare on Every Line
- Date of service
- Primary code: CPT or HCPCS; if none, use revenue code or normalized description
- Modifiers: 25, 59, 76, 77, 91, 50, LT, RT, XE, XS, XP, XU, 26, TC
- Units or quantity
- Department or revenue center
- Rendering provider NPI or tax ID
- Place of service
- Charge amount pattern
- NDC, dose, route for drugs

## Duplicate Patterns to Flag

### Identical Repeat
Same patient, same date, same code, same provider group, same units or split units, no modifier among 25, 59, 76, 77, 91, XE, XS, XP, XU.

### Split Units
Same code repeated across lines with units that sum to a simple total and a linear price pattern.

### Labs
- Same CPT repeats same day without modifier 91
- Panel plus component codes on the same date (treat as unbundling and flag)
- More than one venipuncture 36415 per encounter

### Imaging
- Global code billed plus separate 26 and TC for the same study
- Same study repeated same day without 76, 77, or clear timestamps

### Procedures and Therapies
- Same CPT repeats same day without 59, 76, or 77
- Time-based units exceed documented minutes

### Drugs and Infusions
- Same NDC, dose, route, and time window billed twice
- Two initial infusion hours for the same drug episode

### Blood and Transfusion Services
- **Multiple "Administration, Processing, and Storage" charges**: Two or more lines for blood administration/processing without clear differentiation by product codes (P90xx), CPT codes (36430, 96365-96376), units transfused, or time periods. Flag as P2 and request MAR, product codes, units transfused, and CPT/HCPCS codes.
- **Repeated blood handling fees**: Multiple venipuncture or handling fees for single transfusion episode.
- **Blood product plus admin**: Verify product codes match admin codes; each unit should have corresponding admin time.

### Pharmacy Aggregates
- **Multiple "Pharmacy - General Classification" lines**: When bill shows repeated pharmacy categories (General, IV Solutions, Drugs Incident to Radiology) without itemization, flag as P2 and request daily detail with NDCs, quantities, and dates for each line.
- **Pharmacy daily totals**: Multiple pharmacy subcategory charges may be legitimate daily totals by category. Classify as P2 only if amounts or descriptions suggest duplication. Request itemized pharmacy detail with dates and NDCs.
- **Missing drug codes**: Generic "pharmacy" charges without NDC, drug name, or quantity. Flag P2 and request complete itemization.

### Room, Observation, Daily Fees
More than one daily room or observation charge for a single calendar day without transfer or midnight crossover.

### Supplies
Generic supply codes or tray fees repeated with identical description and price the same day.

## Valid Repeats (Not Duplicates)
- Professional vs facility bills for the same encounter when tax IDs differ
- Bilateral or multiple sites with modifiers 50, LT, RT, or clear laterality in notes
- Separate sessions the same day with modifier 59 or X modifiers and documentation
- Reflex or staged testing documented by the lab
- Either global code, or 26+TC pairing, not both plus global

## Panel Map for Fast Checks
- 80053 CMP includes components such as AST 84450, ALT 84460, creatinine 82565, electrolytes, etc.
- 80061 lipid panel includes total cholesterol 82465, triglycerides 84478, HDL 83718, LDL method varies
- 80050 general health panel equals 80053 + 85025 + 84443

**Rule**: If a panel code appears, flag its components on the same date as unbundled.

## Category Labels

### P1 - Definite Duplicate
Meets identical repeat rules. No valid modifier. No documentation of a second service. Or unbundled panel components present with the panel.

### P2 - Likely Duplicate
Strong match on date, code, and price, but missing documentation or unclear units.

### P3 - Requires Clinical Review
Repeat present with a justifying modifier (59, 76, 77, 91, 50, LT, RT, XE, XS, XP, XU). Ask for proof.

### P4 - False Positive
Similar lines are valid due to different tax IDs, bilateral coding, or documented separate sessions.

## Evidence to Extract for Each Flag
- Line IDs or indexes
- Date of service
- Codes, modifiers, units
- Provider identifiers and tax ID if present
- Department or revenue code
- NDC, dose, route for drugs
- Timestamps if available
- Price for each line
- Any EOB denial reason mentioning duplicate

## Decision Rules (Apply in Order)

1. Group by date of service
2. Within date, group by primary code. If no code, use normalized description and revenue code
3. Within group, sub-group by provider group and place of service
4. Apply panels rule. If panel present, flag component lines as P1 unbundling
5. Apply identical repeat rule. If no valid modifiers and repeat exists, flag P1
6. Check units. If split units across lines are found with linear price, flag P1 or P2
7. For labs, require modifier 91 for same-day repeats. Else P1
8. For drugs, match NDC, dose, route, and time. Duplicates are P1
9. For daily fees, allow one per day per level of care unless transfer or midnight crossover is documented
10. If any repeat has a justifying modifier, move to P3 and request proof
11. If professional vs facility duplication is suspected, classify P4

## Confidence Scoring
- **High**: Same date, same code, same provider group, same units or split units, matching price, and no valid modifier
- **Medium**: Price or units differ slightly or documentation is missing
- **Low**: A justifying modifier is present and evidence is thin

## What to Request When Data is Missing

### General Itemization
- Full itemized bill with for each line: date, CPT or HCPCS, modifiers, units, revenue code, department, provider NPI or tax ID, and price
- Clinical notes, order sheets, radiology timestamps
- EOB or 835 remittance notes with any "duplicate" denial reasons

### Blood Services Specific
- Medication administration record (MAR) showing number of units transfused and times
- Product codes (P90xx series) for each blood product
- CPT codes: 36430 for transfusion, or 96365-96376 for infusions
- Units transfused and corresponding admin codes for each line
- **Targeted question**: "Please confirm why [X] lines for 'Administration, Processing, and Storage for Blood and Blood Components' appear for the same hospitalization. Provide CPT/HCPCS, revenue codes, units, and supporting MAR entries for each line."

### Pharmacy Specific
- Daily pharmacy detail or NDCs and quantities for each medication
- Dates of administration for multi-day admissions
- Breakdown of aggregated categories (e.g., "Pharmacy - General Classification")
- **Targeted question**: "Please provide the itemized pharmacy detail for the admission dates to validate quantities and avoid double counting."

### Labs Specific
- List of CPT codes to check for panel plus components
- Timestamps for same-day repeat tests
- Reflex testing documentation if applicable

## Plain-Language Messages per Flag

### P1 Duplicate Service
"This service appears twice on the same day from the same provider without a modifier that indicates a separate repeat. No documentation of a second session."

### P1 Unbundled Panel
"A panel test was billed together with its component tests on the same date. Components are included in the panel."

### P2 Likely Duplicate
"This looks duplicated, but the bill lacks timestamps or notes. Please provide documentation or correct the charge."

### P2 Blood Services
"Two lines for 'Administration, Processing, and Storage for Blood and Blood Components.' Could be separate services or units, or could be admin time plus product handling. Needs CPT/HCPCS or revenue codes and units to confirm."

### P2 Pharmacy Aggregates
"Multiple 'Pharmacy - General Classification' lines. Likely daily pharmacy totals by category. Not a duplicate by itself. Verify dates and units with itemized detail."

### P3 Needs Review
"A repeat is present with modifier [code]. Please provide records that show a distinct session, site, or medical need."

### P4 Not a Duplicate
"These are separate facility and professional charges for the same encounter. Different tax IDs."

## Dispute Text Generator Rules
- For P1 duplicates, cite date, code, provider, lack of modifier, and absence of documentation. Ask for removal and corrected bill.
- For P1 panel unbundling, cite the panel and list components. Ask to remove components or the panel.
- For P2 general, request timestamps, second orders, or notes.
- For P2 blood services, request: "Please confirm why [X] lines for 'Administration, Processing, and Storage for Blood and Blood Components' appear for the same hospitalization. Provide CPT/HCPCS, revenue codes, units, and supporting MAR entries for each line."
- For P2 pharmacy aggregates, request: "Please provide the itemized pharmacy detail for the admission dates to validate quantities and avoid double counting."
- For P3, request proof that supports the modifier used.

## Output Format
Return a JSON object with the following schema:

{
  "bill_id": "string",
  "patient_id": "string|null",
  "service_dates": ["YYYY-MM-DD"],
  "flags": [
    {
      "category": "P1|P2|P3|P4",
      "reason": "string",
      "evidence": {
        "line_ids": ["string|int"],
        "date_of_service": "YYYY-MM-DD",
        "codes": [{"type":"CPT|HCPCS|REV|NDC|DESC","value":"string"}],
        "modifiers": ["string"],
        "units": ["number"],
        "provider_group": "string|null",
        "place_of_service": "string|null",
        "ndc_dose_route": {"ndc":"string|null","dose":"string|null","route":"string|null"},
        "prices": ["number"],
        "timestamps": ["HH:MM"|null],
        "eob_notes": "string|null"
      },
      "panel_unbundling": {"panel_code":"string|null","component_codes":["string"]},
      "confidence": "high|medium|low",
      "recommended_action": "string",
      "dispute_text": "string"
    }
  ],
  "nsa_review": {
    "applies": "yes|no|unknown",
    "scenarios": ["string"],
    "missing_for_nsa": ["string"],
    "prelim_assessment": "string"
  },
  "pricing_review": {
    "has_eob": "yes|no",
    "suspect_overcharge_amount": "number|null",
    "notes": "string"
  },
  "totals": {
    "suspect_lines": "int",
    "suspect_amount": "number|null"
  },
  "missing_data_requests": ["string"]
}`;
  
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
