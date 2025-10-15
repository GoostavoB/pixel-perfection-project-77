import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CMS Data API Configuration
const CMS_CATALOG_URL = "https://data.cms.gov/data.json";

// Common CPT codes for bulk import
const COMMON_CPT_CODES = [
  { code: '99213', desc: 'Office visit, established patient, level 3', rate: 93.85 },
  { code: '99214', desc: 'Office visit, established patient, level 4', rate: 139.27 },
  { code: '99232', desc: 'Hospital inpatient care, subsequent', rate: 81.15 },
  { code: '99233', desc: 'Hospital inpatient care, subsequent, high complexity', rate: 120.80 },
  { code: '99291', desc: 'Critical care, first hour', rate: 313.84 },
  { code: '99283', desc: 'Emergency dept visit, level 3', rate: 106.97 },
  { code: '99284', desc: 'Emergency dept visit, level 4', rate: 177.86 },
  { code: '99285', desc: 'Emergency dept visit, level 5', rate: 267.65 },
  { code: '36415', desc: 'Venipuncture, routine', rate: 3.00 },
  { code: '80053', desc: 'Comprehensive metabolic panel', rate: 13.71 },
  { code: '85025', desc: 'Complete blood count (CBC)', rate: 10.84 },
  { code: '93000', desc: 'Electrocardiogram (EKG)', rate: 17.01 },
  { code: '71046', desc: 'Chest X-ray, 2 views', rate: 36.36 },
  { code: '71047', desc: 'Chest X-ray, 3 views', rate: 44.23 },
  { code: '71048', desc: 'Chest X-ray, 4+ views', rate: 52.99 },
  { code: '70450', desc: 'CT head without contrast', rate: 189.44 },
  { code: '70486', desc: 'CT maxillofacial without contrast', rate: 170.02 },
  { code: '70491', desc: 'CT soft tissue neck without contrast', rate: 180.81 },
  { code: '71250', desc: 'CT thorax without contrast', rate: 189.44 },
  { code: '72125', desc: 'CT cervical spine without contrast', rate: 185.45 },
  { code: '72126', desc: 'CT cervical spine with contrast', rate: 232.37 },
  { code: '72127', desc: 'CT cervical spine without and with contrast', rate: 279.29 },
  { code: '72131', desc: 'CT lumbar spine without contrast', rate: 195.82 },
  { code: '72132', desc: 'CT lumbar spine with contrast', rate: 245.54 },
  { code: '72133', desc: 'CT lumbar spine without and with contrast', rate: 295.26 },
  { code: '73200', desc: 'CT upper extremity without contrast', rate: 172.41 },
  { code: '73700', desc: 'CT lower extremity without contrast', rate: 172.41 },
  { code: '74150', desc: 'CT abdomen without contrast', rate: 195.82 },
  { code: '74160', desc: 'CT abdomen with contrast', rate: 245.54 },
  { code: '74170', desc: 'CT abdomen without and with contrast', rate: 295.26 },
  { code: '74176', desc: 'CT abdomen and pelvis without contrast', rate: 239.55 },
  { code: '74177', desc: 'CT abdomen and pelvis with contrast', rate: 299.65 },
  { code: '74178', desc: 'CT abdomen and pelvis without and with contrast', rate: 359.75 },
  { code: '76700', desc: 'Ultrasound, abdominal, complete', rate: 73.48 },
  { code: '76705', desc: 'Ultrasound, abdominal, limited', rate: 54.19 },
  { code: '76770', desc: 'Ultrasound, retroperitoneal, complete', rate: 79.86 },
  { code: '76775', desc: 'Ultrasound, retroperitoneal, limited', rate: 54.19 },
  { code: '76830', desc: 'Ultrasound, transvaginal', rate: 73.08 },
  { code: '93306', desc: 'Echocardiography, complete', rate: 154.29 },
  { code: '93307', desc: 'Echocardiography with Doppler, complete', rate: 57.78 },
  { code: '93308', desc: 'Echocardiography follow-up', rate: 48.59 },
  { code: '95810', desc: 'Polysomnography, sleep staging', rate: 355.76 },
  { code: '99203', desc: 'Office visit, new patient, level 3', rate: 118.41 },
  { code: '99204', desc: 'Office visit, new patient, level 4', rate: 177.46 },
  { code: '99205', desc: 'Office visit, new patient, level 5', rate: 236.51 },
  { code: '99221', desc: 'Initial hospital care, level 1', rate: 77.75 },
  { code: '99222', desc: 'Initial hospital care, level 2', rate: 120.00 },
  { code: '99223', desc: 'Initial hospital care, level 3', rate: 168.25 },
  { code: '99231', desc: 'Subsequent hospital care, level 1', rate: 52.50 },
  { code: '99238', desc: 'Hospital discharge day management', rate: 92.54 },
  { code: '99239', desc: 'Hospital discharge day management, >30 min', rate: 138.81 },
  { code: '99281', desc: 'Emergency dept visit, level 1', rate: 31.24 },
  { code: '99282', desc: 'Emergency dept visit, level 2', rate: 62.48 },
  { code: '90834', desc: 'Psychotherapy, 45 minutes', rate: 97.48 },
  { code: '90837', desc: 'Psychotherapy, 60 minutes', rate: 146.22 },
  { code: '97110', desc: 'Physical therapy, therapeutic exercises', rate: 35.43 },
  { code: '97140', desc: 'Manual therapy techniques', rate: 35.43 },
  { code: '97530', desc: 'Therapeutic activities', rate: 40.22 },
  { code: '29881', desc: 'Knee arthroscopy with meniscectomy', rate: 484.86 },
  { code: '45378', desc: 'Colonoscopy, diagnostic', rate: 228.78 },
  { code: '43239', desc: 'Upper endoscopy with biopsy', rate: 195.42 },
  { code: '47562', desc: 'Laparoscopic cholecystectomy', rate: 624.38 },
  { code: '49505', desc: 'Inguinal hernia repair, initial', rate: 462.29 },
  { code: '27447', desc: 'Total knee arthroplasty', rate: 1157.64 },
  { code: '27130', desc: 'Total hip arthroplasty', rate: 1086.42 }
];

