import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "https://esm.sh/docx@8.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis, sessionId, duplicates, nsaReview, savingsTotals, itemizationStatus } = await req.json();

    if (!analysis) {
      throw new Error('Analysis data is required');
    }

    console.log('Generating comprehensive educational report...');

    const doc = generateComprehensiveReport(analysis, duplicates, nsaReview, savingsTotals, itemizationStatus);
    const buffer = await Packer.toBuffer(doc);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    console.log('Comprehensive report generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        docx_base64: base64,
        message: 'Comprehensive report generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateComprehensiveReport(
  analysis: any, 
  duplicates: any[], 
  nsaReview: any, 
  savingsTotals: any,
  itemizationStatus: string
): Document {
  const sections = [];
  
  // Title Page
  sections.push(
    new Paragraph({
      text: "Comprehensive Medical Bill Analysis Report",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 }
    })
  );

  // Executive Summary
  sections.push(
    new Paragraph({
      text: "Executive Summary",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Provider: ", bold: true }),
        new TextRun(analysis.hospital_name || analysis.provider_name || "Unknown")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Service Dates: ", bold: true }),
        new TextRun(analysis.date_of_service || "Unknown")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Total Billed Amount: ", bold: true }),
        new TextRun(`$${(analysis.total_bill_amount || analysis.total_charged || 0).toLocaleString()}`)
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Itemization Status: ", bold: true }),
        new TextRun(itemizationStatus === 'complete' ? 'Fully Itemized' : 
                   itemizationStatus === 'partial' ? 'Partially Itemized' : 
                   'Not Itemized')
      ],
      spacing: { after: 300 }
    })
  );

  // Educational Section: Understanding Medical Bills
  sections.push(
    new Paragraph({
      text: "Understanding Your Medical Bill",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 }
    }),
    new Paragraph({
      text: "Medical bills can be complex and confusing. This section explains key concepts to help you understand your charges.",
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: "What is an Itemized Bill?",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 }
    }),
    new Paragraph({
      text: "An itemized bill lists every service, procedure, medication, and supply you received, along with:",
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: "• CPT/HCPCS codes: Standardized codes for medical procedures and services",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Units: The quantity of each service or item provided",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Individual charges: The cost for each line item",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Provider information: The specific provider or department that billed each service",
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: "Your Legal Rights",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 }
    }),
    new Paragraph({
      text: "Under federal law (45 C.F.R. § 164.524 - HIPAA Privacy Rule, 1996), every patient in the United States has the right to:",
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: "• Request and obtain itemized bills",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Access complete medical and billing records",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Dispute charges you believe are incorrect",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Receive explanations of benefits (EOB) from your insurance company",
      spacing: { after: 300 }
    })
  );

  // No Surprises Act Section
  if (nsaReview && (nsaReview.applies === 'yes' || nsaReview.scenarios?.length > 0)) {
    sections.push(
      new Paragraph({
        text: "No Surprises Act Protection",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 200 }
      }),
      new Paragraph({
        text: "The No Surprises Act (effective January 1, 2022) protects you from unexpected medical bills in certain situations:",
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: "Protected Scenarios:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 }
      })
    );

    if (nsaReview.scenarios && nsaReview.scenarios.length > 0) {
      nsaReview.scenarios.forEach((scenario: string) => {
        sections.push(
          new Paragraph({
            text: `• ${scenario}`,
            spacing: { after: 100 }
          })
        );
      });
    }

    sections.push(
      new Paragraph({
        text: "What This Means For You:",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      }),
      new Paragraph({
        text: "If you received emergency care or were treated by an out-of-network provider at an in-network facility without your consent, you should only be responsible for in-network cost-sharing amounts (copays, coinsurance, and deductibles).",
        spacing: { after: 300 }
      })
    );
  }

  // Analysis Findings
  sections.push(
    new Paragraph({
      text: "Detailed Analysis Findings",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 }
    })
  );

  // Potential Issues
  if (analysis.high_priority_issues && analysis.high_priority_issues.length > 0) {
    sections.push(
      new Paragraph({
        text: "High Priority Issues",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      })
    );

    analysis.high_priority_issues.forEach((issue: any, index: number) => {
      sections.push(
        new Paragraph({
          text: `Issue ${index + 1}: ${issue.flag || issue.issue || issue.title}`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: issue.explanation || issue.description || 'No details available',
          spacing: { after: 100 }
        })
      );

      if (issue.amount || issue.potential_savings) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Potential Impact: ", bold: true }),
              new TextRun(`$${(issue.amount || issue.potential_savings || 0).toLocaleString()}`)
            ],
            spacing: { after: 200 }
          })
        );
      }
    });
  }

  // Duplicates
  if (duplicates && duplicates.length > 0) {
    sections.push(
      new Paragraph({
        text: "Potential Duplicate Charges",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 150 }
      }),
      new Paragraph({
        text: "The following charges may be duplicated and should be verified:",
        spacing: { after: 200 }
      })
    );

    duplicates.forEach((dup: any, index: number) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. `, bold: true }),
            new TextRun(dup.description)
          ],
          spacing: { after: 50 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Amount: ", bold: true }),
            new TextRun(`$${(dup.amount || 0).toLocaleString()}`)
          ],
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: `Confidence Level: ${dup.confidence || 'Unknown'}`,
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: dup.details || '',
          spacing: { after: 200 }
        })
      );
    });
  }

  // Educational: Common Billing Issues
  sections.push(
    new Paragraph({
      text: "Common Medical Billing Issues",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 }
    }),
    new Paragraph({
      text: "Understanding common billing errors can help you identify problems in your bill:",
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: "1. Duplicate Charges",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: "The same service or procedure may be billed multiple times. This can happen when services are recorded in different systems or departments.",
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: "2. Unbundling",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: "Some procedures that should be billed as a single comprehensive service are instead split into individual components, resulting in higher charges.",
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: "3. Upcoding",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: "Billing for a more expensive service than what was actually provided. For example, billing for a complex procedure when a simple one was performed.",
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: "4. Balance Billing",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: "When an out-of-network provider bills you for the difference between their charge and what your insurance paid. The No Surprises Act protects you from this in many situations.",
      spacing: { after: 300 }
    })
  );

  // Action Steps
  sections.push(
    new Paragraph({
      text: "Recommended Next Steps",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 }
    }),
    new Paragraph({
      text: "Follow these steps to address issues found in your bill:",
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: "Step 1: Request Complete Documentation",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: "Contact your provider's billing department and request:",
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: "• Complete itemized bill with all CPT/HCPCS codes",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Explanation of Benefits (EOB) from your insurance company",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Medical records related to the services billed",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Any notice and consent forms you signed regarding network status",
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: "Step 2: Review and Compare",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: "• Compare your itemized bill with your medical records",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Verify that each service was actually provided",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Check for duplicate charges",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Compare charges to Medicare rates and fair market prices",
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: "Step 3: Dispute Incorrect Charges",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: "• Send a written dispute letter to the billing department",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Include specific items you're disputing and why",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Request corrections and a revised bill",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Keep copies of all correspondence",
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: "Step 4: Contact Your Insurance",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: "• Review your EOB carefully",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Appeal any denied claims you believe should be covered",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Ask about potential coverage for disputed items",
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: "• Inquire about No Surprises Act protection if applicable",
      spacing: { after: 300 }
    })
  );

  // Glossary
  sections.push(
    new Paragraph({
      text: "Medical Billing Glossary",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "CPT Code: ", bold: true }),
        new TextRun("Current Procedural Terminology code. A standardized code used to describe medical procedures and services.")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "EOB: ", bold: true }),
        new TextRun("Explanation of Benefits. A statement from your insurance company showing what was covered and what you owe.")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Allowed Amount: ", bold: true }),
        new TextRun("The maximum amount your insurance will pay for a covered service.")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Copay: ", bold: true }),
        new TextRun("A fixed amount you pay for a covered service, usually at the time of service.")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Coinsurance: ", bold: true }),
        new TextRun("The percentage of costs you pay after meeting your deductible.")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Deductible: ", bold: true }),
        new TextRun("The amount you pay out-of-pocket before your insurance starts covering costs.")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Network Provider: ", bold: true }),
        new TextRun("A doctor or facility that has a contract with your insurance company to provide services at negotiated rates.")
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Out-of-Network: ", bold: true }),
        new TextRun("Providers who don't have a contract with your insurance, typically resulting in higher costs.")
      ],
      spacing: { after: 100 }
    })
  );

  // Footer
  sections.push(
    new Paragraph({
      text: "This comprehensive report was generated by Hospital Bill Checker. The information provided is for educational purposes and should not be considered legal or financial advice. Always consult with appropriate professionals regarding your specific situation.",
      spacing: { before: 800 },
      alignment: AlignmentType.CENTER
    })
  );

  return new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });
}
