-- Create jobs table for tracking analysis jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  analysis_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  progress INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create analysis_results table for detailed analysis data
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(job_id) ON DELETE CASCADE,
  raw_text TEXT,
  hospital_name TEXT,
  cpt_codes JSONB,
  cpt_count INTEGER,
  ui_summary JSONB NOT NULL,
  full_analysis JSONB NOT NULL,
  findings JSONB,
  pdf_report_html TEXT,
  dispute_letter_html TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create medicare_prices table for benchmark pricing
CREATE TABLE IF NOT EXISTS public.medicare_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpt_code TEXT NOT NULL UNIQUE,
  description TEXT,
  medicare_facility_rate NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit_log table for debugging
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(job_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_session_id ON public.jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_results_job_id ON public.analysis_results(job_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_job_id ON public.audit_log(job_id);
CREATE INDEX IF NOT EXISTS idx_medicare_prices_cpt_code ON public.medicare_prices(cpt_code);

-- Enable RLS (row level security) on tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicare_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view all jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Users can insert jobs" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update jobs" ON public.jobs FOR UPDATE USING (true);

CREATE POLICY "Users can view all analysis results" ON public.analysis_results FOR SELECT USING (true);
CREATE POLICY "Users can insert analysis results" ON public.analysis_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view medicare prices" ON public.medicare_prices FOR SELECT USING (true);

CREATE POLICY "Users can view audit logs" ON public.audit_log FOR SELECT USING (true);
CREATE POLICY "Users can insert audit logs" ON public.audit_log FOR INSERT WITH CHECK (true);