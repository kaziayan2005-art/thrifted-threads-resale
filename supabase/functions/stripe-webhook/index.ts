// Supabase Edge Function — Stripe Webhook Handler
// Handles: checkout.session.completed → finalize order + notify
//          checkout.session.expired   → release reservation

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });

serve(async (req) => {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const listingIds = session.metadata?.listing_ids?.split(",") ?? [];

    if (!orderId) return new Response("Missing order_id in metadata", { status: 400 });

    // Mark order as paid
    await supabase.from("orders").update({
      status: "paid",
      payment_reference: session.payment_intent as string,
    }).eq("id", orderId);

    // Mark each listing as sold
    for (const listingId of listingIds) {
      await supabase.rpc("mark_sold", { p_listing_id: listingId });
    }

    // Trigger notifications (email + WhatsApp)
    await supabase.functions.invoke("send-order-confirmation", {
      body: { orderId, event: "paid" },
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingIds = session.metadata?.listing_ids?.split(",") ?? [];
    const orderId = session.metadata?.order_id;

    // Release reservations
    for (const listingId of listingIds) {
      await supabase.rpc("release_reservation", { p_listing_id: listingId });
    }

    // Cancel the pending order
    if (orderId) {
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