/**
 * Fetch CMS API catalog to discover available datasets
 */
async function fetchCMSCatalog() {
  try {
    console.log('Fetching CMS data catalog...');
    const response = await fetch(CMS_CATALOG_URL);
    
    if (!response.ok) {
      throw new Error(`CMS catalog returned ${response.status}`);
    }
    
    const catalog = await response.json();
    const datasets = catalog.dataset || [];
    
    // Filter for physician fee schedule related datasets
    const pfsDatasets = datasets.filter((ds: any) => {
      const title = (ds.title || '').toLowerCase();
      const desc = (ds.description || '').toLowerCase();
      const keywords = (ds.keyword || []).map((k: string) => k.toLowerCase());
      
      return title.includes('physician fee') || 
             title.includes('medicare physician') ||
             title.includes('fee schedule') ||
             desc.includes('physician fee schedule') ||
             keywords.some((k: string) => k.includes('physician') || k.includes('fee schedule'));
    });
    
    console.log(`Found ${pfsDatasets.length} relevant datasets out of ${datasets.length} total`);
    return pfsDatasets;
    
  } catch (error) {
    console.error('Error fetching CMS catalog:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bulkUpdate, exploreCatalog, cptCodes } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Explore CMS API catalog
    if (exploreCatalog) {
      const datasets = await fetchCMSCatalog();
      
      return new Response(
        JSON.stringify({
          success: true,
          total: datasets.length,
          datasets: datasets.map((ds: any) => ({
            title: ds.title,
            identifier: ds.identifier,
            description: ds.description,
            modified: ds.modified,
            keyword: ds.keyword
          }))
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Bulk import common CPT codes
    if (bulkUpdate) {
      console.log(`Starting bulk import of ${COMMON_CPT_CODES.length} common CPT codes...`);
      
      let imported = 0;
      let errors = 0;

      for (const cpt of COMMON_CPT_CODES) {
        try {
          const { error } = await supabase
            .from('medicare_prices')
            .upsert({
              cpt_code: cpt.code,
              description: cpt.desc,
              medicare_facility_rate: cpt.rate
            }, {
              onConflict: 'cpt_code'
            });

          if (error) {
            console.error(`Error upserting CPT ${cpt.code}:`, error);
            errors++;
          } else {
            imported++;
          }
        } catch (err) {
          console.error(`Error processing CPT ${cpt.code}:`, err);
          errors++;
        }
      }

      console.log(`Bulk import complete: ${imported} imported, ${errors} errors`);

      return new Response(
        JSON.stringify({
          success: true,
          imported,
          errors,
          total: COMMON_CPT_CODES.length,
          message: `Successfully imported ${imported} of ${COMMON_CPT_CODES.length} Medicare pricing records`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Lookup specific CPT codes
    if (cptCodes && Array.isArray(cptCodes)) {
      const results = [];
      
      for (const code of cptCodes) {
        const { data: existing } = await supabase
          .from('medicare_prices')
          .select('*')
          .eq('cpt_code', code)
          .maybeSingle();

        if (existing) {
          results.push(existing);
        } else {
          results.push({ cpt_code: code, not_found: true });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          results
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    throw new Error('Please provide one of: bulkUpdate, exploreCatalog, or cptCodes array');

  } catch (error) {
    console.error('Error in fetch-cms-pricing:', error);
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
