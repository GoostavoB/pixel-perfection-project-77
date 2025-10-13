-- Create user_form_data table to store form submissions
CREATE TABLE IF NOT EXISTS public.user_form_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.bill_analyses(session_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  birth_year INTEGER,
  hospital_city TEXT,
  hospital_state TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispute_letters table
CREATE TABLE IF NOT EXISTS public.dispute_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.bill_analyses(session_id) ON DELETE CASCADE,
  template_text TEXT NOT NULL,
  user_name TEXT,
  user_address TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_form_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_letters ENABLE ROW LEVEL SECURITY;

-- Public read/write for user_form_data (no auth required)
CREATE POLICY "Allow public insert on user_form_data"
  ON public.user_form_data FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select on user_form_data"
  ON public.user_form_data FOR SELECT
  USING (true);

-- Public read/write for dispute_letters (no auth required)
CREATE POLICY "Allow public insert on dispute_letters"
  ON public.dispute_letters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select on dispute_letters"
  ON public.dispute_letters FOR SELECT
  USING (true);

CREATE POLICY "Allow public update on dispute_letters"
  ON public.dispute_letters FOR UPDATE
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_form_data_session_id ON public.user_form_data(session_id);
CREATE INDEX IF NOT EXISTS idx_dispute_letters_session_id ON public.dispute_letters(session_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_form_data_updated_at
  BEFORE UPDATE ON public.user_form_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispute_letters_updated_at
  BEFORE UPDATE ON public.dispute_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();