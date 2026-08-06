import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/catalog";
import { useShop } from "@/store/shop";
import { useListings } from "@/hooks/useListings";
import { createCheckoutSession } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Thrifted Threads" },
      { name: "description", content: "Shipping details, payment method and order summary for your reserved pieces." },
      { property: "og:title", content: "Checkout | Thrifted Threads" },
      { property: "og:description", content: "Complete your Thrifted Threads order." },
    ],
  }),
  component: Checkout,
});

const field = "mt-1 w-full border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-foreground";

function Checkout() {
  const cart = useShop((s) => s.cart);
  const clearCart = useShop((s) => s.clearCart);
  const { user } = useAuth();

  const { data: allListings = [] } = useListings();
  const items = cart
    .map((id) => allListings.find((l) => l.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const subtotal = items.reduce((s, p) => s + p.price, 0);
  const discount = items.length >= 3 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [benefitsOpen, setBenefitsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setApiError(null);

    const form = new FormData(e.currentTarget);
    const shippingAddress = {
      name: form.get("name") as string,
      phone: form.get("phone") as string,
      email: form.get("email") as string,
      address: form.get("address") as string,
      city: form.get("city") as string,
      postal: (form.get("postal") as string) || undefined,
    };

    setSubmitting(true);
    try {
      const result = await createCheckoutSession(
        items.map((p) => p.id),
        shippingAddress
      );

      if ("error" in result) {
        setApiError(result.error);
        return;
      }

      // Redirect to Stripe's secure hosted payment page
      clearCart();
      window.location.href = result.url;
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Almost yours"
        title="Checkout"
        intro="Your pieces are reserved while you complete this — nobody else can buy them for the next 20 minutes."
      />

      {/* Optional account nudge (guests only) */}
      {!user && items.length > 0 && (
        <div className="mx-auto mb-8 max-w-6xl px-4">
          <div className="border border-foreground/20 bg-secondary/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="type-eyebrow" style={{ color: "#7D4757" }}>Optional</span>
                <span className="text-muted-foreground">
                  Sign in or create an account to earn loyalty points and track your order.
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                  className="border border-foreground px-4 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                  className="border border-foreground bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => setBenefitsOpen((v) => !v)}
                  className="text-muted-foreground"
                  aria-label="Show account benefits"
                >
                  {benefitsOpen
                    ? <ChevronUp className="size-4" strokeWidth={1.5} />
                    : <ChevronDown className="size-4" strokeWidth={1.5} />
                  }
                </button>
              </div>
            </div>
            {benefitsOpen && (
              <ul className="mt-3 space-y-1 border-t border-foreground/10 pt-3 text-xs text-muted-foreground">
                <li>✓ Earn loyalty points on every order (PKR 100 = 1 point)</li>
                <li>✓ Track order history in one place</li>
                <li>✓ See your personal sustainability tally</li>
                <li>✓ Sync your wishlist across devices</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {apiError && (
        <div className="mx-auto mb-6 flex max-w-6xl items-start gap-3 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 px-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form
        className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 lg:grid-cols-[1fr_20rem]"
        onSubmit={handleSubmit}
      >
        <div className="space-y-10">
          {/* Shipping Details */}
          <fieldset>
            <legend className="type-h3 mb-4">Shipping Information</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Full name
                <input className={field} name="name" autoComplete="name" required placeholder="Sara Ahmed" />
              </label>
              <label className="text-sm">
                Phone (WhatsApp)
                <input className={field} name="phone" autoComplete="tel" required placeholder="+92 300 1234567" />
              </label>
              <label className="text-sm sm:col-span-2">
                Email address
                <input className={field} type="email" name="email" autoComplete="email" required placeholder="sara@example.com" />
              </label>
              <label className="text-sm sm:col-span-2">
                Street address
                <input className={field} name="address" autoComplete="street-address" required placeholder="House #, Street name, Sector" />
              </label>
              <label className="text-sm">
                City
                <input className={field} name="city" autoComplete="address-level2" required placeholder="Karachi / Lahore / Islamabad" />
              </label>
              <label className="text-sm">
                Postal code
                <input className={field} name="postal" autoComplete="postal-code" placeholder="75500" />
              </label>
            </div>
          </fieldset>

          {/* Payment method selection */}
          <fieldset>
            <legend className="type-h3 mb-4">Payment Method</legend>
            <div className="space-y-3">
              <label className="flex items-center gap-3 border border-foreground p-4 text-sm bg-secondary/20">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  defaultChecked
                  className="accent-[var(--terracotta)]"
                />
                <span className="font-medium">Card — Secure Stripe Checkout (100% Advance Payment)</span>
              </label>
            </div>
            <p className="type-caption mt-3 text-muted-foreground">
              You will be redirected to Stripe's secure hosted payment page to enter your card details. We never see or store your raw card information.
            </p>
          </fieldset>
        </div>

        <aside className="ink-frame h-fit p-5">
          <h2 className="type-h3">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((p) => (
              <li key={p.id} className="flex justify-between gap-3">
                <span className="line-clamp-2">{p.name}</span>
                <span className="shrink-0">{formatPKR(p.price)}</span>
              </li>
            ))}
            {items.length === 0 && <li className="type-caption">Your bag is empty.</li>}
          </ul>

          {discount > 0 && (
            <>
              <div className="ink-rule my-3" />
              <div className="flex justify-between text-sm text-accent">
                <span>Bundle discount (10%)</span>
                <span>−{formatPKR(discount)}</span>
              </div>
            </>
          )}

          <div className="ink-rule my-4" />
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="text-accent">{formatPKR(total)}</span>
          </div>

          <button
            type="submit"
            disabled={items.length === 0 || submitting}
            className="mt-5 w-full border border-foreground bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
          >
            {submitting ? "Redirecting to Stripe…" : "Proceed to Secure Payment →"}
          </button>

          <p className="type-caption mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="size-3" /> SSL 256-bit encrypted checkout via Stripe
          </p>

          {!user && (
            <p className="type-caption mt-3 text-center text-muted-foreground">
              Checking out as guest.{" "}
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                className="underline underline-offset-4"
              >
                Sign in instead
              </button>
            </p>
          )}
        </aside>
      </form>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
        hint={authMode === "signup"
          ? "Create a free account to earn loyalty points on this order."
          : "Sign in to earn loyalty points and keep your order history in one place."}
      />
    </SiteLayout>
  );
}
