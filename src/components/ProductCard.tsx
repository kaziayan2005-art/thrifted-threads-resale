import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { formatPKR } from "@/lib/catalog";
import { ConditionBadge } from "./ConditionBadge";
import { useShop } from "@/store/shop";

export function ProductCard({ product }: { product: Product }) {
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const saved = wishlist.includes(product.id);

  return (
    <article className="group relative">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        <div className="ink-frame overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.imageAlt}
              loading="lazy"
              width={800}
              height={1000}
              className="aspect-4/5 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="aspect-[4/5] w-full flex flex-col items-center justify-center gap-2"
              style={{ background: "linear-gradient(160deg, #F5E8EE 0%, #EEE8F5 100%)" }}
            >
              <span style={{ fontFamily: "'Kalam', cursive", fontSize: "1.2rem", color: "#7D4757", opacity: 0.5 }}>
                TT
              </span>
              <span className="type-caption text-center px-3" style={{ color: "#8A6A6A", fontSize: "0.65rem" }}>
                {product.name}
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <p className="type-eyebrow text-muted-foreground">{product.brand}</p>
          <h3 className="font-sans text-sm font-medium leading-snug">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-accent">{formatPKR(product.price)}</span>
            <span className="type-caption line-through">{formatPKR(product.originalPrice)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ConditionBadge condition={product.condition} />
            <span className="ink-tag border-dashed">Only 1</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        className="absolute right-2 top-2 grid size-9 place-items-center border border-foreground bg-background/90 transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <Heart
          className={`size-4 ${saved ? "fill-accent stroke-accent sketch-pop" : "stroke-foreground"}`}
          strokeWidth={1.25}
        />
      </button>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="ink-frame aspect-4/5 w-full bg-secondary" />
      <div className="mt-3 space-y-2">
        <div className="h-2 w-1/3 bg-secondary" />
        <div className="h-3 w-3/4 bg-secondary" />
        <div className="h-3 w-1/2 bg-secondary" />
      </div>
    </div>
  );
}
