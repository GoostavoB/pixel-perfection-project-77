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

    const { sessionId, email, name, phone } = await req.json();

    if (!sessionId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update bill analysis with user info
    const { data: analysis, error: updateError } = await supabase
      .from('bill_analyses')
      .update({
        user_email: email,
        user_name: name,
        user_phone: phone
      })
      .eq('session_id', sessionId)
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

async function sendAnalysisEmail(email: string, name: string, analysis: any) {
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