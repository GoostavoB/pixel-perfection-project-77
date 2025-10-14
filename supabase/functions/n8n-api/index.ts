import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-token',
}

// Valida o token de API
async function validateToken(supabase: any, token: string): Promise<boolean> {
  const { data } = await supabase.rpc('validate_api_token', { token_value: token })
  return data !== null
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Valida token de API
    const apiToken = req.headers.get('x-api-token')
    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: 'Missing API token. Include X-API-Token header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isValid = await validateToken(supabaseClient, apiToken)
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { action, table, data, filters } = await req.json()

    console.log('N8N API Request:', { action, table, filters })

    // Valida inputs
    if (!action || !table) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action and table' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Tabelas permitidas
    const allowedTables = ['bill_analyses', 'analysis_results', 'jobs', 'user_form_data', 'dispute_letters']
    if (!allowedTables.includes(table)) {
      return new Response(
        JSON.stringify({ error: `Table not allowed. Allowed tables: ${allowedTables.join(', ')}` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result

    // Executa ação
    switch (action) {
      case 'select': {
        let query = supabaseClient.from(table).select('*')
        
        // Aplica filtros se fornecidos
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }
        
        const { data: rows, error } = await query
        if (error) throw error
        result = { data: rows, count: rows.length }
        break
      }

      case 'insert': {
        if (!data) {
          return new Response(
            JSON.stringify({ error: 'Missing data for insert' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data: inserted, error } = await supabaseClient
          .from(table)
          .insert(data)
          .select()
        if (error) throw error
        result = { data: inserted }
        break
      }

      case 'update': {
        if (!data || !filters) {
          return new Response(
            JSON.stringify({ error: 'Missing data or filters for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        let query = supabaseClient.from(table).update(data)
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        const { data: updated, error } = await query.select()
        if (error) throw error
        result = { data: updated }
        break
      }

      case 'delete': {
        if (!filters) {
          return new Response(
            JSON.stringify({ error: 'Missing filters for delete' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        let query = supabaseClient.from(table).delete()
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        const { data: deleted, error } = await query.select()
        if (error) throw error
        result = { data: deleted }
        break
      }

      default:
        return new Response(
          JSON.stringify({ error: `Invalid action. Allowed: select, insert, update, delete` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in n8n-api function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
