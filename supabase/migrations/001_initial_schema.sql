-- ============================================================
-- Thrifted Threads — Initial Schema
-- 100% advance payment model (card only, no COD)
-- Single-unit inventory (never restocked)
-- No categories — listings are unclassified by category
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ─── profiles ────────────────────────────────────────────────
-- Extends auth.users. Role is buyer (default) or admin (manually set).
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'admin')),
  name          text,
  phone         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
-- Auto-insert on signup via trigger
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
-- Admins can see all profiles
CREATE POLICY "profiles_admin_all" ON public.profiles
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Trigger: create profile row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── grading_definitions ─────────────────────────────────────
-- Admin-editable condition grade tiers shown across the site.
CREATE TABLE public.grading_definitions (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  label       text NOT NULL UNIQUE,
  description text NOT NULL,
  sort_order  int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.grading_definitions ENABLE ROW LEVEL SECURITY;

-- Anyone can read grading definitions (used in product detail, filter etc.)
CREATE POLICY "grading_public_read" ON public.grading_definitions
  FOR SELECT USING (true);
-- Only admins can write
CREATE POLICY "grading_admin_write" ON public.grading_definitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed the 4 condition grades
INSERT INTO public.grading_definitions (label, description, sort_order) VALUES
  ('New with Tags',     'Never worn. Original tags attached. Mint condition.',                              1),
  ('Photoshoot Sample', 'Worn exclusively for a photoshoot or campaign. No signs of personal wear.',       2),
  ('Worn Once',         'Worn a single time. No visible flaws unless explicitly noted.',                   3),
  ('Gently Used',       'Shows light signs of wear. Any flaws are photographed and described in detail.', 4);


-- ─── sustainability_impact ───────────────────────────────────
-- Per-item-type water and carbon savings (admin-editable lookup).
CREATE TABLE public.sustainability_impact (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_type       text NOT NULL UNIQUE,  -- e.g. 'Tops', 'Dresses' etc.
  water_saved_l   int  NOT NULL DEFAULT 0,
  carbon_saved_kg int  NOT NULL DEFAULT 0
);

ALTER TABLE public.sustainability_impact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impact_public_read" ON public.sustainability_impact FOR SELECT USING (true);
CREATE POLICY "impact_admin_write" ON public.sustainability_impact
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.sustainability_impact (item_type, water_saved_l, carbon_saved_kg) VALUES
  ('Tops',      2700, 6),
  ('Bottoms',   3800, 9),
  ('Dresses',   4200, 11),
  ('Outerwear', 5100, 15),
  ('Knitwear',  3100, 8),
  ('Other',     3000, 7);


-- ─── listings ────────────────────────────────────────────────
-- Core inventory table. Single-unit — once sold, never restocked.
CREATE TABLE public.listings (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              text        NOT NULL UNIQUE,
  title             text        NOT NULL,
  description       text        NOT NULL DEFAULT '',
  brand             text        NOT NULL DEFAULT '',
  size              text        NOT NULL DEFAULT '',
  color             text        NOT NULL DEFAULT '',
  occasion          text        NOT NULL DEFAULT '' CHECK (occasion IN ('', 'Everyday', 'Formal', 'Festive', 'Workwear', 'Party')),
  condition_grade   text        NOT NULL REFERENCES public.grading_definitions(label),
  flaw_notes        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  fabric_details    text        NOT NULL DEFAULT '',
  measurements      text        NOT NULL DEFAULT '',
  original_price    int         NOT NULL CHECK (original_price >= 0),
  resale_price      int         NOT NULL CHECK (resale_price >= 0),
  water_saved_l     int         NOT NULL DEFAULT 0,
  carbon_saved_kg   int         NOT NULL DEFAULT 0,
  status            text        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'reserved', 'sold', 'delisted')),
  shoot_story       jsonb,      -- nullable: {campaign, season, blurb}
  best_seller       boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Indexes for filtering
CREATE INDEX listings_status_idx       ON public.listings(status);
CREATE INDEX listings_brand_idx        ON public.listings(brand);
CREATE INDEX listings_condition_idx    ON public.listings(condition_grade);
CREATE INDEX listings_price_idx        ON public.listings(resale_price);
CREATE INDEX listings_size_idx         ON public.listings(size);
CREATE INDEX listings_best_seller_idx  ON public.listings(best_seller) WHERE best_seller = true;
CREATE INDEX listings_created_at_idx   ON public.listings(created_at DESC);
-- Full-text search
CREATE INDEX listings_fts_idx ON public.listings
  USING gin(to_tsvector('english', title || ' ' || brand || ' ' || description));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Published listings are publicly readable
