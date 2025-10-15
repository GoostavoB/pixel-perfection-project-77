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
    console.log('Starting CSV import for pricing data...');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const dataType = formData.get('type') as string; // 'medicare' or 'custom'
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('File received:', file.name, file.type, file.size);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read CSV content
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain header and at least one data row');
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record: any = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      
      records.push(record);
    }

    console.log(`Parsed ${records.length} records from CSV`);

    // Import based on type
    let imported = 0;
    let errors = 0;

    if (dataType === 'medicare') {
      // Import to medicare_prices table
      for (const record of records) {
        try {
          const { error } = await supabase
            .from('medicare_prices')
            .upsert({
              cpt_code: record.cpt_code,
              description: record.description,
              medicare_facility_rate: parseFloat(record.facility_rate || record.medicare_facility_rate || '0')
            }, {
              onConflict: 'cpt_code'
            });

          if (error) {
            console.error('Error inserting record:', record.cpt_code, error);
            errors++;
          } else {
            imported++;
          }
        } catch (err) {
          console.error('Error processing record:', record.cpt_code, err);
          errors++;
        }
      }
    } else if (dataType === 'custom') {
      // Import to custom_pricing_data table
      for (const record of records) {
        try {
          const { error } = await supabase
            .from('custom_pricing_data')
            .insert({
              cpt_code: record.cpt_code,
              description: record.description,
              custom_rate: parseFloat(record.custom_rate || record.rate || '0'),
              source: record.source || 'CSV Import',
              region: record.region || null
            });

          if (error) {
            console.error('Error inserting record:', record.cpt_code, error);
            errors++;
          } else {
            imported++;
          }
        } catch (err) {
          console.error('Error processing record:', record.cpt_code, err);
          errors++;
        }
      }
    }

    console.log(`Import complete: ${imported} records imported, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        errors,
        total: records.length,
        message: `Successfully imported ${imported} of ${records.length} records`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in import-pricing-csv:', error);
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
