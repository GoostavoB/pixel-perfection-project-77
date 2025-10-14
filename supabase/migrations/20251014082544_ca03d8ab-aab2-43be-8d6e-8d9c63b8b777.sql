-- Add UPDATE policy for analysis_results table
CREATE POLICY "Allow UPDATE on analysis_results"
ON public.analysis_results
FOR UPDATE
USING (true)
WITH CHECK (true);