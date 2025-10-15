import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { disputePack, sessionId } = await req.json();

    if (!disputePack) {
      throw new Error('Dispute pack data is required');
    }

    console.log('Generating dispute pack PDF for:', disputePack.report_id);

    // Generate HTML for PDF
    const html = generateDisputePackHTML(disputePack);

    // In a real implementation, you would:
    // 1. Use a PDF generation service (e.g., Puppeteer, PDFKit)
    // 2. Store the PDF in Supabase Storage
    // 3. Return the public URL

    // For now, return the HTML content
    return new Response(
      JSON.stringify({
        success: true,
        html_content: html,
        message: 'Dispute pack generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-dispute-pack-pdf:', error);
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

function generateDisputePackHTML(pack: any): string {
  const issueBlocksHTML = pack.issue_blocks
    .map((block: any, idx: number) => `
      <div style="margin-bottom: 24px; padding: 16px; border-left: 4px solid #2563eb; background: #f8fafc;">
        <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 16px;">
          Issue ${idx + 1}: ${block.title}
        </h3>
        ${block.amount ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Amount:</strong> $${block.amount.toFixed(2)}</p>` : ''}
        <p style="margin: 4px 0; font-size: 14px;"><strong>Why Flagged:</strong> ${block.why_flagged}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Lines in Question:</strong></p>
        <ul style="margin: 4px 0; padding-left: 20px; font-size: 13px;">
          ${block.lines_in_question.map((line: string) => `<li>${line}</li>`).join('')}
        </ul>
        <p style="margin: 12px 0 4px 0; font-size: 14px;"><strong>Data Requested:</strong></p>
        <ul style="margin: 4px 0; padding-left: 20px; font-size: 13px;">
          ${block.data_requested.map((req: string) => `<li>${req}</li>`).join('')}
        </ul>
        <p style="margin: 12px 0 0 0; padding: 12px; background: #fff; border-radius: 4px; font-size: 13px; line-height: 1.6;">
          ${block.dispute_paragraph}
        </p>
      </div>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Dispute Pack - ${pack.report_id}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1e40af; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 24px; }
        .header { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 24px; border-radius: 8px; margin-bottom: 24px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .summary-item { padding: 12px; background: #f8fafc; border-radius: 4px; }
        .checklist { background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Medical Bill Dispute Pack</h1>
        <p><strong>Report ID:</strong> ${pack.report_id}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <h2>Bill Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <strong>Provider:</strong><br>${pack.provider_name}
        </div>
        <div class="summary-item">
          <strong>Service Dates:</strong><br>${pack.service_dates}
        </div>
        <div class="summary-item">
          <strong>Account ID:</strong><br>${pack.account_id || 'Not provided'}
        </div>
        <div class="summary-item">
          <strong>Bill Total:</strong><br>$${pack.bill_total.toFixed(2)}
        </div>
      </div>

      <h2>Issues Identified</h2>
      ${issueBlocksHTML}

      <h2>Required Documentation</h2>
      <div class="checklist">
        <p><strong>Please provide the following:</strong></p>
        <ul>
          ${pack.checklist.map((item: string) => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <h2>Requested Attachments</h2>
      <ul>
        ${pack.attachments_requested.map((att: string) => `<li>${att}</li>`).join('')}
      </ul>

      <div style="margin-top: 40px; padding: 16px; background: #f1f5f9; border-radius: 8px;">
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          This dispute pack was generated by Hospital Bill Checker. Please review all information for accuracy before submitting to billing departments or insurance providers.
        </p>
      </div>
    </body>
    </html>
  `;
}
