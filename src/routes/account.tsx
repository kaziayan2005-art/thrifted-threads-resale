import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/catalog";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account | Thrifted Threads" },
      { name: "description", content: "Order history, tracking, loyalty points and your personal sustainability tally." },
      { property: "og:title", content: "Your Account | Thrifted Threads" },
      { property: "og:description", content: "Orders, loyalty points and your impact tally." },
    ],
  }),
  component: Account,
});

const statusLabel: Record<string, string> = {
  pending: "Processing",
  paid: "Confirmed",
  fulfilled: "Delivered",
  cancelled: "Cancelled",
};

const statusColor: Record<string, string> = {
  pending: "#E8B87A",
  paid: "#9B8EC4",
  fulfilled: "#7DA88A",
  cancelled: "#C08080",
};

function Account() {
  const { user, profile, signOut, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { data: orders = [], isLoading } = useOrders();

  // ── Not signed in ─────────────────────────────────────────
  if (!loading && !user) {
    return (
      <SiteLayout>
        <PageHeader eyebrow="Account" title="Your dashboard" intro="Sign in to see your orders, loyalty points and sustainability tally." />
        <div className="mx-auto flex max-w-md flex-col items-center px-4 pb-24 text-center">
          <div className="ink-frame w-full p-8">
            <p className="type-h3">Sign in to your account</p>
            <p className="type-caption mt-2 mb-6">
              Track your orders, earn loyalty points, and see your sustainability impact.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                className="w-full border border-foreground bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Sign in
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                className="w-full border border-foreground px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Create account
              </button>
            </div>
          </div>
          <Link to="/shop" className="ink-tag mt-6 inline-flex hover:bg-secondary">
            Continue browsing
          </Link>
        </div>
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          defaultMode={authMode}
          hint={authMode === "login" ? "Sign in to view your order history and loyalty points." : "Create an account to track orders and earn loyalty points."}
        />
      </SiteLayout>
    );
  }

  // Sustainability tally from fulfilled orders
  const fulfilledOrders = orders.filter((o) => o.status === "fulfilled" || o.status === "paid");
  const totalSpend = fulfilledOrders.reduce((s, o) => s + o.total, 0);
  const points = Math.round(totalSpend / 100);
  const itemCount = fulfilledOrders.reduce((s, o) => s + o.order_items.length, 0);
  // Rough sustainability estimate: avg 3,500L water and 9kg CO₂ per item
  const waterSaved = itemCount * 3500;
  const carbonSaved = itemCount * 9;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Account" title="Your dashboard" intro="Orders, tracking and the impact you've stacked up so far." />
      <div className="mx-auto max-w-4xl px-4 pb-24">

        {/* Profile + sign out */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="type-eyebrow text-muted-foreground">Signed in as</p>
            <p className="type-h3 mt-1">{profile?.name ?? user?.email ?? "—"}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="ink-tag hover:bg-secondary cursor-pointer border-foreground/30 text-muted-foreground"
          >
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-14">
          <div className="ink-frame p-6">
            <p className="type-eyebrow text-muted-foreground">Loyalty points</p>
            <p className="type-h2 mt-2">{points.toLocaleString()}</p>
          </div>
          <div className="ink-frame p-6">
            <p className="type-eyebrow text-muted-foreground">Water saved</p>
            <p className="type-h2 mt-2">{waterSaved >= 1000 ? `${(waterSaved / 1000).toFixed(1)}k` : waterSaved}<span className="text-base font-normal text-muted-foreground ml-1">L</span></p>
          </div>
          <div className="ink-frame p-6">
            <p className="type-eyebrow text-muted-foreground">CO₂ avoided</p>
            <p className="type-h2 mt-2">{carbonSaved}<span className="text-base font-normal text-muted-foreground ml-1">kg</span></p>
          </div>
        </div>

        {/* Order history */}
        <h2 className="type-h2 mb-6">Order history</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="ink-frame animate-pulse p-5">
                <div className="h-4 w-32 rounded bg-secondary/60" />
                <div className="mt-3 h-3 w-48 rounded bg-secondary/40" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="ink-frame border-dashed p-12 text-center">
            <p className="type-h3">No orders yet.</p>
            <Link to="/shop" className="ink-tag mt-4 inline-flex hover:bg-secondary">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-6">
            {orders.map((o) => {
              const shipping = o.shipping_address as { name?: string; city?: string } | null;
              const label = statusLabel[o.status] ?? o.status;
              const color = statusColor[o.status] ?? "#8A6A6A";
              return (
                <li key={o.id} className="ink-frame p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="type-eyebrow">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <span
                      className="ink-tag text-xs"
                      style={{ borderColor: color, color }}
                    >
                      {label}
                    </span>
                  </div>
                  <p className="type-caption mt-1">
                    {new Date(o.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                    {shipping?.city ? ` · ${shipping.city}` : ""}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {o.order_items.map((item, idx) => {
                      const snap = item.listing_snapshot as { title?: string; slug?: string } | null;
                      return (
                        <li key={item.id ?? idx} className="flex justify-between gap-3">
                          {snap?.slug ? (
                            <Link to="/product/$slug" params={{ slug: snap.slug }} className="hover:underline">
                              {snap.title ?? "Item"}
                            </Link>
                          ) : (
                            <span>{snap?.title ?? "Item"}</span>
                          )}
                          <span>{formatPKR(item.price_at_purchase)}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="ink-rule my-3" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span className="text-accent">{formatPKR(o.total)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
