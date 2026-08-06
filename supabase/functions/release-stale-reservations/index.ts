// Supabase Edge Function — Release Stale Reservations
// Deploy as a scheduled function (every 5 minutes via pg_cron or Supabase cron)
// Releases listings stuck in 'reserved' status when the Stripe session has expired.
// Safe to call multiple times — only affects genuinely stale reservations.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Reservation window is 20 min (set in create-checkout-session).
// We wait 25 min before force-releasing to give Stripe's expired webhook time to fire first.
const STALE_THRESHOLD_MINUTES = 25;

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const cutoff = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000).toISOString();

  // Find all listings still in 'reserved' status, updated more than threshold ago
  const { data: staleListings, error: fetchError } = await supabase
    .from("listings")
    .select("id, updated_at")
    .eq("status", "reserved")
    .lt("updated_at", cutoff);

  if (fetchError) {
    console.error("[release-stale-reservations] fetch error:", fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  if (!staleListings?.length) {
    return new Response(JSON.stringify({ released: 0, message: "No stale reservations found." }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const released: string[] = [];
  const errors: string[] = [];

  for (const listing of staleListings) {
    // Release the listing back to 'published'
    const { error: releaseError } = await supabase.rpc("release_reservation", {
      p_listing_id: listing.id,
    });

    if (releaseError) {
      errors.push(`listing ${listing.id}: ${releaseError.message}`);
      continue;
    }

    released.push(listing.id);

    // Cancel any pending order that references this listing
    // (join through order_items to find the order)
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("order_id, orders(status)")
      .eq("listing_id", listing.id);

    for (const item of orderItems ?? []) {
      const order = item.orders as { status: string } | null;
      if (order?.status === "pending") {
        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", item.order_id)
          .eq("status", "pending");
      }
    }
  }

  console.log(`[release-stale-reservations] Released: ${released.length}, Errors: ${errors.length}`);

  return new Response(
    JSON.stringify({ released: released.length, listing_ids: released, errors }),
    { headers: { "Content-Type": "application/json" } }
  );
});
