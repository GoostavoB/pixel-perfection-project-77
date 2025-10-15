// Hospital Bill Checker - Lovable AI Integration
// Direct Supabase edge function using Lovable AI for consistent analysis

interface UISummary {
  high_priority_count: number;
  potential_issues_count: number;
  estimated_savings_if_corrected: number;
  data_sources_used: string[];
  tags: string[];
}

interface UploadResponse {
  success: boolean;
  job_id: string;
  session_id: string;
  ui_summary: UISummary;
  status: string;
  message: string;
}

interface AnalysisResult {
  id: string;
  job_id: string;
  hospital_name: string;
  pdf_report_html: string;
  dispute_letter_html: string;
  full_analysis: any;
  ui_summary: UISummary;
  cpt_codes: any;
  cpt_count: number;
  findings: any;
  raw_text: string;
}

interface JobStatus {
  job_id: string;
  session_id: string;
  status: string;
  progress: number;
  completed_at: string | null;
  error_message: string | null;
}

// API Configuration - Now using Lovable AI instead of n8n
const CONFIG = {
  UPLOAD_ENDPOINT: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-bill-lovable`,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
};

/**
 * Upload medical bill PDF for analysis
 * @param file - PDF file to upload
 * @returns Upload response with job_id and ui_summary
 * @throws Error if upload fails
 */
export async function uploadMedicalBill(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(CONFIG.UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload failed:', response.status, errorText);
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get full analysis details from Supabase
 * @param jobId - Job ID from upload response
 * @returns Complete analysis result with HTML reports
 * @throws Error if fetch fails
 */
export async function getAnalysisDetails(jobId: string): Promise<AnalysisResult> {
  const response = await fetch(
    `${CONFIG.SUPABASE_URL}/rest/v1/analysis_results?job_id=eq.${jobId}`,
    {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch analysis details');
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    throw new Error('Analysis not found');
  }
  
  return data[0];
}

/**
 * Get job status (for polling)
 * @param jobId - Job ID to check
 * @returns Job status information
 * @throws Error if fetch fails
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(
    `${CONFIG.SUPABASE_URL}/rest/v1/jobs?job_id=eq.${jobId}`,
    {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch job status');
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    throw new Error('Job not found');
  }
  
  return data[0];
}

/**
 * Validate PDF file before upload
 * @param file - File to validate
 * @throws Error if validation fails
 */
export function validatePDFFile(file: File): void {
  if (!file.type.includes('pdf')) {
    throw new Error('Only PDF files are accepted');
  }
  
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }
}

/**
 * Download HTML content as file
 * @param html - HTML content
 * @param filename - Filename for download
 */
export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param delay - Initial delay in milliseconds
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