CREATE POLICY "listings_public_read" ON public.listings
  FOR SELECT USING (status = 'published');
-- Admins can read/write all listings
CREATE POLICY "listings_admin_all" ON public.listings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── listing_photos ──────────────────────────────────────────
CREATE TABLE public.listing_photos (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    uuid        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path  text        NOT NULL,
  public_url    text        NOT NULL,
  alt_text      text        NOT NULL DEFAULT '',
  sort_order    int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX listing_photos_listing_idx ON public.listing_photos(listing_id, sort_order);

ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;

-- Photos readable if the parent listing is published
CREATE POLICY "photos_public_read" ON public.listing_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.status = 'published')
  );
CREATE POLICY "photos_admin_all" ON public.listing_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── orders ──────────────────────────────────────────────────
-- 100% advance payment: orders are only created after payment_reference is set.
-- status='pending' is a brief intermediate state during Stripe session creation.
-- status='paid' is set by the Stripe webhook — no manual override.
CREATE TABLE public.orders (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id            uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  status              text        NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled')),
  total               int         NOT NULL CHECK (total >= 0),
  payment_provider    text        NOT NULL DEFAULT 'stripe'
                      CHECK (payment_provider IN ('stripe')),  -- card only, no COD
  payment_reference   text,       -- Stripe payment_intent or session ID
  stripe_session_id   text,
  shipping_address    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  whatsapp_notified   boolean     NOT NULL DEFAULT false,
  email_notified      boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_buyer_idx      ON public.orders(buyer_id);
CREATE INDEX orders_status_idx     ON public.orders(status);
CREATE INDEX orders_created_at_idx ON public.orders(created_at DESC);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers see only their own orders
CREATE POLICY "orders_buyer_read" ON public.orders
  FOR SELECT USING (buyer_id = auth.uid());
-- Service role / Edge Functions insert orders (no RLS restriction for service role)
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── order_items ─────────────────────────────────────────────
CREATE TABLE public.order_items (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id           uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  listing_id         uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  price_at_purchase  int  NOT NULL,
  listing_snapshot   jsonb NOT NULL DEFAULT '{}'::jsonb  -- immutable snapshot of listing at sale time
);

CREATE INDEX order_items_order_idx ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_buyer_read" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid())
  );
CREATE POLICY "order_items_admin_all" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── wishlists ───────────────────────────────────────────────
CREATE TABLE public.wishlists (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id  uuid        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, listing_id)
);

CREATE INDEX wishlists_buyer_idx ON public.wishlists(buyer_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlists_own" ON public.wishlists
  FOR ALL USING (buyer_id = auth.uid());


-- ─── reviews ─────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  uuid        REFERENCES public.listings(id) ON DELETE CASCADE,
  order_id    uuid        REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      int         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text        NOT NULL DEFAULT '',
  photo_url   text,
  status      text        NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reviews_listing_idx ON public.reviews(listing_id);
CREATE INDEX reviews_status_idx  ON public.reviews(status);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Buyers can insert reviews for their own orders; can read approved ones
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "reviews_read_approved" ON public.reviews
  FOR SELECT USING (status = 'approved' OR buyer_id = auth.uid());
CREATE POLICY "reviews_admin_all" ON public.reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── Reservation function (atomic, race-safe) ────────────────
-- Returns true if reservation succeeded, false if already taken.
CREATE OR REPLACE FUNCTION public.attempt_reserve(p_listing_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  updated_count int;
BEGIN
  UPDATE public.listings
  SET status = 'reserved', updated_at = now()
  WHERE id = p_listing_id AND status = 'published';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

-- Release reservation (called by webhook on failure or expiry)
CREATE OR REPLACE FUNCTION public.release_reservation(p_listing_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.listings
  SET status = 'published', updated_at = now()
  WHERE id = p_listing_id AND status = 'reserved';
END;
$$;

-- Mark listing as sold (called by webhook on payment success)
CREATE OR REPLACE FUNCTION public.mark_sold(p_listing_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.listings
  SET status = 'sold', updated_at = now()
  WHERE id = p_listing_id AND status IN ('reserved', 'published');
END;
$$;
