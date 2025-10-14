import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-token',
};

interface BillAnalysis {
  file_name?: string;
  file_type?: string;
  status?: string;
  extracted_text?: string;
  critical_issues?: number;
  moderate_issues?: number;
  estimated_savings?: number;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar token de API
    const apiToken = req.headers.get('x-api-token');
    
    if (!apiToken) {
      console.error('Missing API token');
      return new Response(
        JSON.stringify({ error: 'Missing API token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validar token
    const tokenId = await supabase.rpc('validate_api_token', { 
      token_value: apiToken 
    });

    if (!tokenId.data) {
      console.error('Invalid API token');
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/n8n-api/', '');

    // GET /bill-analyses - Listar análises
    if (req.method === 'GET' && path === 'bill-analyses') {
      const limit = url.searchParams.get('limit') || '10';
      const offset = url.searchParams.get('offset') || '0';

      const { data, error } = await supabase
        .from('bill_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit))
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (error) {
        console.error('Error fetching bill analyses:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data, count: data.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /bill-analyses/:id - Obter análise específica
    if (req.method === 'GET' && path.startsWith('bill-analyses/')) {
      const id = path.replace('bill-analyses/', '');

      const { data, error } = await supabase
        .from('bill_analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching bill analysis:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /bill-analyses - Criar nova análise
    if (req.method === 'POST' && path === 'bill-analyses') {
      const body = await req.json();
      const analysis: BillAnalysis = {
        file_name: body.file_name,
        file_type: body.file_type || 'pdf',
        status: body.status || 'processing',
        extracted_text: body.extracted_text,
        critical_issues: body.critical_issues || 0,
        moderate_issues: body.moderate_issues || 0,
        estimated_savings: body.estimated_savings || 0,
      };

      const { data, error } = await supabase
        .from('bill_analyses')
        .insert([analysis])
        .select()
        .single();

      if (error) {
        console.error('Error creating bill analysis:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PATCH /bill-analyses/:id - Atualizar análise
    if (req.method === 'PATCH' && path.startsWith('bill-analyses/')) {
      const id = path.replace('bill-analyses/', '');
      const body = await req.json();

      const { data, error } = await supabase
        .from('bill_analyses')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating bill analysis:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /bill-analyses/:id - Deletar análise
    if (req.method === 'DELETE' && path.startsWith('bill-analyses/')) {
      const id = path.replace('bill-analyses/', '');

      const { error } = await supabase
        .from('bill_analyses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting bill analysis:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rota não encontrada
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in n8n-api function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
