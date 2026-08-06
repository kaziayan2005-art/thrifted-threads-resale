import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/catalog";
import { useShop } from "@/store/shop";
import { useListings } from "@/hooks/useListings";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag | Thrifted Threads" },
      { name: "description", content: "Review your one-of-one pieces, bundle discount and promo code before checkout." },
      { property: "og:title", content: "Your Bag | Thrifted Threads" },
      { property: "og:description", content: "Review your reserved pieces before checkout." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const cart = useShop((s) => s.cart);
  const remove = useShop((s) => s.removeFromCart);

  // Use real listings (Supabase or mock) to resolve cart IDs → product data
  const { data: allListings = [], isLoading } = useListings();
  const items = cart
    .map((id) => allListings.find((l) => l.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const subtotal = items.reduce((sum, p) => sum + p.price, 0);
  const bundleEligible = items.length >= 3;
  const discount = bundleEligible ? Math.round(subtotal * 0.1) : 0;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Checkout" title="Your bag" intro="Pieces stay reserved for 20 minutes once you start checkout." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 lg:grid-cols-[1fr_20rem]">
        <div>
          {isLoading && cart.length > 0 ? (
            <div className="space-y-4 animate-pulse">
              {cart.map((id) => (
                <div key={id} className="flex gap-4 py-5">
                  <div className="size-24 rounded bg-secondary/60" />
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="h-3 w-1/4 rounded bg-secondary/60" />
                    <div className="h-4 w-1/2 rounded bg-secondary/60" />
                    <div className="h-3 w-1/3 rounded bg-secondary/40" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="ink-frame border-dashed p-12 text-center">
              <p className="type-h3">Nothing hanging here yet.</p>
              <Link to="/shop" className="ink-tag mt-4 inline-flex hover:bg-secondary">
                Browse the rail
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((p) => (
                <li key={p.id} className="flex gap-4 py-5">
                  {p.image ? (
                    <img src={p.image} alt={p.imageAlt} loading="lazy" width={800} height={1000} className="ink-frame size-24 object-cover" />
                  ) : (
                    <div className="ink-frame size-24 flex items-center justify-center bg-secondary/20">
                      <span className="type-caption text-muted-foreground text-xs">—</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="type-eyebrow text-muted-foreground">{p.brand}</p>
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="text-sm font-medium hover:underline">
                      {p.name}
                    </Link>
                    <p className="type-caption">
                      Size {p.size} · {p.condition}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-accent">{formatPKR(p.price)}</p>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      aria-label={`Remove ${p.name} from bag`}
                      className="type-caption mt-2 inline-flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.25} /> Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="ink-frame h-fit p-5">
          <h2 className="type-h3">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPKR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Bundle discount {bundleEligible ? "(3+ pieces)" : ""}</dt>
              <dd>{discount ? `– ${formatPKR(discount)}` : "—"}</dd>
            </div>
            <div className="ink-rule my-3" />
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd className="text-accent">{formatPKR(subtotal - discount)}</dd>
            </div>
          </dl>
          {!bundleEligible && items.length > 0 && (
            <p className="type-caption mt-3">Add {3 - items.length} more piece(s) for 10% off the bundle.</p>
          )}
          <label htmlFor="promo" className="type-eyebrow mt-6 block">
            Promo code
          </label>
          <input
            id="promo"
            className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm"
            placeholder="Enter code"
          />
          <Link
            to="/checkout"
            className="mt-5 block border border-foreground bg-accent px-5 py-3 text-center text-sm font-medium text-accent-foreground"
          >
            Continue to checkout
          </Link>
          <p className="type-caption mt-3">Guest checkout is fine — making an account adds loyalty points and your impact tally.</p>
        </aside>
      </div>
    </SiteLayout>
  );
}
