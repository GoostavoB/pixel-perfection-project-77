-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for bill analysis jobs
CREATE TABLE public.bill_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  extracted_text TEXT,
  analysis_result JSONB,
  critical_issues INTEGER DEFAULT 0,
  moderate_issues INTEGER DEFAULT 0,
  estimated_savings DECIMAL(10,2) DEFAULT 0,
  total_overcharges DECIMAL(10,2) DEFAULT 0,
  issues JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bill_analyses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for form submissions)
CREATE POLICY "Anyone can create bill analysis"
ON public.bill_analyses
FOR INSERT
WITH CHECK (true);

-- Allow users to read their own analyses by session_id
CREATE POLICY "Users can read their own analyses"
ON public.bill_analyses
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_bill_analyses_session_id ON public.bill_analyses(session_id);
CREATE INDEX idx_bill_analyses_email ON public.bill_analyses(user_email);

-- Create updated_at trigger
CREATE TRIGGER update_bill_analyses_updated_at
BEFORE UPDATE ON public.bill_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for bill uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-bills', 'medical-bills', false);

-- Storage policies for bill uploads
CREATE POLICY "Anyone can upload bills"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'medical-bills');

CREATE POLICY "Users can read their own bills"
ON storage.objects
FOR SELECT
USING (bucket_id = 'medical-bills');