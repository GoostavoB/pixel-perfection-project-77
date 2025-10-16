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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { endpoint } = await req.json();

    let data = null;
    let error = null;

    switch (endpoint) {
      case 'summary':
        ({ data, error } = await supabase
          .from('pricing_analytics_summary')
          .select('*')
          .single());
        break;

      case 'trending':
        ({ data, error } = await supabase.rpc('get_trending_cpt_codes', { days_back: 7 }));
        break;

      case 'coverage':
        ({ data, error } = await supabase.rpc('get_pricing_coverage_stats'));
        break;

      case 'performance':
        ({ data, error } = await supabase.rpc('get_performance_trends', { hours_back: 24 }));
        break;

      default:
        throw new Error('Invalid endpoint');
    }

    if (error) throw error;

    return new Response(
      JSON.stringify({ data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[ANALYTICS] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
