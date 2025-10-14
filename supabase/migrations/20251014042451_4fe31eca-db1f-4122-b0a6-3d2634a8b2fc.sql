-- Add columns to store PDF report and dispute letter URLs
ALTER TABLE public.bill_analyses 
ADD COLUMN IF NOT EXISTS pdf_report_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dispute_letter_url TEXT,
ADD COLUMN IF NOT EXISTS dispute_letter_generated_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bill_analyses_pdf_report ON public.bill_analyses(pdf_report_url) WHERE pdf_report_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bill_analyses_dispute_letter ON public.bill_analyses(dispute_letter_url) WHERE dispute_letter_url IS NOT NULL;