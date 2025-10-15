import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Import schemas (will be embedded)
const MAPPING_TABLE = {
  "Balance Billing": {
    "explanation_for_user": "Balance billing happens when an out-of-network provider bills you for the difference between what they charged and what your insurance paid. Under the No Surprises Act, you may be protected from balance billing for emergency services and certain other situations.",
    "suggested_action": "Check if this service qualifies for No Surprises Act protection (emergency care, out-of-network provider at in-network facility). If protected, you should only owe your in-network cost-sharing amount. Contact your insurance and request IDR if needed. File a complaint with CMS within 120 days if applicable."
  },
  "Duplicate Billing": {
    "explanation_for_user": "You may have been charged twice for the same service, procedure, or supply. This is one of the most common billing errors and can significantly inflate your bill.",
    "suggested_action": "Compare line items carefully. Look for identical CPT codes, dates, and descriptions. Request an itemized bill if you don't have one. Contact the billing department immediately to dispute duplicate charges and request a corrected bill."
  },
  "Unbundling": {
    "explanation_for_user": "Unbundling is when a hospital bills separately for procedures that should be billed together as a single 'bundled' service. This practice can result in higher charges than appropriate.",
    "suggested_action": "Research which CPT codes are typically bundled together. The National Correct Coding Initiative (NCCI) can help identify improper unbundling. Request a review from your insurance company or contact the billing department to challenge these charges."
  },
  "Upcoding": {
    "explanation_for_user": "Upcoding occurs when you're billed for a more expensive or complex service than what was actually provided. For example, billing for a comprehensive exam when only a basic exam was performed.",
    "suggested_action": "Compare the billed CPT codes with your medical records and the actual services you received. Request copies of your medical records if needed. Dispute any codes that don't match the level of service documented. File a complaint with your insurance company."
  },
  "Facility Fee Issues": {
    "explanation_for_user": "Facility fees are charges hospitals add for using their space and equipment, even for outpatient services. These fees can be surprisingly high and are often unexpected, especially when the same procedure costs much less at a non-hospital facility.",
    "suggested_action": "Ask why a facility fee was charged and if it's required by your insurance. Compare to what the procedure would cost at an independent clinic. Request a detailed breakdown. Consider asking for a reduction or payment plan if the fee is valid but unaffordable."
  },
  "Services Not Rendered": {
    "explanation_for_user": "You've been billed for services, procedures, tests, or supplies that you never received. This could be due to clerical errors or potentially fraudulent billing.",
    "suggested_action": "Review your bill against your memory of the visit and any discharge paperwork. If something doesn't match, request your complete medical records. Dispute any charge for services you didn't receive in writing. If fraud is suspected, report to your insurance and potentially the state attorney general."
  },
  "Pre-EOB Billing": {
    "explanation_for_user": "You received a bill from the provider before your insurance company issued an Explanation of Benefits (EOB). You should wait for the EOB to know what you truly owe, as the initial bill may not reflect your insurance coverage or negotiated rates.",
    "suggested_action": "Do not pay this bill yet. Wait for your EOB from your insurance company, which will show the allowed amount, what insurance paid, and your actual patient responsibility. Contact the billing office to confirm they have your insurance information and are processing the claim."
  },
  "Trauma Activation Fee Issues": {
    "explanation_for_user": "Trauma activation fees are charged when a hospital's trauma team is mobilized, even if their services aren't ultimately needed. These fees can be $10,000+ and are controversial because patients often don't need the full trauma response.",
    "suggested_action": "Review your medical records to confirm a trauma activation was medically necessary. Many states are cracking down on these fees. Check if your situation qualifies for a waiver or reduction. Contact a medical billing advocate or attorney if the fee seems unjustified based on your condition."
  },
  "Collections on Invalid Bills": {
    "explanation_for_user": "Your account was sent to collections, but the underlying charges are disputed, incorrect, or you were never properly billed. Sending invalid bills to collections is a violation of the Fair Debt Collection Practices Act (FDCPA).",
    "suggested_action": "Send a debt validation letter to the collection agency within 30 days demanding proof of the debt. Dispute the charges in writing with the hospital and the collection agency. File complaints with the CFPB and your state attorney general. Consider consulting a consumer rights attorney if the issue persists."
  },
  "Ground Ambulance Balance Billing": {
    "explanation_for_user": "Ground ambulance providers, especially private companies, often balance bill patients even after insurance pays. Unlike air ambulance, ground ambulance is not yet fully protected under the No Surprises Act, though some states have their own protections.",
    "suggested_action": "Check if your state has ground ambulance billing protections. Request a detailed invoice and compare to your insurance EOB. Negotiate with the ambulance company—they often accept much less than the initial bill. If the transport was an emergency, argue for in-network rates under your insurance policy's emergency provisions."
  },
  "None": {
    "explanation_for_user": "No specific billing issue was detected for this line item based on the available information.",
    "suggested_action": "Review this charge against your memory of the visit and your medical records to ensure accuracy. If something seems off, request clarification from the billing department."
  }
};

