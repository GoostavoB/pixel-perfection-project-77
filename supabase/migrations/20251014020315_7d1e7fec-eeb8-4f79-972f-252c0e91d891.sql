-- Enable RLS on all tables (already enabled but ensuring)
ALTER TABLE public.bill_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_form_data ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive public policies
DROP POLICY IF EXISTS "Anyone can create bill analysis" ON public.bill_analyses;
DROP POLICY IF EXISTS "Allow public insert on dispute_letters" ON public.dispute_letters;
DROP POLICY IF EXISTS "Allow public select on dispute_letters" ON public.dispute_letters;
DROP POLICY IF EXISTS "Allow public insert on user_form_data" ON public.user_form_data;

-- Add user_id column to tables to link with authenticated users
ALTER TABLE public.bill_analyses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.dispute_letters ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_form_data ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add session expiration (24 hours)
ALTER TABLE public.bill_analyses ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours');
ALTER TABLE public.dispute_letters ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours');
ALTER TABLE public.user_form_data ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bill_analyses_user_id ON public.bill_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_analyses_session_id ON public.bill_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_dispute_letters_user_id ON public.dispute_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_dispute_letters_session_id ON public.dispute_letters(session_id);
CREATE INDEX IF NOT EXISTS idx_user_form_data_user_id ON public.user_form_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_form_data_session_id ON public.user_form_data(session_id);

-- RLS Policies for bill_analyses
CREATE POLICY "Users can view their own bill analyses"
ON public.bill_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bill analyses"
ON public.bill_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bill analyses"
ON public.bill_analyses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bill analyses"
ON public.bill_analyses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for dispute_letters
CREATE POLICY "Users can view their own dispute letters"
ON public.dispute_letters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dispute letters"
ON public.dispute_letters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dispute letters"
ON public.dispute_letters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dispute letters"
ON public.dispute_letters
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for user_form_data
CREATE POLICY "Users can view their own form data"
ON public.user_form_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own form data"
ON public.user_form_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own form data"
ON public.user_form_data
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own form data"
ON public.user_form_data
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create storage policies for medical-bills bucket
CREATE POLICY "Users can upload their own medical bills"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own medical bills"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own medical bills"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'medical-bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own medical bills"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.bill_analyses WHERE expires_at < now();
  DELETE FROM public.dispute_letters WHERE expires_at < now();
  DELETE FROM public.user_form_data WHERE expires_at < now();
END;
$$;