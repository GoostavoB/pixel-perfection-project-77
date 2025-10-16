-- Create table for tracking fair price API metrics
CREATE TABLE IF NOT EXISTS public.fair_price_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_type TEXT NOT NULL, -- 'batch' or 'single'
  total_codes INTEGER NOT NULL,
  cached_codes INTEGER NOT NULL,
  api_calls INTEGER NOT NULL,
  cache_hit_rate DECIMAL(5,2),
  response_time_ms INTEGER,
  estimated_cost_saved DECIMAL(10,4),
  error_count INTEGER DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_fair_price_metrics_created_at ON public.fair_price_metrics(created_at DESC);

-- Enable RLS
ALTER TABLE public.fair_price_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public read access for admin dashboard
CREATE POLICY "Allow public read access to metrics"
  ON public.fair_price_metrics
  FOR SELECT
  USING (true);