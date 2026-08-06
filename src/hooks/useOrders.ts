import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import type { Order, OrderItem } from "@/lib/database.types";

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { listing_snapshot: { title: string; slug: string; resale_price: number } })[];
}

// ─── Buyer: my orders ─────────────────────────────────────────
export function useOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async (): Promise<OrderWithItems[]> => {
      if (isMockMode || !user) return mockOrders as OrderWithItems[];

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as OrderWithItems[];
    },
    enabled: !!user || isMockMode,
  });
}

// ─── Admin: all orders ────────────────────────────────────────
export function useAdminOrders(status?: string) {
  return useQuery({
    queryKey: ["admin-orders", status],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*, order_items(*), profiles(name, phone)")
        .order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isMockMode,
  });
}

// ─── Admin: update order status ───────────────────────────────
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order["status"] }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;

      // If marking fulfilled, trigger WhatsApp/email notification via Edge Function
      if (status === "fulfilled") {
        await supabase.functions.invoke("send-order-confirmation", {
          body: { orderId, event: "fulfilled" },
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
}

// ─── Create Stripe checkout session ──────────────────────────
// Called when buyer clicks "Place order" on checkout page.
// Returns Stripe hosted checkout URL (100% advance — no COD).
export async function createCheckoutSession(
  listingIds: string[],
  shippingAddress: {
    name: string; phone: string; email: string;
    address: string; city: string; postal?: string;
  }
): Promise<{ url: string } | { error: string }> {
  if (isMockMode) {
    // Stub for demo — simulates success
    return { url: "/checkout/success?session_id=mock_session_demo" };
  }

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { listingIds, shippingAddress },
  });

  if (error) return { error: error.message };
  return data as { url: string };
}

// ─── Mock order data (used when Supabase not connected) ──────
const mockOrders: Partial<OrderWithItems>[] = [
  {
    id: "TT-10428",
    status: "fulfilled",
    total: 10100,
    payment_provider: "stripe",
    created_at: "2026-07-22T10:00:00Z",
    order_items: [
      { listing_snapshot: { title: "Ivory Silk Camp Shirt", slug: "ivory-silk-camp-shirt", resale_price: 4200 } } as OrderItem & { listing_snapshot: { title: string; slug: string; resale_price: number } },
      { listing_snapshot: { title: "Olive Slip Dress",      slug: "olive-slip-dress",      resale_price: 3900 } } as OrderItem & { listing_snapshot: { title: string; slug: string; resale_price: number } },
    ],
  },
  {
    id: "TT-10391",
    status: "paid",
    total: 5800,
    payment_provider: "stripe",
    created_at: "2026-07-09T14:30:00Z",
    order_items: [
      { listing_snapshot: { title: "Ink Black Blazer", slug: "ink-black-blazer", resale_price: 5800 } } as OrderItem & { listing_snapshot: { title: string; slug: string; resale_price: number } },
    ],
  },
];
