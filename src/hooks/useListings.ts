import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import { products as mockProducts, getProduct as getMockProduct } from "@/lib/catalog";
import type { Product } from "@/types";
import type { Listing, ListingPhoto } from "@/lib/database.types";

// ─── Shape converter: DB Listing → frontend Product ───────────
function toProduct(l: Listing, photos: ListingPhoto[] = []): Product {
  const primaryPhoto = photos.find(p => p.sort_order === 0) ?? photos[0];
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
    category: "",           // no categories in this build
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

// ─── useListings ─────────────────────────────────────────────
// All published listings with optional filters.
interface ListingFilters {
  sizes?: string[];
  brands?: string[];
  conditions?: string[];
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "condition";
  cursor?: string;        // ISO date string for cursor pagination
}

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: async (): Promise<Product[]> => {
      if (isMockMode) {
        // Fall back to mock data
        let list = mockProducts.filter(p => p.status === "published");
        if (filters.sizes?.length) list = list.filter(p => filters.sizes!.includes(p.size));
        if (filters.brands?.length) list = list.filter(p => filters.brands!.includes(p.brand));
        if (filters.conditions?.length) list = list.filter(p => filters.conditions!.includes(p.condition));
        if (filters.maxPrice) list = list.filter(p => p.price <= filters.maxPrice!);
        const mockConditionRank = new Map<string, number>([
          ["New with Tags", 0], ["Photoshoot Sample", 1], ["Worn Once", 2], ["Gently Used", 3],
        ]);
        if (filters.sort === "price-asc")  list = [...list].sort((a, b) => a.price - b.price);
        if (filters.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
        if (filters.sort === "condition")  list = [...list].sort((a, b) => (mockConditionRank.get(a.condition) ?? 9) - (mockConditionRank.get(b.condition) ?? 9));
        return list;
      }

      let query = supabase
        .from("listings")
        .select("*, listing_photos(id, public_url, alt_text, sort_order, storage_path, listing_id, created_at)")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(40);

      if (filters.sizes?.length) query = query.in("size", filters.sizes);
      if (filters.brands?.length) query = query.in("brand", filters.brands);
      if (filters.conditions?.length) query = query.in("condition_grade", filters.conditions);
      if (filters.maxPrice) query = query.lte("resale_price", filters.maxPrice);
      if (filters.cursor) query = query.lt("created_at", filters.cursor);

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data ?? []).map(l => {
        const { listing_photos, ...listing } = l as Listing & { listing_photos: ListingPhoto[] };
        return toProduct(listing, listing_photos ?? []);
      });

      // Client-side sort (all 20–40 items in memory — cheap)
      const conditionRank = new Map<string, number>([
        ["New with Tags", 0], ["Photoshoot Sample", 1], ["Worn Once", 2], ["Gently Used", 3],
      ]);
      if (filters.sort === "price-asc")  mapped.sort((a, b) => a.price - b.price);
      if (filters.sort === "price-desc") mapped.sort((a, b) => b.price - a.price);
      if (filters.sort === "condition")  mapped.sort((a, b) => (conditionRank.get(a.condition) ?? 9) - (conditionRank.get(b.condition) ?? 9));

      return mapped;
    },
    staleTime: 1000 * 60 * 2, // 2 min cache
  });
}

// ─── useListing (single by slug) ─────────────────────────────
export function useListing(slug: string) {
  return useQuery({
    queryKey: ["listing", slug],
    queryFn: async (): Promise<Product | null> => {
      if (isMockMode) return getMockProduct(slug) ?? null;

      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_photos(id, public_url, alt_text, sort_order, storage_path, listing_id, created_at)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) return null;
      const { listing_photos, ...listing } = data as Listing & { listing_photos: ListingPhoto[] };
      return toProduct(listing, listing_photos ?? []);
    },
    enabled: !!slug,
  });
}

// ─── Admin: all listings (any status) ────────────────────────
export function useAdminListings(status?: string) {
  return useQuery({
    queryKey: ["admin-listings", status],
    queryFn: async () => {
      let query = supabase
        .from("listings")
        .select("*, listing_photos(id, public_url, alt_text, sort_order, storage_path, listing_id, created_at)")
        .order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isMockMode,
  });
}

// ─── Admin: create listing ────────────────────────────────────
export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      slug: string; title: string; description: string; brand: string;
      size: string; color: string; occasion: string; condition_grade: string;
      flaw_notes: object[]; fabric_details: string; measurements: string;
      original_price: number; resale_price: number;
      water_saved_l: number; carbon_saved_kg: number;
      shoot_story: object | null; best_seller: boolean;
      status: "draft" | "published";
    }) => {
      const { data, error } = await supabase.from("listings").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-listings"] }),
  });
}

// ─── Admin: delete listing ────────────────────────────────────
export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // First delete associated photos from listing_photos table
      await supabase.from("listing_photos").delete().eq("listing_id", id);
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// ─── Admin: duplicate listing ─────────────────────────────────
export function useDuplicateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch source listing
      const { data: source, error: fetchErr } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchErr || !source) throw fetchErr ?? new Error("Source listing not found");

      const newSlug = `${source.slug}-copy-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTitle = `${source.title} (Copy)`;

      const { id: _, created_at: __, updated_at: ___, ...insertPayload } = source;
      const { data: newListing, error: insertErr } = await supabase
        .from("listings")
        .insert({
          ...insertPayload,
          title: newTitle,
          slug: newSlug,
          status: "draft",
        })
        .select()
        .single();
      if (insertErr) throw insertErr;
      return newListing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// ─── Admin: update listing ────────────────────────────────────
export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; [key: string]: unknown }) => {
      const { error } = await supabase.from("listings").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// ─── Admin: upload listing photo ──────────────────────────────
export async function uploadListingPhoto(
  listingId: string,
  file: File,
  altText: string,
  sortOrder: number
): Promise<ListingPhoto> {
  const ext = file.name.split(".").pop();
  const path = `listings/${listingId}/${Date.now()}-${sortOrder}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("listing-photos")
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("listing-photos")
    .getPublicUrl(path);

  const { data, error } = await supabase
    .from("listing_photos")
    .insert({ listing_id: listingId, storage_path: path, public_url: publicUrl, alt_text: altText, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}
