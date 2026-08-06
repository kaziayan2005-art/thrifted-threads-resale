// Supabase Edge Function — Send Order Confirmation
// Sends: email via Resend + WhatsApp via Meta Cloud API (free tier)
// Meta Cloud API: free for first 1,000 user-initiated conversations/month

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { orderId, event } = await req.json() as { orderId: string; event: "paid" | "fulfilled" };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch order + items + buyer
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*), profiles(name, phone)")
      .eq("id", orderId)
      .single();

    if (!order) return new Response("Order not found", { status: 404 });

    const shipping = order.shipping_address as {
      name: string; email: string; phone: string; address: string; city: string;
    };
    const phone = shipping.phone?.replace(/[^0-9]/g, "");
    const waPhone = phone?.startsWith("0") ? "92" + phone.slice(1) : phone;

    // ─── 1. Email via Resend ──────────────────────────────────
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey && shipping.email) {
      const subject = event === "paid"
        ? `Order Confirmed — Thrifted Threads #${orderId.slice(0, 8).toUpperCase()}`
        : `Your Order is on its Way — Thrifted Threads`;

      const htmlBody = event === "paid"
        ? `<h1>Order confirmed! 💌</h1>
           <p>Hi ${shipping.name},</p>
           <p>Payment received for order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong>.</p>
           <p>We'll dispatch within 48 hours and drop you a WhatsApp once it ships.</p>
           <p>— Thrifted Threads</p>`
        : `<h1>Your order has shipped! 📦</h1>
           <p>Hi ${shipping.name}, your pieces are on their way to ${shipping.city}.</p>
           <p>Order: <strong>#${orderId.slice(0, 8).toUpperCase()}</strong></p>
           <p>— Thrifted Threads</p>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Thrifted Threads <noreply@thriftedthreads.pk>",
          to: shipping.email,
          subject,
          html: htmlBody,
        }),
      });
    }

    // ─── 2. WhatsApp via Meta Cloud API (free tier) ───────────
    // Free for first 1,000 conversations/month — no charge for business-initiated
    // template messages within 24h of customer contact.
    // Requires: WhatsApp Business Account + approved message template.
    const waToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const waPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (waToken && waPhoneNumberId && waPhone) {
      // Template names must be approved in Meta Business Manager first.
      // Template "order_confirmed" and "order_shipped" should be created there.
      const templateName = event === "paid" ? "order_confirmed" : "order_shipped";

      await fetch(
        `https://graph.facebook.com/v19.0/${waPhoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${waToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: waPhone,
            type: "template",
            template: {
              name: templateName,
              language: { code: "en" },
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: shipping.name },
                    { type: "text", text: orderId.slice(0, 8).toUpperCase() },
                  ],
                },
              ],
            },
          }),
        }
      );
    }

    // Mark notifications sent on order
    await supabase
      .from("orders")
      .update({ whatsapp_notified: !!waToken, email_notified: !!resendKey })
      .eq("id", orderId);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
