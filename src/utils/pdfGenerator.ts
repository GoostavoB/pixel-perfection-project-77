/**
 * Hospital Bill Checker - Client-Side PDF Generator
 * Uses html2pdf.js to convert HTML to PDF in browser
 */

interface AnalysisResult {
  job_id?: string;
  hospital_name?: string;
  ui_summary?: any;
  full_analysis?: any;
  high_priority_issues?: any[];
  potential_issues?: any[];
}

export class PDFGenerator {
  private html2pdfLoaded = false;

  async loadLibrary() {
    if (this.html2pdfLoaded || (window as any).html2pdf) {
      this.html2pdfLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.integrity = 'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        this.html2pdfLoaded = true;
        resolve(true);
      };
      
      script.onerror = () => reject(new Error('Failed to load html2pdf'));
      
      document.head.appendChild(script);
    });
  }

  async ensureLoaded() {
    if (!this.html2pdfLoaded) {
      await this.loadLibrary();
    }
    
    let attempts = 0;
    while (!(window as any).html2pdf && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!(window as any).html2pdf) {
      throw new Error('html2pdf not available');
    }
  }

  generateHTML(data: AnalysisResult): string {
    const issues = data.full_analysis?.high_priority_issues || data.high_priority_issues || [];
    const potential = data.full_analysis?.potential_issues || data.potential_issues || [];
    const ui = data.ui_summary || {};

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #2C3E50; line-height: 1.6; }
        h1 { color: #2B8FB8; font-size: 28px; margin-bottom: 10px; }
        h2 { color: #1F6B8A; font-size: 20px; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #E0E7ED; padding-bottom: 5px; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2B8FB8; padding-bottom: 25px; }
        .header p { margin: 5px 0; font-size: 14px; }
        .stats { background: #F5F7FA; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .stat-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E0E7ED; }
        .stat-row:last-child { border-bottom: none; }
        .stat-label { font-weight: 600; color: #546E7A; }
        .stat-value { font-weight: 700; color: #2B8FB8; }
        .issue { background: #FFF9E6; padding: 15px; margin: 15px 0; border-left: 4px solid #F59E0B; border-radius: 4px; }
        .issue strong { display: block; font-size: 16px; margin-bottom: 8px; color: #1F6B8A; }
        .issue p { margin: 5px 0; color: #2C3E50; }
        .high-priority { border-left-color: #DC2626; background: #FEF2F2; }
        ul { margin-left: 20px; }
        li { margin: 8px 0; color: #2C3E50; }
        .footer { margin-top: 50px; padding-top: 25px; border-top: 2px solid #E0E7ED; font-size: 11px; color: #546E7A; text-align: center; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hospital Bill Analysis Report</h1>
        <p><strong>Hospital:</strong> ${data.hospital_name || 'Unknown Hospital'}</p>
        <p><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Job ID:</strong> ${data.job_id || 'N/A'}</p>
    </div>

    <div class="stats">
        <h2>Summary Statistics</h2>
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
        <strong>${i + 1}. ${issue.type || 'Issue'}</strong>
        <p>${issue.description || 'No description available'}</p>
        ${issue.amount ? `<p><strong>Amount:</strong> $${Number(issue.amount).toLocaleString()}</p>` : ''}
        ${issue.recommendation ? `<p><strong>Recommended Action:</strong> ${issue.recommendation}</p>` : ''}
    </div>
    `).join('')}
    ` : '<p style="padding: 20px; background: #F0FDF4; border-left: 4px solid #10B981; border-radius: 4px;">✓ No high priority issues identified in your bill.</p>'}

    ${potential.length > 0 ? `
    <h2>Potential Issues for Review</h2>
    ${potential.map((issue: any, i: number) => `
    <div class="issue">
        <strong>${i + 1}. ${issue.type || 'Issue'}</strong>
        <p>${issue.description || 'No description available'}</p>
    </div>
    `).join('')}
    ` : ''}

    <h2>Recommendations</h2>
    <ul>
        <li><strong>Review Findings:</strong> Carefully examine all flagged issues with your hospital billing department</li>
        <li><strong>Request Itemization:</strong> If you haven't received an itemized bill, request one immediately</li>
        <li><strong>Verify Coverage:</strong> Contact your insurance provider to confirm coverage and benefits</li>
        <li><strong>File Disputes:</strong> Consider filing formal disputes for any confirmed overcharges or errors</li>
        <li><strong>Payment Plans:</strong> If needed, ask about payment plan options to manage costs</li>
        <li><strong>Document Everything:</strong> Keep copies of all correspondence and bills for your records</li>
    </ul>

    <div class="footer">
        <p><strong>Hospital Bill Checker</strong></p>
        <p>This report is for informational purposes only and does not constitute medical or legal advice.</p>
        <p>Consult with qualified professionals for guidance specific to your situation.</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
  }

  async generatePDF(data: AnalysisResult, filename = 'hospital-bill-analysis.pdf') {
    await this.ensureLoaded();
    
    const html = this.generateHTML(data);
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false 
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    container.innerHTML = html;
    document.body.appendChild(container);
    
    try {
      await (window as any).html2pdf().set(opt).from(container).save();
    } finally {
      document.body.removeChild(container);
    }
  }
}

export const pdfGenerator = new PDFGenerator();
