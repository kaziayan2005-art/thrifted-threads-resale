-- ============================================================
-- Thrifted Threads — Migration 004
-- 1. get_my_role SECURITY DEFINER function (admin login relies on this)
-- 2. Seed placeholder photos for all listings that have no photos
-- ============================================================

-- ─── get_my_role ─────────────────────────────────────────────
-- Returns the role of the currently authenticated user.
-- SECURITY DEFINER bypasses RLS so the result is always accurate,
-- even before the profile row would be readable via the normal policy.
-- The admin login page calls this immediately after signInWithPassword.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'buyer');
END;
$$;

-- Grant execute to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, anon;


-- ─── Placeholder photos for listings without images ───────────
-- Uses placehold.co for a consistent, branded placeholder.
-- Each listing gets one photo at sort_order = 0.
-- The INSERT is idempotent: skips listings that already have photos.
INSERT INTO public.listing_photos (listing_id, storage_path, public_url, alt_text, sort_order)
SELECT
  l.id,
  'placeholder/' || l.slug,
  'https://placehold.co/600x750/F5E8EE/7D4757?text=' ||
    replace(replace(replace(l.title, ' ', '+'), '&', 'and'), '''', ''),
  l.title || ' by ' || l.brand || ' — ' || l.condition_grade,
  0
FROM public.listings l
WHERE NOT EXISTS (
  SELECT 1 FROM public.listing_photos p WHERE p.listing_id = l.id
);
