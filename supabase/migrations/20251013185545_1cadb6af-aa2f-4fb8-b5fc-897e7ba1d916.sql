-- Security Fix: Remove overly permissive RLS policies
-- The app uses Edge Functions with SERVICE_ROLE_KEY for controlled access
-- Public direct database access should be blocked

-- Drop public UPDATE policy on dispute_letters
-- Users can still update via the save-dispute-letter Edge Function
DROP POLICY IF EXISTS "Allow public update on dispute_letters" ON public.dispute_letters;

-- Drop public SELECT policy on bill_analyses
-- Edge Functions will handle all data access
DROP POLICY IF EXISTS "Users can read their own analyses" ON public.bill_analyses;

-- Drop public SELECT policy on user_form_data
-- Edge Functions will handle all data access
DROP POLICY IF EXISTS "Allow public select on user_form_data" ON public.user_form_data;

-- Note: INSERT policies remain for Edge Functions to create records
-- All data access is now controlled through Edge Functions using SERVICE_ROLE_KEY
-- This prevents direct public database access while maintaining functionality