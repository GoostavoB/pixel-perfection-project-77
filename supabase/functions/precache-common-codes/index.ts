import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ⚡ PHASE 3A: Pre-cache most common medical procedure codes
const MOST_COMMON_CODES = [
  // Emergency & Critical Care
  '99283', '99284', '99285', '99291', '99292',
  
  // Office Visits
  '99213', '99214', '99215', '99203', '99204', '99205',
  
  // Hospital Care
  '99221', '99222', '99223', '99231', '99232', '99233', '99238', '99239',
  
  // Lab Tests
  '80053', '85025', '85027', '80048', '82947', '84443', '84450',
  
  // Imaging - X-Ray
  '71046', '71047', '71048', '73610', '73620', '73630',
  
  // Imaging - CT
  '70450', '70486', '70491', '71250', '72125', '72126', '72127',
  '72131', '72132', '72133', '73200', '73700', '74150', '74160',
  '74170', '74176', '74177', '74178',
  
  // Imaging - MRI
  '70551', '70552', '70553', '72141', '72142', '72148', '72149',
  '73218', '73219', '73720', '73721',
  
  // Imaging - Ultrasound
  '76700', '76705', '76770', '76775', '76830', '76856', '76857',
  
  // Cardiology
  '93000', '93005', '93306', '93307', '93308', '93350',
  
  // Surgery - Common
  '29881', '45378', '43239', '47562', '49505', '27447', '27130',
  
  // Therapy
  '90834', '90837', '97110', '97140', '97530',
  
  // Sleep Studies
  '95810', '95811',
  
  // Anesthesia
  '00100', '00400', '00670', '01992'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PRECACHE] Starting pre-cache of common codes...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check which codes are already cached
    const { data: existing } = await supabase
      .from('medicare_prices')
      .select('cpt_code')
      .in('cpt_code', MOST_COMMON_CODES);
    
    const existingCodes = new Set(existing?.map((r: any) => r.cpt_code) || []);
    const missingCodes = MOST_COMMON_CODES.filter(code => !existingCodes.has(code));
    
    console.log(`[PRECACHE] ${existingCodes.size} codes already cached, ${missingCodes.length} need fetching`);
    
    if (missingCodes.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'All common codes already cached',
          total: MOST_COMMON_CODES.length,
          cached: existingCodes.size,
          fetched: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Fetch missing codes in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10;
    let totalFetched = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < missingCodes.length; i += BATCH_SIZE) {
      const batch = missingCodes.slice(i, i + BATCH_SIZE);
      console.log(`[PRECACHE] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.join(', ')}`);
      
      try {
        const { data: fetchData, error: fetchError } = await supabase.functions.invoke('fetch-cms-pricing', {
          body: {
            cptCodes: batch,
            fetchFromAPI: true
          }
        });
        
        if (fetchError) {
          console.error(`[PRECACHE] Error fetching batch:`, fetchError);
          totalErrors += batch.length;
          continue;
        }
        
        if (fetchData?.results) {
          const successfulFetches = fetchData.results.filter((r: any) => !r.not_found);
          totalFetched += successfulFetches.length;
          console.log(`[PRECACHE] ✓ Fetched ${successfulFetches.length}/${batch.length} codes in this batch`);
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (batchError) {
        console.error(`[PRECACHE] Batch error:`, batchError);
        totalErrors += batch.length;
      }
    }
    
    console.log(`[PRECACHE] ✅ Complete: ${totalFetched} new codes cached, ${totalErrors} errors`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Pre-cached ${totalFetched} common medical codes`,
        total: MOST_COMMON_CODES.length,
        already_cached: existingCodes.size,
        fetched: totalFetched,
        errors: totalErrors,
        coverage_percent: Math.round(((existingCodes.size + totalFetched) / MOST_COMMON_CODES.length) * 100)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[PRECACHE] Error:', error);
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
