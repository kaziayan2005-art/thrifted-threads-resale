import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import type { Product } from "@/types";
import type { Listing, ListingPhoto } from "@/lib/database.types";

// Converts DB listing row → frontend Product (mirrors useListings.ts)
function toProduct(l: Listing, photos: ListingPhoto[] = []): Product {
  const primaryPhoto = photos.find((p) => p.sort_order === 0) ?? photos[0];
  const flaws = Array.isArray(l.flaw_notes)
    ? (l.flaw_notes as Array<{ label: string; note: string }>)
    : [];
  const shoot = l.shoot_story
    ? (l.shoot_story as { campaign: string; season: string; blurb: string })
    : null;

  return {
    id: l.id,
    slug: l.slug,
    name: l.title,
    brand: l.brand,
    category: "",
    size: l.size,
    color: l.color,
    occasion: l.occasion as Product["occasion"],
    condition: l.condition_grade as Product["condition"],
    originalPrice: l.original_price,
    price: l.resale_price,
    fabric: l.fabric_details,
    measurements: l.measurements,
    description: l.description,
    image: primaryPhoto?.public_url ?? "",
    imageAlt: primaryPhoto?.alt_text ?? l.title,
    flaws,
    shoot,
    status: l.status as Product["status"],
    addedAt: l.created_at,
    bestSeller: l.best_seller,
    waterSavedL: l.water_saved_l,
    carbonSavedKg: l.carbon_saved_kg,
  };
}

// ─── useWishlist ──────────────────────────────────────────────
// Returns the authenticated buyer's wishlist as Product objects.
// Falls back to empty array when not logged in or in mock mode.
export function useWishlist() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async (): Promise<Product[]> => {
      if (isMockMode || !user) return [];

      const { data, error } = await supabase
        .from("wishlists")
        .select(
          "listing_id, listings(*, listing_photos(id, public_url, alt_text, sort_order, storage_path, listing_id, created_at))"
        )
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).flatMap((row) => {
        const listing = row.listings as (Listing & { listing_photos: ListingPhoto[] }) | null;
        if (!listing) return [];
        const { listing_photos, ...l } = listing;
        return [toProduct(l, listing_photos ?? [])];
      });
    },
    enabled: !!user && !isMockMode,
  });
}

// ─── useWishlistIds ───────────────────────────────────────────
// Returns a Set of listing IDs in the buyer's wishlist — cheap check for "is this wishlisted?"
export function useWishlistIds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist-ids", user?.id],
    queryFn: async (): Promise<Set<string>> => {
      if (isMockMode || !user) return new Set();

      const { data, error } = await supabase
        .from("wishlists")
        .select("listing_id")
        .eq("buyer_id", user.id);

      if (error) throw error;
      return new Set((data ?? []).map((r) => r.listing_id));
    },
    enabled: !!user && !isMockMode,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── useToggleWishlist ────────────────────────────────────────
// Adds or removes a listing from the authenticated buyer's wishlist.
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ listingId, isWishlisted }: { listingId: string; isWishlisted: boolean }) => {
      if (!user) throw new Error("Must be signed in to save items.");

      if (isWishlisted) {
        // Remove
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("buyer_id", user.id)
          .eq("listing_id", listingId);
        if (error) throw error;
      } else {
        // Add
        const { error } = await supabase
          .from("wishlists")
          .insert({ buyer_id: user.id, listing_id: listingId });
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids", user?.id] });
    },
  });
}
