import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const disputeLetterSchema = z.object({
  sessionId: z.string()
    .trim()
    .min(1, "Session ID is required")
    .max(100, "Session ID too long"),
  userName: z.string()
    .trim()
    .max(200, "Name must be less than 200 characters")
    .optional()
    .nullable(),
  userAddress: z.string()
    .trim()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .nullable(),
  letterText: z.string()
    .trim()
    .min(1, "Letter text is required")
    .max(50000, "Letter text must be less than 50,000 characters")
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: {
          persistSession: false,
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();

    // Validate input data
    const validationResult = disputeLetterSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input data',
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, userName, userAddress, letterText } = validationResult.data;
    
    console.log('Saving dispute letter for session:', sessionId);

    // Check if dispute letter already exists for this session
    const { data: existing } = await supabaseClient
      .from('dispute_letters')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabaseClient
        .from('dispute_letters')
        .update({
          template_text: letterText,
          user_name: userName || null,
          user_address: userAddress || null,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseClient
        .from('dispute_letters')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          template_text: letterText,
          user_name: userName || null,
          user_address: userAddress || null
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Send to n8n for PDF generation (background)
    try {
      const n8nResponse = await fetch('https://learnlearnlearn.app.n8n.cloud/webhook/save-dispute-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_name: userName,
          user_address: userAddress,
          letter_text: letterText
        })
      });

      if (n8nResponse.ok) {
        const n8nData = await n8nResponse.json();
        if (n8nData.pdf_url) {
          await supabaseClient
            .from('dispute_letters')
            .update({ pdf_url: n8nData.pdf_url })
            .eq('session_id', sessionId)
            .eq('user_id', user.id);
          result.pdf_url = n8nData.pdf_url;
        }
      }
    } catch (n8nError) {
      console.warn('N8N PDF generation failed (non-critical):', n8nError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dispute letter saved successfully',
        dispute_letter: result
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in save-dispute-letter:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
