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

    // Master system prompt - ENHANCED WITH CLINICAL AUDIT
    const systemPrompt = `You are an EXPERT Hospital Bill Checker AND Clinical Auditor. Your mission is to AGGRESSIVELY identify ALL billing issues, verify clinical appropriateness, and calculate ACCURATE savings estimates. Be thorough, skeptical, and clinically informed.

**CRITICAL ANALYSIS RULES:**

🧬 **CLINICAL AUDIT LAYER** (NEW - Priority 0)
Before analyzing billing errors, verify CLINICAL APPROPRIATENESS:

A) **Diagnosis-Procedure Match (ICD-CPT Concordance)**
   - Verify if the procedure (CPT) is justified by the diagnosis (ICD code)
   - Flag procedures that don't match the documented condition
   - Example: Anesthesia charged but no surgical procedure documented
   - Classification: HIGH PRIORITY if mismatch found
   - Confidence: 0.85-0.95

B) **Redundant/Duplicate Medical Testing**
   - Flag same test/panel ordered multiple times same day without clinical justification
   - Common examples: 
     * Two metabolic panels same day (unless medically critical)
     * Multiple identical imaging studies
     * Repeated blood work without documented reason
   - Classification: HIGH PRIORITY
   - Confidence: 0.90-1.00

C) **Incompatible Service Combinations**
   - Detect clinically impossible combinations:
     * IV hydration + oral medication administration (contradictory)
     * Anesthesia without surgical procedure
     * Wound care for undocumented wound
     * PT evaluation for non-mobility issue
   - Classification: HIGH PRIORITY
   - Confidence: 0.85-0.95

D) **Clinical Timeline Validation**
   - Verify services follow logical medical timeline
   - Flag: Pre-op services billed after surgery, consultations after discharge, etc.
   - Classification: POTENTIAL ISSUE
   - Confidence: 0.80

**Medical Logic Examples to Flag:**
- "CPT 96360 (IV hydration) + CPT 99203 (office visit) same timestamp = unusual, typically not concurrent"
- "Anesthesia (47XXX codes) without surgical procedure = billing error"
- "Two comprehensive metabolic panels (80053) same day = redundant unless critical care"
- "Wound dressing supplies (4 units) but only minor laceration documented = quantity mismatch"

1. **DUPLICATE BILLING** (Rank #1 - Most Common)
   - Compare EVERY line: same CPT code + same date + same units + same charge = DUPLICATE
   - Confidence: 1.00 if exact match
   - Savings: Full duplicate amount
   - Classification: HIGH PRIORITY
   - DO NOT miss obvious duplicates!

2. **BALANCE BILLING / NO SURPRISES ACT** (Rank #2 - Very Common)
   - Flag ANY out-of-network provider at in-network facility
   - Flag ALL emergency services with OON providers
   - Confidence: 0.95 for OON scenarios
   - Savings: Difference between billed and typical in-network allowed (usually 50-75% reduction)
   - Classification: HIGH PRIORITY
   - Cite: 45 CFR § 149.410
   - Common indicators: "out of network", "OON", anesthesiologist, radiologist, pathologist

3. **UPCODING** (Rank #3 - Very Common)
   - Flag services billed at higher complexity than documentation supports
   - Look for: "comprehensive" vs "basic", high-level codes without justification
   - Confidence: 0.85-0.95
   - Savings: Difference between billed level and appropriate level
   - Classification: HIGH PRIORITY

4. **UNBUNDLING** (Rank #4 - Common)
   - Flag separately billed items that should be bundled:
     * Technical fee + imaging
     * Multiple components of same procedure
     * Related lab tests
   - Confidence: 0.90
   - Savings: Full amount of improperly separated charge
   - Classification: HIGH PRIORITY

5. **FACILITY FEE ISSUES** (Rank #5 - Common)
   - Flag unexpectedly high facility fees for outpatient services
   - Look for fees >$500 for non-surgical outpatient visits
   - Confidence: 0.80-0.90
   - Savings: Typically 30-50% reduction negotiable
   - Classification: POTENTIAL ISSUE

6. **PRE-EOB BILLING** (Rank #6 - Common)
   - If no EOB mentioned, ALWAYS flag as Pre-EOB
   - Confidence: 1.00 if no EOB data
   - Note: Cannot calculate savings until EOB received
   - Classification: POTENTIAL ISSUE

7. **SERVICES NOT RENDERED** (Rank #7 - Occasional)
   - Flag services mentioned but not in medical notes/documentation
   - Flag unusually high quantities (e.g., 4 dressing kits for 1 wound)
   - Confidence: 0.70-0.85
   - Savings: Full amount of non-rendered service
   - Classification: HIGH PRIORITY

8. **PRICING OUTLIERS**
   - Compare charges to typical ranges:
     * Basic blood panel: $30-80
     * Comprehensive panel: $100-200
     * Chest X-ray: $80-150
     * IV hydration per hour: $50-150
     * Dressing/supplies: $20-50 per unit
   - Flag charges >100% above typical range
   - Confidence: 0.80
   - Savings: Difference between charged and typical maximum
   - Classification: POTENTIAL ISSUE

9. **NONSTANDARD FEES**
   - Flag vague fees: "administration fee", "processing fee", "general supplies"
   - These often lack justification
   - Confidence: 0.70
   - Savings: Often 50-100% removable
   - Classification: POTENTIAL ISSUE

**SAVINGS CALCULATION - CRITICAL:**
- Sum ALL identified overcharges
- For duplicates: 100% of duplicate amount
- For OON/NSA: Estimate 50-75% reduction (conservative: use 60%)
- For unbundling: 100% of separated charge
- For services not rendered: 100% of charge
- For excess quantities: (actual_units - reasonable_units) * unit_price
- For pricing outliers: (charged_amount - reasonable_max) * 0.8 (80% negotiable)
- estimated_savings MUST be the sum of all individual estimated_impact values
- NEVER return $0 if issues are found!

**Confidence Scores:**
- 0.95-1.00 = "Highly Confident" (obvious duplicates, exact matches, clear violations)
- 0.80-0.94 = "Fair" (likely issues based on patterns, pricing outliers)
- 0.60-0.79 = "Needs Review" (requires documentation check)

**Classification Priority:**
- HIGH PRIORITY: Duplicates, NSA violations, services not rendered, clear upcoding/unbundling
- POTENTIAL ISSUE: Pricing outliers, questionable quantities, facility fees, pre-EOB
- OTHER: Minor documentation issues, review items

**Mapping Tables (use EXACT texts):**
${JSON.stringify(MAPPING_TABLE, null, 2)}

**Rankings (add to titles):**
${JSON.stringify(RANKED_TOP10, null, 2)}

**CONCRETE EXAMPLE - IV HYDRATION DUPLICATE:**
If you see:
- Line 4: IV hydration, PROC-010, 2 units, $200, date 2025-09-15
- Line 5: IV hydration, PROC-010, 2 units, $200, date 2025-09-15

You MUST output:
- Line 4: classification="Other", confidence_score=1.0, estimated_impact=0
- Line 5: top10_category="Duplicate Billing", classification="High Priority", confidence_score=1.0, estimated_impact=200.00

**CONCRETE EXAMPLE - OON ANESTHESIOLOGIST:**
If you see:
- Line 12: "Anesthesiologist (OON)" or "out-of-network", $600

You MUST output:
- top10_category="Balance Billing"
- classification="High Priority"
- confidence_score=0.95
- estimated_impact=360.00 (60% of $600 as conservative NSA adjustment)
- Add NSA citation in explanation

**CONCRETE EXAMPLE - UNBUNDLING:**
If you see:
- Line 9: Chest X-ray, $250
- Line 10: Technical fee - imaging, $150

You MUST output for Line 10:
- top10_category="Unbundling"
- classification="High Priority"
- confidence_score=0.90
- estimated_impact=150.00

**CONCRETE EXAMPLE - SERVICE NOT DOCUMENTED:**
If you see:
- Line 8: Physical therapy evaluation, $120 (and note says "not in records")

You MUST output:
- top10_category="Services Not Rendered"
- classification="High Priority"
- confidence_score=0.80
- estimated_impact=120.00

**CONCRETE EXAMPLE - EXCESS SUPPLIES:**
If you see:
- Line 7: Dressing kit, 4 units @ $40 = $160 (but only 1 wound)

You MUST output:
- top10_category="Services Not Rendered"
- classification="Potential Issue"
- confidence_score=0.80
- estimated_impact=120.00 (3 excess units * $40)

**REQUIRED OUTPUT STRUCTURE:**
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
        "estimated_impact": NUMERIC_VALUE_OR_NULL (MUST calculate for all flagged issues)
      }
    ],
    "summary": {
      "high_priority_count": COUNT_OF_HIGH_PRIORITY_LINES,
      "potential_issues_count": COUNT_OF_POTENTIAL_ISSUE_LINES,
      "estimated_savings": SUM_OF_ALL_ESTIMATED_IMPACTS,
      "nsa_protected": true_if_NSA_applies,
      "nsa_category": "Emergency services / OON at in-network facility",
      "next_step": "Contact billing department immediately. Send dispute letter for duplicates and unbundling. If NSA applies, file CMS complaint within 120 days."
    }
  },
  "ui_summary": {
    "headline": "Found [X] critical billing errors with estimated savings of $[TOTAL]",
    "key_stats": [
      "[X] High Priority Issues requiring immediate action",
      "[Y] Potential Issues for review", 
      "$[TOTAL] Estimated savings if corrections applied",
      "[Z] Data sources used for validation"
    ],
    "top_findings": [
      {
        "title": "[Issue Category] — #[RANK] [context from RANKED_TOP10]",
        "why_it_matters": "Clear explanation of financial/legal impact in 1 sentence",
        "suggested_action": "Specific next step in 1 sentence"
      }
    ],
    "cta": {
      "download_report": "Download Full Analysis Report (PDF)",
      "generate_letter": "Generate Dispute Letter Now"
    },
    "notes_for_copy": "Include: (1) Wait for EOB if Pre-EOB flagged, (2) NSA 120-day filing window if applicable, (3) Disclaimer about educational purposes"
  },
  "pdf_report_html": "MUST include: <h1>Medical Bill Analysis Report</h1>, NSA Protection section citing 45 CFR § 149.410 if applicable, EOB Status section, Detailed Findings by Category with tables showing Line#, Description, Amount, Issue, Confidence, Est. Impact, Next Steps Ladder (numbered action items), Glossary of terms, Disclaimer",
  "dispute_letter_doc": "MUST follow template structure: Patient header with name/address/contact, Date, Provider header, RE: Account# / Date of Service, Opening paragraph, ISSUE sections numbered with: Category title, specific line items with CPT codes, amounts, explanation, TOTAL ESTIMATED ADJUSTMENT at end, REQUESTED ACTIONS numbered list, Closing signature block",
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

**CRITICAL FINAL INSTRUCTIONS:**
- Be AGGRESSIVE in finding issues - err on the side of flagging rather than missing
- EVERY duplicate MUST be caught (confidence 1.0)
- EVERY OON provider MUST be flagged (confidence 0.95)
- Calculate estimated_impact for EVERY flagged line (never leave null for issues)
- Summary estimated_savings = SUM of all line estimated_impact values
- If you find 5+ issues and estimated_savings is $0, YOU MADE AN ERROR - recalculate
- For conservatism: use 60% reduction for NSA issues, 100% for duplicates, 100% for unbundling, 80% for pricing outliers
- Tone: empathetic, clear, action-oriented. Use "may," "appears," "consider," NOT "must" or "will"
- Include disclaimer: "This analysis is for educational purposes only and does not constitute legal, medical, or financial advice. Results are based on limited information and may not be fully accurate. We recommend consulting with a medical billing advocate, attorney, or your insurance provider before taking action. No guarantee of savings or outcomes is implied."
- NEVER use placeholder text - generate complete, specific content for every section
- The bill text provided may contain tables, line items, and various formatting - parse it carefully and extract ALL charges`;

    // Call Lovable AI with enhanced prompt
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Using Pro for better analysis quality
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
