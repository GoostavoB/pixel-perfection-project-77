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

  try {
    const { cptCodes, state, forceRefresh } = await req.json();
    
    if (!cptCodes || !Array.isArray(cptCodes) || cptCodes.length === 0) {
      throw new Error('cptCodes array is required');
    }

    console.log(`Fetching fair prices for ${cptCodes.length} CPT codes in state: ${state || 'National'}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: FairPriceResult[] = [];
    const CACHE_DURATION_DAYS = 30;

    for (const cptCode of cptCodes) {
      let pricingData: FairPriceResult | null = null;
      let fromCache = false;

      // Check cache first (unless forceRefresh is true)
      if (!forceRefresh) {
        const cacheDate = new Date();
        cacheDate.setDate(cacheDate.getDate() - CACHE_DURATION_DAYS);
        
        const { data: cached } = await supabase
          .from('medicare_prices')
          .select('*')
          .eq('cpt_code', cptCode)
          .gte('created_at', cacheDate.toISOString())
          .maybeSingle();

        if (cached) {
          console.log(`✓ Using cached data for CPT ${cptCode}`);
          fromCache = true;
          
          // Calculate fair price range based on Medicare rate
          const medicareRate = cached.medicare_facility_rate || 0;
          const fairPrice = medicareRate * 1.5; // 150% of Medicare (typical fair market)
          
          pricingData = {
            cpt_code: cptCode,
            description: cached.description || 'Medical procedure',
            fair_price: fairPrice,
            fair_price_range: {
              min: medicareRate * 0.8,     // 80% of Medicare (absolute minimum)
              max: medicareRate * 2.5,     // 250% of Medicare (high but reasonable)
              recommended: fairPrice        // 150% of Medicare
            },
            medicare_rate: medicareRate,
            confidence: 'high',
            source: 'Cached Medicare Rate',
            cached: true
          };
        }
      }

      // If not in cache or forceRefresh, fetch from CMS APIs
      if (!pricingData) {
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

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary
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
