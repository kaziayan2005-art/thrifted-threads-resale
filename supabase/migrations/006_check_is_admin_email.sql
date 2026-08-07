-- ============================================================
-- Thrifted Threads — Migration 006
-- Server-side check if an email belongs to a registered admin account.
-- Used by the Admin Forgot Password flow before dispatching reset emails.
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_is_admin_email(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    WHERE LOWER(u.email) = LOWER(p_email)
      AND p.role = 'admin'
  ) INTO v_is_admin;

  RETURN COALESCE(v_is_admin, false);
END;
$$;

-- Grant execute to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.check_is_admin_email(text) TO authenticated, anon;
