import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShieldCheck, Truck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ConditionBadge } from "@/components/ConditionBadge";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import type { Flaw } from "@/types";
import { formatPKR } from "@/lib/catalog";
import { useShop } from "@/store/shop";
import { useListing, useListings } from "@/hooks/useListings";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product | Thrifted Threads" },
      {
        name: "description",
        content: "Pre-loved luxury, graded by hand. Single unit — when it sells, it's gone.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useListing(slug);

  // Fetch related items (same condition or brand) — limit comes from hook's 40-item cap
  const { data: allListings = [] } = useListings();
  const related = allListings
    .filter((p) => p.id !== product?.id && (p.brand === product?.brand || p.condition === product?.condition))
    .slice(0, 4);

  const addToCart = useShop((s) => s.addToCart);
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-8">
          <div className="grid gap-10 md:grid-cols-2 animate-pulse">
            <div>
              <div className="ink-frame aspect-[4/5] w-full bg-secondary/60" />
              <div className="mt-4 grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="ink-frame aspect-square bg-secondary/60" />
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="h-3 w-1/4 rounded bg-secondary/60" />
              <div className="h-7 w-2/3 rounded bg-secondary/60" />
              <div className="h-5 w-1/4 rounded bg-secondary/60" />
              <div className="mt-6 h-16 rounded bg-secondary/40" />
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
          <h1 className="type-h2">This piece is gone.</h1>
          <p className="type-caption mt-2">
            It may have sold or been delisted. Every listing is one-of-one.
          </p>
          <Link to="/shop" className="ink-tag mt-6 inline-flex hover:bg-secondary">
            Browse the rail
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const inCart = cart.includes(product.id);
  const saved = wishlist.includes(product.id);
  const discount = product.originalPrice > 0
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <nav aria-label="Breadcrumb" className="type-caption mb-6">
          <Link to="/shop" className="underline underline-offset-4">
            Shop
          </Link>{" "}
          / {product.brand} / {product.name}
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          {/* ── Images ── */}
          <div className="space-y-4">
            <div className="ink-frame overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  width={800}
                  height={1000}
                  className="aspect-4/5 w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/5] w-full flex items-center justify-center bg-secondary/20">
                  <span className="type-caption text-muted-foreground">Photo coming soon</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {["Front", "Fabric close-up", product.flaws.length > 0 ? "Flaw close-up" : "Label"].map((lbl) => (
                <figure key={lbl} className="ink-frame overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={`${product.name} — ${lbl.toLowerCase()}`}
                      loading="lazy"
                      width={800}
                      height={1000}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full flex items-center justify-center bg-secondary/20" />
                  )}
                  <figcaption className="type-caption border-t border-foreground px-2 py-1">{lbl}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          {/* ── Details ── */}
          <div>
            <p className="type-eyebrow text-muted-foreground">{product.brand}</p>
            <h1 className="type-h2 mt-2">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ConditionBadge condition={product.condition} withNote />
              <span className="ink-tag border-dashed">Only 1 available</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-accent">{formatPKR(product.price)}</span>
              <span className="type-caption line-through">{formatPKR(product.originalPrice)}</span>
              {discount > 0 && <span className="type-caption">{discount}% below retail</span>}
            </div>

            <p className="mt-6 leading-relaxed">{product.description}</p>

            <dl className="mt-8 grid grid-cols-2 gap-y-3 text-sm">
              <dt className="type-eyebrow text-muted-foreground">Size</dt>
              <dd>{product.size}</dd>
              <dt className="type-eyebrow text-muted-foreground">Fabric</dt>
              <dd>{product.fabric || "—"}</dd>
              <dt className="type-eyebrow text-muted-foreground">Colour</dt>
              <dd>{product.color || "—"}</dd>
              <dt className="type-eyebrow text-muted-foreground">Measured flat</dt>
              <dd>{product.measurements || "—"}</dd>
            </dl>

            <section className="ink-frame mt-8 p-5">
              <h2 className="type-h3">Honest disclosure</h2>
              {product.flaws.length === 0 ? (
                <p className="type-caption mt-2">
                  No flaws found at intake. Checked under daylight and steamed before listing.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {product.flaws.map((f: Flaw) => (
                    <li key={f.label}>
                      <span className="type-eyebrow">{f.label}</span>
                      <span className="block type-caption">{f.note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {product.shoot && (
              <section className="mt-6 border border-dashed border-foreground p-5">
                <p className="type-eyebrow text-muted-foreground">Shop the Shoot</p>
                <h2 className="type-h3 mt-2">
                  {product.shoot.campaign} · {product.shoot.season}
                </h2>
                <p className="mt-2 text-sm leading-relaxed">{product.shoot.blurb}</p>
              </section>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => addToCart(product.id)}
                disabled={inCart}
                className="border border-foreground bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {inCart ? "In your bag" : "Add to bag"}
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={saved}
                className="inline-flex items-center gap-2 border border-foreground px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <Heart className={`size-4 ${saved ? "fill-accent stroke-accent sketch-pop" : ""}`} strokeWidth={1.25} />
                {saved ? "Saved" : "Save for later"}
              </button>
            </div>

            <ul className="type-caption mt-6 space-y-2">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4" strokeWidth={1.25} aria-hidden /> Authenticated in-house before listing
              </li>
              <li className="flex items-center gap-2">
                <Truck className="size-4" strokeWidth={1.25} aria-hidden /> Dispatched within 48 hours, nationwide
              </li>
            </ul>

            {(product.waterSavedL > 0 || product.carbonSavedKg > 0) && (
              <p className="type-caption mt-6">
                Buying this keeps roughly {product.waterSavedL.toLocaleString("en-PK")}L of water and{" "}
                {product.carbonSavedKg}kg of CO₂e out of a new production run.
              </p>
            )}
          </div>
        </div>

        {/* ── Related items ── */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="type-h2">You might also like</h2>
            <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Mobile sticky CTA ── */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-foreground bg-background px-4 py-3 md:hidden">
        <div>
          <p className="text-sm font-semibold text-accent">{formatPKR(product.price)}</p>
          <p className="type-caption">Only 1 available</p>
        </div>
        <button
          type="button"
          onClick={() => addToCart(product.id)}
          disabled={inCart}
          className="border border-foreground bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-50"
        >
          {inCart ? "In your bag" : "Add to bag"}
        </button>
      </div>
    </SiteLayout>
  );
}
