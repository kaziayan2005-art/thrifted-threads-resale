import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { getById } from "@/lib/catalog";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Saved Pieces | Thrifted Threads" },
      { name: "description", content: "Your saved one-of-one pieces — save them for styling ideas and future drops." },
      { property: "og:title", content: "Saved Pieces | Thrifted Threads" },
      { property: "og:description", content: "Your saved pre-loved pieces." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const wishlist = useShop((s) => s.wishlist);
  const items = wishlist.map(getById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Saved"
        title="Your wishlist"
        intro="Saving a piece won't hold it — everything is single-unit. It does teach us what to look for on the next sourcing run."
      />
      <div className="mx-auto max-w-6xl px-4 pb-24">
        {items.length === 0 ? (
          <div className="ink-frame border-dashed p-12 text-center">
            <p className="type-h3">Nothing saved yet.</p>
            <Link to="/shop" className="ink-tag mt-4 inline-flex hover:bg-secondary">
              Find something
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
