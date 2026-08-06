-- ============================================================
-- Thrifted Threads — Migration 005
-- Auto-confirm newly registered auth users (bypasses email confirmation requirement)
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at = coalesce(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_auto_confirm_user ON auth.users;
CREATE TRIGGER tr_auto_confirm_user
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- Also confirm any existing unconfirmed users
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
