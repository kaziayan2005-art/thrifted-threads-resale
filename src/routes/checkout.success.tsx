import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, Package } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase, isMockMode } from "@/lib/supabase";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed | Thrifted Threads" },
      { name: "description", content: "Your Thrifted Threads order has been confirmed." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: (search.session_id as string) ?? "",
  }),
  component: CheckoutSuccess,
});

interface OrderSummary {
  id: string;
  status: string;
  total: number;
  shipping_address: { name?: string; city?: string };
}

function CheckoutSuccess() {
  const { session_id } = Route.useSearch();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode || !session_id || session_id === "mock_session_demo") {
      setLoading(false);
      return;
    }

    // Fetch order by ID or Stripe session ID
    let query = supabase.from("orders").select("id, status, total, shipping_address");
    if (session_id.includes("-")) {
      query = query.eq("id", session_id);
    } else {
      query = query.eq("stripe_session_id", session_id);
    }

    query.maybeSingle().then(({ data }) => {
      setOrder(data as OrderSummary | null);
      setLoading(false);
    });
  }, [session_id]);

  const shipping = order?.shipping_address;

  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent/40">
            <CheckCircle className="h-10 w-10 text-accent" strokeWidth={1.25} />
          </div>
        </div>

        <p className="type-eyebrow text-muted-foreground">Payment confirmed</p>
        <h1 className="type-h1 mt-2">
          {shipping?.name ? `Thank you, ${shipping.name.split(" ")[0]}!` : "Order placed!"}
        </h1>

        {loading ? (
          <div className="mt-6 h-4 w-48 animate-pulse rounded bg-secondary/60" />
        ) : order ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Order <strong className="text-foreground">#{order.id.slice(0, 8).toUpperCase()}</strong> is confirmed.
            {shipping?.city ? ` We'll dispatch to ${shipping.city}` : " We'll dispatch your pieces"} within 48 hours and
            drop you a WhatsApp message once it ships.
          </p>
        ) : (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Your order has been received and payment is confirmed.
            We'll send you a WhatsApp confirmation and dispatch within 48 hours.
          </p>
        )}

        {/* What happens next */}
        <div className="ink-frame mt-10 w-full p-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <p className="type-eyebrow">What happens next</p>
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-foreground/30 text-xs font-semibold text-foreground">1</span>
              <span>We confirm your pieces within 2 hours during business hours.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-foreground/30 text-xs font-semibold text-foreground">2</span>
              <span>Items are carefully packed and handed to our courier within 48 hours.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-foreground/30 text-xs font-semibold text-foreground">3</span>
              <span>You'll get a WhatsApp message with a tracking link once dispatched.</span>
            </li>
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/shop"
            className="border border-foreground bg-accent px-8 py-3 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
          >
            Continue shopping
          </Link>
          <Link
            to="/account"
            className="border border-input px-8 py-3 text-sm font-medium tracking-wide text-muted-foreground transition-opacity hover:opacity-80"
          >
            View my orders
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
