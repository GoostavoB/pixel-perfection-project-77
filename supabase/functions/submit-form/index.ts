import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formSchema = z.object({
  sessionId: z.string().min(1).max(100),
  email: z.string().email().max(255),
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = formSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, email, name, phone } = validation.data;

    // Update bill analysis with user info
    const { data: analysis, error: updateError } = await supabase
      .from('bill_analyses')
      .update({
        user_email: email,
        user_name: name,
        user_phone: phone
      })
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError || !analysis) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email in background (don't await)
    sendAnalysisEmail(email, name, analysis).catch(console.error);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: {
          critical_issues: analysis.critical_issues,
          moderate_issues: analysis.moderate_issues,
          estimated_savings: analysis.estimated_savings,
          issues: analysis.issues
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-form:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendAnalysisEmail(email: string, name: string | undefined, analysis: any) {
  try {
    console.log(`Sending analysis email to: ${email}`);
    // Email sending logic would go here
    // You can use Resend, SendGrid, or any other email service
    // For now, just log it
    console.log('Email would contain:', {
      to: email,
      name,
      criticalIssues: analysis.critical_issues,
      savings: analysis.estimated_savings
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}