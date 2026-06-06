-- ============================================
-- LifeOS Waitlist — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  top_problem   TEXT,
  source        TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  confirmed_at  TIMESTAMPTZ,
  notes         TEXT
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS waitlist_email_idx   ON public.waitlist (email);
CREATE INDEX IF NOT EXISTS waitlist_created_idx ON public.waitlist (created_at DESC);
CREATE INDEX IF NOT EXISTS waitlist_problem_idx ON public.waitlist (top_problem);

-- 3. Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 4. INSERTS: anyone can join waitlist
--    Guard: email must look like an email (basic sanity check at DB level)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 254
    AND (name IS NULL OR length(name) <= 100)
  );

-- 5. SELECT: anon users can ONLY read the aggregate count — NOT individual rows.
--    We use a security-definer function for the count so no emails are exposed.
--    Anon role has NO direct SELECT on the waitlist table.
-- (No SELECT policy for anon — count is served via the function below)

-- 6. Service role (used server-side only) can do everything.
--    No additional policy needed; service role bypasses RLS.

-- 7. Secure count function — callable by anon, returns only a number
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER   -- runs as the function owner (postgres), not the caller
STABLE
AS $$
  SELECT COUNT(*) FROM public.waitlist;
$$;

-- Grant execute on the count function to anon role only
REVOKE ALL ON FUNCTION public.get_waitlist_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_waitlist_count() TO anon, authenticated;

-- 8. Admin-only analytics view (NOT exposed to anon)
--    Access this only via Supabase Dashboard or service role key
CREATE OR REPLACE VIEW public.waitlist_admin AS
SELECT
  id,
  email,
  name,
  top_problem,
  source,
  created_at
FROM public.waitlist
ORDER BY created_at DESC;

-- Revoke public access to the admin view
REVOKE ALL ON public.waitlist_admin FROM anon, authenticated;

-- ============================================
-- ADMIN QUERIES (run in Supabase SQL editor):
-- SELECT * FROM waitlist_admin ORDER BY created_at DESC;
-- SELECT get_waitlist_count();
-- SELECT top_problem, COUNT(*) FROM waitlist GROUP BY top_problem ORDER BY 2 DESC;
-- ============================================
