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
    console.log('Starting CMS RVU data processing...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the ZIP file from storage or request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('File received:', file.name, file.size);

    // Read the ZIP file
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // For now, we'll parse CSV directly if it's a CSV file
    // If it's truly a ZIP, we'll need to extract it first
    const text = new TextDecoder().decode(uint8Array);
    
    // Check if this is CSV data (starts with header or data)
    let csvText = text;
    
    // Try to detect if it's actually CSV content
    if (!text.includes('\n') || text.includes('PK\x03\x04')) {
      // It's a binary ZIP file, need different approach
      throw new Error('ZIP extraction not yet implemented. Please upload extracted CSV file.');
    }

    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV file');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Headers:', headers);

    // Find relevant column indices
    const cptIndex = headers.findIndex(h => h.toLowerCase().includes('cpt') || h.toLowerCase().includes('hcpcs'));
    const descIndex = headers.findIndex(h => h.toLowerCase().includes('desc'));
    const facilityIndex = headers.findIndex(h => h.toLowerCase().includes('facility') && h.toLowerCase().includes('rate'));
    const nonFacilityIndex = headers.findIndex(h => h.toLowerCase().includes('non') && h.toLowerCase().includes('facility'));

    if (cptIndex === -1) {
      throw new Error(`Could not find CPT code column. Available headers: ${headers.join(', ')}`);
    }

    let imported = 0;
    let errors = 0;

    // Process in batches
    for (let i = 1; i < Math.min(lines.length, 1000); i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      const cptCode = values[cptIndex];
      if (!cptCode || cptCode.length < 4) continue;

      const description = descIndex >= 0 ? values[descIndex] : '';
      const facilityRate = facilityIndex >= 0 ? parseFloat(values[facilityIndex]) : 0;
      const nonFacilityRate = nonFacilityIndex >= 0 ? parseFloat(values[nonFacilityIndex]) : facilityRate;

      try {
        const { error } = await supabase
          .from('medicare_prices')
          .upsert({
            cpt_code: cptCode,
            description: description || 'Medicare procedure',
            medicare_facility_rate: facilityRate || nonFacilityRate || 0
          }, {
            onConflict: 'cpt_code'
          });

        if (error) {
          console.error('Error inserting:', cptCode, error);
          errors++;
        } else {
          imported++;
          if (imported % 100 === 0) {
            console.log(`Imported ${imported} records...`);
          }
        }
      } catch (err) {
        console.error('Error processing:', cptCode, err);
        errors++;
      }
    }

    console.log(`Import complete: ${imported} records, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        errors,
        message: `Successfully imported ${imported} Medicare pricing records`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in process-cms-zip:', error);
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