const RANKED_TOP10 = {
  "Duplicate Billing": { rank: 1, context: "#1 most common" },
  "Balance Billing": { rank: 2, context: "#2 most frequent" },
  "Upcoding": { rank: 3, context: "#3 most common" },
  "Unbundling": { rank: 4, context: "#4 most frequent" },
  "Facility Fee Issues": { rank: 5, context: "#5 most disputed" },
  "Pre-EOB Billing": { rank: 6, context: "#6 most common" },
  "Services Not Rendered": { rank: 7, context: "#7 issue" },
  "Trauma Activation Fee Issues": { rank: 8, context: "#8 most disputed" },
  "Ground Ambulance Balance Billing": { rank: 9, context: "#9 issue" },
  "Collections on Invalid Bills": { rank: 10, context: "#10 issue" }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisId, billText, userContext } = await req.json();
    
    console.log('Starting AI analysis for:', analysisId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Master system prompt
    const systemPrompt = `You are the Hospital Bill Checker Analyzer. Follow these instructions EXACTLY:

**Your Role:** Parse medical bills, detect Top-10 billing issues, and output structured JSON matching our schema.

**Detection Logic (in order):**
1. NSA Context: Map to NSA categories. Output "NSA PROTECTED" when applicable, cite 45 CFR § 149.410.
2. EOB Reconciliation: If pre-EOB, flag "Pre-EOB Billing". If EOB exists, compare billed vs allowed vs patient responsibility.
3. Line-item Audit: Detect Top-10 categories: Duplicate Billing, Upcoding, Unbundling, Facility Fee, Balance Billing, Services Not Rendered, Pre-EOB Billing, Trauma Activation, Collections on Invalid Bills, Ground Ambulance.
4. Price Reasonableness: Flag charges >100% above median if benchmarks available.
5. Classify: "High Priority" vs "Potential Issue" vs "Other"
6. Confidence Score: 0.6-1.0 (0.95-1.0="Highly Confident", 0.80-0.94="Fair", 0.60-0.79="Needs Review")

**Mapping Tables:**
Use these EXACT texts for explanation_for_user and suggested_action:
${JSON.stringify(MAPPING_TABLE, null, 2)}

**Rankings (add context):**
${JSON.stringify(RANKED_TOP10, null, 2)}

**Required Output Structure:**
{
  "analysis_json": {
    "session_id": "bill_XXXXXXXX",
    "hospital_name": "string",
    "analysis_date": "ISO datetime",
    "charges": [
      {
        "line_number": 1,
        "cpt_code": "string",
        "description": "string",
        "billed_amount": 0,
        "allowed_amount": null,
        "patient_responsibility": null,
        "issue_flag": {
          "top10_category": "Balance Billing|Duplicate Billing|...|None",
          "explanation_for_user": "EXACT text from mapping table",
          "suggested_action": "EXACT text from mapping table"
        },
        "classification": "High Priority|Potential Issue|Other",
        "confidence_score": 0.6-1.0,
        "accuracy_label": "Highly Confident|Fair|Needs Review",
        "estimated_impact": null
      }
    ],
    "summary": {
      "high_priority_count": 0,
      "potential_issues_count": 0,
      "estimated_savings": 0,
      "nsa_protected": false,
      "nsa_category": null,
      "next_step": "string"
    }
  },
  "ui_summary": {
    "headline": "1 sentence result",
    "key_stats": ["stat 1", "stat 2", "stat 3", "stat 4"],
    "top_findings": [
      {
        "title": "Issue name + rank context",
        "why_it_matters": "1 sentence",
        "suggested_action": "1 sentence"
      }
    ],
    "cta": {
      "download_report": "Download Full Report",
      "generate_letter": "Generate Dispute Letter"
    },
    "notes_for_copy": "Notes about EOB, NSA 120-day window, disclaimer"
  },
  "pdf_report_html": "Complete HTML body for PDF",
  "dispute_letter_doc": "Markdown letter ready to use",
  "storage_payload": {
    "session_id": "string",
    "hospital_name": "string",
    "hospital_city": null,
    "hospital_state": null,
    "service_date": null,
    "total_charged": 0,
    "high_priority_count": 0,
    "potential_issues_count": 0,
    "estimated_savings": 0,
    "issues_json": "stringified analysis_json",
    "demographics": null
  }
}

**Rules:**
- Use EXACT texts from mapping table for explanation_for_user and suggested_action
- Add rank context to titles (e.g., "Duplicate Billing — #1 most common")
- Tone: empathetic, clear, action-oriented. Use "may," "appears," "consider," NOT "must" or "will"
- Include disclaimer: "This analysis is for educational purposes only and does not constitute legal, medical, or financial advice."`;

    // Call Lovable AI
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
            content: `Analyze this medical bill:\n\nBill Text:\n${billText}\n\nUser Context: ${JSON.stringify(userContext || {})}\n\nReturn complete JSON with all required sections: analysis_json, ui_summary, pdf_report_html, dispute_letter_doc, storage_payload`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    
    console.log('AI analysis complete:', { 
      hasAnalysisJson: !!analysisResult.analysis_json,
      hasUiSummary: !!analysisResult.ui_summary,
      hasPdfReport: !!analysisResult.pdf_report_html,
      hasDisputeLetter: !!analysisResult.dispute_letter_doc
    });

    // Extract the structured data
    const analysisJson = analysisResult.analysis_json || {};
    const uiSummary = analysisResult.ui_summary || {};
    const charges = analysisJson.charges || [];

    // Build issues array with proper structure for dispute letter
    const issues = charges
      .filter((charge: any) => charge.issue_flag?.top10_category !== "None")
      .map((charge: any) => ({
        category: charge.issue_flag?.top10_category || "Billing Issue",
        finding: charge.description || "Charge review needed",
        severity: charge.classification === "High Priority" ? "critical" : "moderate",
        impact: `$${charge.billed_amount?.toFixed(2) || "0.00"}`,
        cpt_code: charge.cpt_code || "N/A",
        description: charge.description || "",
        details: charge.issue_flag?.explanation_for_user || "",
        suggested_action: charge.issue_flag?.suggested_action || "",
        confidence_score: charge.confidence_score || 0,
        accuracy_label: charge.accuracy_label || "Needs Review"
      }));

    // Update database with complete structured results
    const { error: updateError } = await supabase
      .from('bill_analyses')
      .update({
        status: 'completed',
        analysis_result: {
          ...analysisJson,
          ui_summary: uiSummary,
          pdf_report_html: analysisResult.pdf_report_html,
          dispute_letter_doc: analysisResult.dispute_letter_doc,
          storage_payload: analysisResult.storage_payload
        },
        critical_issues: analysisJson.summary?.high_priority_count || 0,
        moderate_issues: analysisJson.summary?.potential_issues_count || 0,
        estimated_savings: analysisJson.summary?.estimated_savings || 0,
        extracted_text: billText,
        issues: issues
      })
      .eq('id', analysisId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysisId,
        result: analysisResult
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-bill-ai:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
