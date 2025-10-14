/**
 * Hospital Bill Checker - Client-Side PDF Generator
 * React/TypeScript utility for generating PDFs from HTML
 */

import html2pdf from 'html2pdf.js';

interface PDFOptions {
  filename?: string;
  margin?: number | number[];
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Generate PDF from HTML string
 */
export const generatePDFFromHTML = async (
  html: string,
  options: PDFOptions = {}
): Promise<void> => {
  const {
    filename = 'document.pdf',
    margin = 10,
    format = 'a4',
    orientation = 'portrait'
  } = options;

  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = format === 'a4' ? '210mm' : '8.5in';
  container.innerHTML = html;
  document.body.appendChild(container);

  // Aguardar renderização do DOM
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const opt = {
      margin,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: true
      },
      jsPDF: { 
        unit: 'mm', 
        format, 
        orientation 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(container).save();
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * Generate Report PDF from analysis data
 */
export const generateReportPDF = async (
  reportHTML: string,
  jobId: string
): Promise<void> => {
  await generatePDFFromHTML(reportHTML, {
    filename: `medical-bill-report-${jobId.substring(0, 8)}.pdf`,
    margin: [10, 10, 10, 10],
    format: 'a4',
    orientation: 'portrait'
  });
};

/**
 * Generate Dispute Letter PDF
 */
export const generateDisputeLetterPDF = async (
  letterHTML: string,
  jobId: string
): Promise<void> => {
  await generatePDFFromHTML(letterHTML, {
    filename: `dispute-letter-${jobId.substring(0, 8)}.pdf`,
    margin: [15, 15, 15, 15],
    format: 'letter',
    orientation: 'portrait'
  });
};

/**
 * Generate complete HTML report from analysis data
 */
export const generateReportHTML = (data: any): string => {
  const analysis = data.full_analysis || {};
  const ui = data.ui_summary || {};
  const issues = analysis.high_priority_issues || [];
  const potential = analysis.potential_issues || [];

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #2C3E50; line-height: 1.6; }
        h1 { color: #2B8FB8; font-size: 28px; margin-bottom: 10px; }
        h2 { color: #1F6B8A; font-size: 20px; margin-top: 25px; margin-bottom: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2B8FB8; padding-bottom: 20px; }
        .stats { background: #F5F7FA; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E0E7ED; }
        .stat-row:last-child { border-bottom: none; }
        .stat-label { font-weight: 600; color: #546E7A; }
        .stat-value { font-weight: 700; color: #2C3E50; }
        .issue { background: #FFF9E6; padding: 15px; margin: 12px 0; border-left: 4px solid #F59E0B; border-radius: 4px; }
        .high-priority { border-left-color: #DC2626; background: #FEF2F2; }
        .issue-title { font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1F2937; }
        .issue-desc { margin: 8px 0; color: #374151; }
        .issue-amount { font-weight: 600; color: #DC2626; margin: 8px 0; }
        .issue-action { font-style: italic; color: #546E7A; margin: 8px 0; }
        .recommendations { background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .recommendations ul { margin-left: 25px; margin-top: 10px; }
        .recommendations li { margin: 8px 0; color: #1E40AF; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #E0E7ED; font-size: 12px; color: #546E7A; text-align: center; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hospital Bill Analysis Report</h1>
        <p style="font-size: 16px; margin-top: 10px;"><strong>Hospital:</strong> ${data.hospital_name || 'Unknown'}</p>
        <p style="font-size: 14px; color: #546E7A;"><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="font-size: 12px; color: #9CA3AF;"><strong>Job ID:</strong> ${data.job_id || 'N/A'}</p>
    </div>

    <div class="stats">
        <h2 style="margin-top: 0;">Summary Statistics</h2>
        <div class="stat-row">
            <span class="stat-label">High Priority Issues:</span>
            <span class="stat-value">${ui.high_priority_count || 0}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Potential Issues:</span>
            <span class="stat-value">${ui.potential_issues_count || 0}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Estimated Savings:</span>
            <span class="stat-value">$${(ui.estimated_savings_if_corrected || 0).toLocaleString()}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Data Sources:</span>
            <span class="stat-value">${(ui.data_sources_used || ['Medicare']).join(', ')}</span>
        </div>
    </div>

    ${issues.length > 0 ? `
    <h2>High Priority Issues</h2>
    ${issues.map((issue: any, i: number) => `
    <div class="issue high-priority">
        <div class="issue-title">${i + 1}. ${issue.type || 'Issue'}</div>
        <div class="issue-desc">${issue.description || 'No description available'}</div>
        ${issue.amount ? `<div class="issue-amount">Amount: $${issue.amount.toLocaleString()}</div>` : ''}
        ${issue.recommendation ? `<div class="issue-action">Action: ${issue.recommendation}</div>` : ''}
    </div>
    `).join('')}
    ` : '<p>No high priority issues found.</p>'}

    ${potential.length > 0 ? `
    <h2>Potential Issues</h2>
    ${potential.map((issue: any, i: number) => `
    <div class="issue">
        <div class="issue-title">${i + 1}. ${issue.type || 'Issue'}</div>
        <div class="issue-desc">${issue.description || 'No description available'}</div>
    </div>
    `).join('')}
    ` : ''}

    <div class="recommendations">
        <h2 style="margin-top: 0;">Recommendations</h2>
        <ul>
            <li>Review all flagged issues with your hospital billing department</li>
            <li>Request an itemized bill if you haven't received one</li>
            <li>Contact your insurance provider to verify coverage</li>
            <li>Consider filing a formal dispute for identified overcharges</li>
            <li>Request payment plans if needed</li>
        </ul>
    </div>

    <div class="footer">
        <p><strong>Hospital Bill Checker</strong></p>
        <p>This report is for informational purposes only. Consult with qualified professionals for specific guidance.</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
};

/**
 * Generate fallback text report if HTML not available
 */
export const generateTextReport = (
  data: any,
  jobId: string
): void => {
  const analysis = data.full_analysis || {};
  const uiSummary = data.ui_summary || {};
  
  const report = `HOSPITAL BILL ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()}
Hospital: ${data.hospital_name || 'Unknown'}

=== SUMMARY ===
High Priority Issues: ${uiSummary.high_priority_count || 0}
Potential Issues: ${uiSummary.potential_issues_count || 0}
Estimated Savings: $${(uiSummary.estimated_savings_if_corrected || 0).toLocaleString()}
Data Sources: ${(uiSummary.data_sources_used || []).join(', ')}

=== HIGH PRIORITY ISSUES ===
${(analysis.high_priority_issues || []).map((issue: any, i: number) => 
  `${i + 1}. ${issue.type}: ${issue.description}\n   Amount: $${(issue.amount || 0).toLocaleString()}`
).join('\n\n')}

=== POTENTIAL ISSUES ===
${(analysis.potential_issues || []).map((issue: any, i: number) => 
  `${i + 1}. ${issue.type}: ${issue.description}`
).join('\n\n')}

=== RECOMMENDATIONS ===
- Review all high-priority issues with your billing department
- Request itemized bill if not already received
- Contact your insurance provider to verify coverage
- Consider filing a dispute for identified overcharges

This report was generated by Hospital Bill Checker.
For questions, visit https://hospitalbillchecker.com
  `.trim();
  
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `medical-bill-analysis-${jobId.substring(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
