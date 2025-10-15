import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cptCode, description, chargedAmount, category } = await req.json();
    
    console.log('Generating CPT explanation for:', cptCode);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a medical billing expert and educator. Generate a clear, patient-friendly explanation of a medical procedure code.

Output MUST be valid JSON with this EXACT structure:
{
  "whatIsIt": "Clear 2-3 sentence explanation of what this code represents",
  "whenApplicable": "Specific clinical scenarios when this code should be used",
  "howToVerify": "Practical steps patient can take to verify this service was performed",
  "nationalAverage": "Context about typical pricing (be general if specific data not available)",
  "redFlags": ["array", "of", "4-5", "warning", "signs"],
  "greenFlags": ["array", "of", "4-5", "positive", "indicators"]
}

Rules:
- Use simple language, avoid medical jargon
- Be specific to the code provided
- Include practical verification steps
- Red flags should be actionable warning signs
- Green flags should indicate legitimate charges
- Keep explanations concise but informative`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Explain this medical billing code:
            
CPT Code: ${cptCode}
Description: ${description}
Charged Amount: $${chargedAmount}
Category: ${category || 'General'}

Generate a patient-friendly explanation following the JSON structure.`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI explanation failed: ${response.status}`);
    }

    const data = await response.json();
    const explanation = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    
    console.log('CPT explanation generated successfully');

    return new Response(
      JSON.stringify({ explanation }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain-cpt:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
