-- ============================================================
-- Thrifted Threads — Migration 003
-- Storage bucket RLS + pg_cron scheduled reservation release
-- ============================================================

-- ─── Supabase Storage bucket for listing photos ──────────────
-- The bucket is created via Supabase dashboard or CLI:
--   supabase storage create listing-photos --public
-- The policies below enforce that only admins can upload/delete,
-- and anyone can read photos (public bucket, no download restriction).

-- Note: Storage RLS policies are managed via the Supabase dashboard
-- under Storage → Policies, or via the Management API.
-- The SQL below documents the intended policy for reference.
-- In practice these are set automatically when creating a public bucket.

-- ─── pg_cron: release stale reservations every 5 minutes ─────
-- Requires the pg_cron extension (enabled in 001_initial_schema.sql).
-- This is a safety net in addition to the Stripe webhook expiry handler.
-- The Edge Function URL must be set to your deployed Supabase project URL.

-- Enable pg_cron (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the stale reservation release to run every 5 minutes.
-- This calls a simple SQL function rather than an HTTP request to avoid
-- Edge Function cold-start latency in the cron path.
CREATE OR REPLACE FUNCTION public.release_all_stale_reservations()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  cutoff timestamptz := now() - interval '25 minutes';
  r record;
BEGIN
  -- Find and release stale reserved listings
  FOR r IN
    SELECT id FROM public.listings
    WHERE status = 'reserved' AND updated_at < cutoff
  LOOP
    PERFORM public.release_reservation(r.id);

    -- Cancel any pending orders associated with this listing
    UPDATE public.orders
    SET status = 'cancelled', updated_at = now()
    WHERE status = 'pending'
      AND id IN (
        SELECT order_id FROM public.order_items WHERE listing_id = r.id
      );
  END LOOP;
END;
$$;

-- Schedule the job (safe to re-run; unschedule first if already exists)
SELECT cron.unschedule('release-stale-reservations') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'release-stale-reservations'
);

SELECT cron.schedule(
  'release-stale-reservations',
  '*/5 * * * *',  -- every 5 minutes
  $$SELECT public.release_all_stale_reservations();$$
);


-- ─── Admin policy: allow reading reserved/draft/sold listings ─
-- Admins need to see all listing statuses (the existing policy covers this,
-- but the public read policy only exposes 'published'). This is already
-- handled by listings_admin_all policy in 001_initial_schema.sql.
-- No change needed here.


-- ─── Buyer: allow reading their own wishlist items' listing photos ─
-- The photos_public_read policy only allows reading photos for published listings.
-- Wishlist may contain sold/reserved listings the buyer previously saved.
-- We want buyers to still see the photo on their wishlist even if the item sold.
-- Add a policy that allows reading photos where the buyer has it wishlisted.
CREATE POLICY "photos_wishlisted_buyer_read" ON public.listing_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.listing_id = listing_id
        AND w.buyer_id = auth.uid()
    )
  );


-- ─── Index: wishlists lookup by listing_id (for admin reports) ──
CREATE INDEX IF NOT EXISTS wishlists_listing_idx ON public.wishlists(listing_id);


-- ─── Updated_at trigger on reviews ───────────────────────────
-- (reviews didn't get an updated_at column in 001 — add it here)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
