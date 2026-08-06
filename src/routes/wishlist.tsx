import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/store/shop";
import { getById } from "@/lib/catalog";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { isMockMode } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";

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
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // ── Real Supabase path ──────────────────────────────────────
  const { data: supabaseItems = [], isLoading } = useWishlist();

  // ── Mock/local-state fallback (used when not logged in or mock mode) ──
  const localWishlist = useShop((s) => s.wishlist);
  const localItems = localWishlist.map(getById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  // If logged in and Supabase is connected, use server wishlist.
  // Otherwise fall back to local Zustand state (works in mock mode or as a guest preview).
  const useServerData = !!user && !isMockMode;
  const items = useServerData ? supabaseItems : localItems;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Saved"
        title="Your wishlist"
        intro="Saving a piece won't hold it — everything is single-unit. It does teach us what to look for on the next sourcing run."
      />
      <div className="mx-auto max-w-6xl px-4 pb-24">
        {isLoading && useServerData ? (
          // Skeleton loader — same style as product grid
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] w-full rounded bg-secondary/60" />
                <div className="mt-3 h-3 w-3/4 rounded bg-secondary/60" />
                <div className="mt-2 h-3 w-1/2 rounded bg-secondary/40" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ink-frame border-dashed p-12 text-center">
            <p className="type-h3">Nothing saved yet.</p>
            {!user && !isMockMode ? (
              <div className="mt-4 space-y-3">
                <p className="type-caption text-muted-foreground">
                  Sign in to sync your wishlist across devices.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                    className="border border-foreground px-5 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                    className="border border-foreground bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    Create account
                  </button>
                </div>
              </div>
            ) : null}
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
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
        hint="Sign in to sync your wishlist across all your devices."
      />
    </SiteLayout>
  );
}
