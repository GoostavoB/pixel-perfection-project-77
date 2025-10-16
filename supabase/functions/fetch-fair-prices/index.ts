import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FairPriceResult {
  cpt_code: string;
  description: string;
  fair_price: number;
  fair_price_range: {
    min: number;
    max: number;
    recommended: number;
  };
  medicare_rate: number;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  cached: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let metricsData = {
    total_codes: 0,
    cached_codes: 0,
    api_calls: 0,
    error_count: 0
  };

  try {
    const { cptCodes, state, forceRefresh } = await req.json();
    
    if (!cptCodes || !Array.isArray(cptCodes) || cptCodes.length === 0) {
      throw new Error('cptCodes array is required');
    }

    console.log(`Fetching fair prices for ${cptCodes.length} CPT codes in state: ${state || 'National'}`);
    
    metricsData.total_codes = cptCodes.length;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: FairPriceResult[] = [];
    const CACHE_DURATION_DAYS = 30;
    
    // ⚡ PHASE 3A: BATCH cache lookup for performance
    console.log('[CACHE] Checking cache for all codes at once...');
    const cacheDate = new Date();
    cacheDate.setDate(cacheDate.getDate() - CACHE_DURATION_DAYS);
    
    let cachedRecords: any[] = [];
    
    if (!forceRefresh) {
      const { data: batchCached } = await supabase
        .from('medicare_prices')
        .select('*')
        .in('cpt_code', cptCodes)
        .gte('created_at', cacheDate.toISOString());
      
      cachedRecords = batchCached || [];
      console.log(`[CACHE] ✓ Found ${cachedRecords.length}/${cptCodes.length} codes in cache`);
    }
    
    // Create map for quick lookup
    const cacheMap = new Map<string, any>();
    cachedRecords.forEach(record => {
      cacheMap.set(record.cpt_code, record);
    });
    
    // Separate cached vs uncached codes
    const uncachedCodes: string[] = [];
    const cachedResults: FairPriceResult[] = [];
    
    for (const cptCode of cptCodes) {
      const cached = cacheMap.get(cptCode);
      
      if (cached) {
        // Build result from cache
        const medicareRate = cached.medicare_facility_rate || 0;
        const fairPrice = medicareRate * 1.5;
        
        cachedResults.push({
          cpt_code: cptCode,
          description: cached.description || 'Medical procedure',
          fair_price: fairPrice,
          fair_price_range: {
            min: medicareRate * 0.8,
            max: medicareRate * 2.5,
            recommended: fairPrice
          },
          medicare_rate: medicareRate,
          confidence: 'high',
          source: 'Cached Medicare Rate',
          cached: true
        });
      } else {
        uncachedCodes.push(cptCode);
      }
    }
    
    console.log(`[CACHE] Using ${cachedResults.length} cached, fetching ${uncachedCodes.length} from API`);
    results.push(...cachedResults);
    
    metricsData.cached_codes = cachedResults.length;
    metricsData.api_calls = uncachedCodes.length;

    // ⚡ PHASE 3A: Fetch uncached codes from API (if any)
    for (const cptCode of uncachedCodes) {
      let pricingData: FairPriceResult | null = null;
      console.log(`⟳ Fetching fresh data from CMS APIs for CPT ${cptCode}...`);
      
      try {
        const fetchResponse = await supabase.functions.invoke('fetch-cms-pricing', {
          body: {
            cptCodes: [cptCode],
            fetchFromAPI: true
          }
        });

        if (fetchResponse.data?.results?.[0] && !fetchResponse.data.results[0].not_found) {
          const apiResult = fetchResponse.data.results[0];
          const medicareRate = apiResult.medicare_facility_rate || 0;
          
          // Extract fair price range from API metadata if available
          const apiMetadata = apiResult.api_metadata || {};
          const fairPriceRange = apiMetadata.fair_price_range || {
            min: medicareRate * 0.8,
            max: medicareRate * 2.5,
            recommended: medicareRate * 1.5
          };
          
          pricingData = {
            cpt_code: cptCode,
            description: apiResult.description || 'Medical procedure',
            fair_price: fairPriceRange.recommended,
            fair_price_range: fairPriceRange,
            medicare_rate: medicareRate,
            confidence: apiMetadata.confidence || 'medium',
            source: apiMetadata.source || 'CMS API',
            cached: false
          };
          
          console.log(`✓ Fetched fresh data for CPT ${cptCode} from ${pricingData.source}`);
        } else {
          console.log(`✗ No data found for CPT ${cptCode}`);
          
          // Use conservative estimate based on category
          const estimatedRate = estimateRateFromCPT(cptCode);
          pricingData = {
            cpt_code: cptCode,
            description: 'Medical procedure (estimated)',
            fair_price: estimatedRate * 1.5,
            fair_price_range: {
              min: estimatedRate * 0.8,
              max: estimatedRate * 2.5,
              recommended: estimatedRate * 1.5
            },
            medicare_rate: estimatedRate,
            confidence: 'low',
            source: 'Estimated (CPT pattern)',
            cached: false
          };
        }
      } catch (apiError) {
        console.error(`Error fetching from API for CPT ${cptCode}:`, apiError);
        metricsData.error_count++;
        
        // Fallback to estimation
        const estimatedRate = estimateRateFromCPT(cptCode);
        pricingData = {
          cpt_code: cptCode,
          description: 'Medical procedure (estimated)',
          fair_price: estimatedRate * 1.5,
          fair_price_range: {
            min: estimatedRate * 0.8,
            max: estimatedRate * 2.5,
            recommended: estimatedRate * 1.5
          },
          medicare_rate: estimatedRate,
          confidence: 'low',
          source: 'Estimated (API error)',
          cached: false
        };
      }

      if (pricingData) {
        results.push(pricingData);
      }
    }

    // Calculate summary statistics
    const summary = {
      total_codes: cptCodes.length,
      found: results.length,
      cached: results.filter(r => r.cached).length,
      fresh: results.filter(r => !r.cached).length,
      high_confidence: results.filter(r => r.confidence === 'high').length,
      medium_confidence: results.filter(r => r.confidence === 'medium').length,
      low_confidence: results.filter(r => r.confidence === 'low').length
    };

    console.log('Fair price fetch complete:', summary);

    // ⚡ PHASE 3B: Log metrics to database (non-blocking)
    const responseTime = Date.now() - startTime;
    const cacheHitRate = metricsData.total_codes > 0 
      ? ((metricsData.cached_codes / metricsData.total_codes) * 100).toFixed(2)
      : '0.00';
    
    // Estimate cost saved (assume $0.01 per API call avoided)
    const estimatedCostSaved = (metricsData.cached_codes * 0.01).toFixed(4);
    
    supabase.from('fair_price_metrics').insert({
      request_type: metricsData.total_codes > 1 ? 'batch' : 'single',
      total_codes: metricsData.total_codes,
      cached_codes: metricsData.cached_codes,
      api_calls: metricsData.api_calls,
      cache_hit_rate: parseFloat(cacheHitRate),
      response_time_ms: responseTime,
      estimated_cost_saved: parseFloat(estimatedCostSaved),
      error_count: metricsData.error_count
    }).then(({ error }) => {
      if (error) console.error('[METRICS] Failed to log:', error);
      else console.log(`[METRICS] ✓ Logged: ${cacheHitRate}% hit rate, ${responseTime}ms, $${estimatedCostSaved} saved`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary,
        performance: {
          cache_hit_rate: `${cacheHitRate}%`,
          response_time_ms: responseTime,
          estimated_cost_saved: `$${estimatedCostSaved}`
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-fair-prices:', error);
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

/**
 * Estimate Medicare rate based on CPT code patterns
 */
function estimateRateFromCPT(cptCode: string): number {
  const code = parseInt(cptCode);
  
  // Office visits (99202-99215)
  if (code >= 99202 && code <= 99215) return 120;
  
  // Hospital visits (99221-99239)
  if (code >= 99221 && code <= 99239) return 150;
  
  // Emergency visits (99281-99285)
  if (code >= 99281 && code <= 99285) return 200;
  
  // Critical care (99291-99292)
  if (code >= 99291 && code <= 99292) return 300;
  
  // Lab tests (80000-89999)
  if (code >= 80000 && code <= 89999) return 25;
  
  // Radiology - X-rays (70000-76999)
  if (code >= 70000 && code <= 76999) {
    // CT scans (70000-74999)
    if (code >= 70000 && code <= 74999) return 250;
    // MRI (70000-70999)
    if (code >= 70000 && code <= 70999) return 400;
    // Ultrasound (76000-76999)
    return 100;
  }
  
  // Surgery (10000-69999)
  if (code >= 10000 && code <= 69999) return 800;
  
  // Default estimate
  return 100;
}
