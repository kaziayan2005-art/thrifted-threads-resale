import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { formatPKR, getById } from "@/lib/catalog";
import { useShop } from "@/store/shop";

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

const field = "mt-1 w-full border border-input bg-background px-3 py-2 text-sm";

function Checkout() {
  const cart = useShop((s) => s.cart);
  const clearCart = useShop((s) => s.clearCart);
  const items = cart.map(getById).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const subtotal = items.reduce((s, p) => s + p.price, 0);
  const discount = items.length >= 3 ? Math.round(subtotal * 0.1) : 0;
  const [ordered, setOrdered] = useState(false);
  const [orderId] = useState(() => "TT-" + Math.floor(10000 + Math.random() * 90000));

  if (ordered) {
    return (
      <SiteLayout>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
          <CheckCircle className="size-16 text-accent" strokeWidth={1.25} />
          <h1 className="type-h1 mt-6">Order placed!</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Thank you for your purchase. Your order <strong>{orderId}</strong> has been received.<br />
            We'll send you a WhatsApp confirmation shortly.
          </p>
          <Link
            to="/shop"
            className="mt-10 border border-foreground bg-accent px-8 py-3 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
          >
            Continue shopping
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Almost yours" title="Checkout" intro="Your pieces are reserved while you complete this — nobody else can buy them for the next 20 minutes." />
      <form
        className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 lg:grid-cols-[1fr_20rem]"
        onSubmit={(e) => {
          e.preventDefault();
          if (items.length === 0) return;
          clearCart();
          setOrdered(true);
        }}
      >
        <div className="space-y-10">
          <fieldset>
            <legend className="type-h3 mb-4">Shipping</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Full name
                <input className={field} name="name" autoComplete="name" required />
              </label>
              <label className="text-sm">
                Phone (WhatsApp)
                <input className={field} name="phone" autoComplete="tel" required />
              </label>
              <label className="text-sm sm:col-span-2">
                Email
                <input className={field} type="email" name="email" autoComplete="email" required />
              </label>
              <label className="text-sm sm:col-span-2">
                Address
                <input className={field} name="address" autoComplete="street-address" required />
              </label>
              <label className="text-sm">
                City
                <input className={field} name="city" autoComplete="address-level2" required />
              </label>
              <label className="text-sm">
                Postal code
                <input className={field} name="postal" autoComplete="postal-code" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="type-h3 mb-4">Payment</legend>
            <div className="space-y-3">
              {[
                { id: "card", label: "Card (Stripe secure checkout)" },
                { id: "jazzcash", label: "JazzCash" },
                { id: "easypaisa", label: "Easypaisa" },
                { id: "cod", label: "Cash on delivery" },
              ].map((m, i) => (
                <label key={m.id} className="flex items-center gap-3 border border-foreground p-3 text-sm">
                  <input type="radio" name="payment" value={m.id} defaultChecked={i === 0} className="accent-[var(--terracotta)]" />
                  {m.label}
                </label>
              ))}
            </div>
            <p className="type-caption mt-3">Card details are entered on the payment provider's hosted form — we never see or store them.</p>
          </fieldset>
        </div>

        <aside className="ink-frame h-fit p-5">
          <h2 className="type-h3">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((p) => (
              <li key={p.id} className="flex justify-between gap-3">
                <span>{p.name}</span>
                <span>{formatPKR(p.price)}</span>
              </li>
            ))}
            {items.length === 0 && <li className="type-caption">Your bag is empty.</li>}
          </ul>
          <div className="ink-rule my-4" />
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="text-accent">{formatPKR(subtotal - discount)}</span>
          </div>
          <button
            type="submit"
            disabled={items.length === 0}
            className="mt-5 w-full border border-foreground bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place order
          </button>
        </aside>
      </form>
    </SiteLayout>
  );
}

