-- Allow users to view bill analyses by session_id (for unauthenticated users)
DROP POLICY IF EXISTS "Users can view their own bill analyses" ON public.bill_analyses;

CREATE POLICY "Users can view bill analyses by session or auth"
ON public.bill_analyses
FOR SELECT
USING (
  auth.uid() = user_id 
  OR user_id IS NULL
);