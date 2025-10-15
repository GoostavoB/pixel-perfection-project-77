-- Add pdf_hash column for caching to avoid reprocessing same bills
ALTER TABLE bill_analyses 
ADD COLUMN IF NOT EXISTS pdf_hash TEXT;

-- Create unique index to prevent duplicate processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_bill_analyses_pdf_hash 
ON bill_analyses(pdf_hash) 
WHERE pdf_hash IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN bill_analyses.pdf_hash IS 'SHA-256 hash of the PDF file to enable deterministic caching';