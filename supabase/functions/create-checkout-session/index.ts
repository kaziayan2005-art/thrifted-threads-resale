// Supabase Edge Function — Create Stripe Checkout Session
// Deployed as: supabase/functions/create-checkout-session/index.ts
// Business rule: 100% advance payment — card only, no COD

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { listingIds, shippingAddress } = body as {
      listingIds: string[];
      shippingAddress: { name: string; phone: string; email: string; address: string; city: string; postal?: string };
    };

    if (!listingIds?.length) throw new Error("No listings provided");

    // Fetch listings from DB
    const { data: listings, error: fetchError } = await supabase
      .from("listings")
      .select("id, title, resale_price, slug")
      .in("id", listingIds)
      .eq("status", "published");

    if (fetchError) throw fetchError;
    if (!listings?.length) throw new Error("No published listings found for given IDs");

    // Atomic reservation — attempt_reserve for each listing
    for (const listing of listings) {
      const { data: reserved } = await supabase.rpc("attempt_reserve", { p_listing_id: listing.id });
      if (!reserved) {
        return new Response(
          JSON.stringify({ error: `"${listing.title}" is no longer available — someone just reserved it.` }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get the authenticated user (if logged in)
    const authHeader = req.headers.get("Authorization");
    let buyerId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      buyerId = user?.id ?? null;
    }

    // Create a pending order row
    const total = listings.reduce((sum, l) => sum + l.resale_price, 0);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: buyerId,
        status: "pending",
        total,
        payment_provider: "stripe",
        shipping_address: shippingAddress,
      })
      .select()
      .single();
    if (orderError) throw orderError;

    // Insert order items (snapshot listing details)
    await supabase.from("order_items").insert(
      listings.map(l => ({
        order_id: order.id,
        listing_id: l.id,
        price_at_purchase: l.resale_price,
        listing_snapshot: l,
      }))
    );

    // Create Stripe Checkout Session
    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: listings.map(l => ({
        price_data: {
          currency: "pkr",
          unit_amount: l.resale_price * 100,
          product_data: { name: l.title },
        },
        quantity: 1,
      })),
      customer_email: shippingAddress.email,
      metadata: { order_id: order.id, listing_ids: listingIds.join(",") },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      expires_at: Math.floor(Date.now() / 1000) + 20 * 60, // 20-minute reservation window
    });

    // Store Stripe session ID on the order
    await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
