import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, ShieldCheck, Truck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ConditionBadge } from "@/components/ConditionBadge";
import { ProductCard } from "@/components/ProductCard";
import { formatPKR, getProduct, products } from "@/lib/catalog";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Piece unavailable | Thrifted Threads" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — ${product.brand} | Thrifted Threads`;
    const description = `${product.condition}. ${product.description} Only one available at ${formatPKR(product.price)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const addToCart = useShop((s) => s.addToCart);
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const inCart = cart.includes(product.id);
  const saved = wishlist.includes(product.id);
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <nav aria-label="Breadcrumb" className="type-caption mb-6">
          <Link to="/shop" className="underline underline-offset-4">
            Shop
          </Link>{" "}
          / {product.category} / {product.name}
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <div className="ink-frame overflow-hidden">
              <img
                src={product.image}
                alt={product.imageAlt}
                width={800}
                height={1000}
                className="aspect-4/5 w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {["Front", "Fabric close-up", product.flaws.length > 0 ? "Flaw close-up" : "Label"].map((label) => (
                <figure key={label} className="ink-frame overflow-hidden">
                  <img
                    src={product.image}
                    alt={`${product.name} — ${label.toLowerCase()}`}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="type-caption border-t border-foreground px-2 py-1">{label}</figcaption>
                </figure>
              ))}
            </div>
          </div>

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
              <span className="type-caption">{discount}% below retail</span>
            </div>

            <p className="mt-6 leading-relaxed">{product.description}</p>

            <dl className="mt-8 grid grid-cols-2 gap-y-3 text-sm">
              <dt className="type-eyebrow text-muted-foreground">Size</dt>
              <dd>{product.size}</dd>
              <dt className="type-eyebrow text-muted-foreground">Fabric</dt>
              <dd>{product.fabric}</dd>
              <dt className="type-eyebrow text-muted-foreground">Colour</dt>
              <dd>{product.color}</dd>
              <dt className="type-eyebrow text-muted-foreground">Measured flat</dt>
              <dd>{product.measurements}</dd>
            </dl>

            <section className="ink-frame mt-8 p-5">
              <h2 className="type-h3">Honest disclosure</h2>
              {product.flaws.length === 0 ? (
                <p className="type-caption mt-2">
                  No flaws found at intake. Checked under daylight and steamed before listing.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {product.flaws.map((f) => (
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

            <p className="type-caption mt-6">
              Buying this keeps roughly {product.waterSavedL.toLocaleString("en-PK")}L of water and{" "}
              {product.carbonSavedKg}kg of CO₂e out of a new production run.
            </p>
          </div>
        </div>

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
