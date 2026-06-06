-- ============================================================
-- LifeOS Waitlist — Database Schema
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT,
  top_problem   TEXT,
  source        TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  confirmed_at  TIMESTAMPTZ,
  notes         TEXT
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS waitlist_email_idx   ON public.waitlist (email);
CREATE INDEX IF NOT EXISTS waitlist_created_idx ON public.waitlist (created_at DESC);
CREATE INDEX IF NOT EXISTS waitlist_problem_idx ON public.waitlist (top_problem);

-- 3. Row Level Security — ON
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 4. INSERT policy — with email format validation at DB level
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 254
    AND (name IS NULL OR length(name) <= 100)
  );

-- 5. NO direct SELECT for anon — emails are private.
--    Count is served via the secure RPC function below.

-- 6. Secure count function (anon can call this, gets a number only)
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER   -- runs as owner (postgres), not as the calling user
STABLE
AS $$
  SELECT COUNT(*) FROM public.waitlist;
$$;

-- Restrict who can call the function
REVOKE ALL  ON FUNCTION public.get_waitlist_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_waitlist_count() TO anon, authenticated;

-- 7. Admin-only view (access via Supabase Dashboard or service role only)
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

-- Revoke anon/authenticated access to admin view
REVOKE ALL ON public.waitlist_admin FROM anon, authenticated;

-- ============================================================
-- ADMIN QUERIES (run in Supabase SQL Editor):
--   SELECT * FROM waitlist_admin ORDER BY created_at DESC;
--   SELECT get_waitlist_count();
--   SELECT top_problem, COUNT(*) FROM waitlist
--   GROUP BY top_problem ORDER BY 2 DESC;
-- ============================================================
