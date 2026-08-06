import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Package, Star, TrendingUp, DollarSign, Award, ArrowUpRight } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { StatCard, AdminPageHeader } from "./_layout";
import { formatPKR } from "@/lib/catalog";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["admin-dashboard-analytics"],
    queryFn: async () => {
      if (isMockMode) {
        return {
          published: 20,
          pendingOrders: 2,
          pendingReviews: 0,
          totalRevenue: 24500,
          avgOrderValue: 4900,
          topCategory: "Outerwear",
          recentOrders: [],
        };
      }

      const [
        { count: published },
        { count: pendingOrders },
        { count: pendingReviews },
        { data: allOrders },
        { data: recentOrders },
        { data: soldItems },
      ] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("total, status").in("status", ["fulfilled", "paid", "shipped", "packed", "confirmed"]),
        supabase
          .from("orders")
          .select("id, status, total, created_at, shipping_address, order_items(id)")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("listings").select("category").eq("status", "sold"),
      ]);

      const paidOrders = allOrders ?? [];
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;

      // Calculate top category from sold items
      const categoryCounts: Record<string, number> = {};
      (soldItems ?? []).forEach((item) => {
        if (item.category) {
          categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        }
      });

      let topCategory = "Tops";
      let maxCount = 0;
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topCategory = cat;
        }
      });

      return {
        published: published ?? 0,
        pendingOrders: pendingOrders ?? 0,
        pendingReviews: pendingReviews ?? 0,
        totalRevenue,
        avgOrderValue,
        topCategory,
        recentOrders: recentOrders ?? [],
      };
    },
  });
}

const statusColor: Record<string, string> = {
  pending: "#E8B87A",
  confirmed: "#9B8EC4",
  packed: "#6BA4B8",
  shipped: "#7DA88A",
  fulfilled: "#2E6B40",
  paid: "#7DA88A",
  cancelled: "#C08080",
};

function AdminDashboard() {
  const { data, isLoading } = useDashboardAnalytics();

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminPageHeader title="Dashboard Overview" />

      {isLoading ? (
        <p style={{ color: "#8A6A6A" }}>Loading dashboard analytics…</p>
      ) : (
        <>
          {/* Primary Action Hero Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #7D4757 0%, #5C323E 100%)",
              color: "#FFFBFC",
              padding: "20px 24px",
              borderRadius: "14px",
              marginBottom: "28px",
              boxShadow: "0 6px 20px rgba(125,71,87,0.22)",
            }}
          >
            <div>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#E8C4C4", margin: 0 }}>
                Inventory Management
              </p>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "4px 0 0" }}>
                Ready to add a new pre-loved piece?
              </h2>
            </div>
            <Link
              to="/admin/listings/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#FFFBFC",
                color: "#7D4757",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.88rem",
                textDecoration: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              }}
            >
              <ShoppingBag size={16} /> Add New Listing
            </Link>
          </div>

          {/* Stat Cards - Clickable Routing */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
            <StatCard
              label="Published Listings"
              value={data?.published ?? 0}
              color="#7D4757"
              to="/admin/listings"
            />
            <StatCard
              label="Pending Orders"
              value={data?.pendingOrders ?? 0}
              color="#C8882A"
              to="/admin/orders"
              search={{ status: "pending" }}
            />
            <StatCard
              label="Pending Reviews"
              value={data?.pendingReviews ?? 0}
              color="#6B5EA4"
              to="/admin/reviews"
            />
          </div>

          {/* Lightweight Analytics Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                background: "#FFFBFC",
                borderRadius: "12px",
                padding: "18px 20px",
                border: "1.5px solid #E8C4C4",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3B7A4E", marginBottom: "6px" }}>
                <DollarSign size={16} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A6A6A" }}>
                  Total Revenue
                </span>
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2C1A1A", margin: 0, fontFamily: "'Kalam', cursive" }}>
                {formatPKR(data?.totalRevenue ?? 0)}
              </p>
            </div>

            <div
              style={{
                background: "#FFFBFC",
                borderRadius: "12px",
                padding: "18px 20px",
                border: "1.5px solid #E8C4C4",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7D4757", marginBottom: "6px" }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A6A6A" }}>
                  Avg Order Value (AOV)
                </span>
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2C1A1A", margin: 0, fontFamily: "'Kalam', cursive" }}>
                {formatPKR(data?.avgOrderValue ?? 0)}
              </p>
            </div>

            <div
              style={{
                background: "#FFFBFC",
                borderRadius: "12px",
                padding: "18px 20px",
                border: "1.5px solid #E8C4C4",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6B5EA4", marginBottom: "6px" }}>
                <Award size={16} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A6A6A" }}>
                  Top Category
                </span>
              </div>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#2C1A1A", margin: 0, fontFamily: "'Kalam', cursive" }}>
                {data?.topCategory ?? "Tops"}
              </p>
            </div>
          </div>

          {/* Recent Orders Panel */}
          <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #F0DDE0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F9EEF2",
              }}
            >
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2C1A1A", margin: 0 }}>Recent Customer Orders</h2>
              <Link
                to="/admin/orders"
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#7D4757",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View all orders <ArrowUpRight size={14} />
              </Link>
            </div>
            {!data?.recentOrders?.length ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <Package size={32} color="#8A6A6A" style={{ margin: "0 auto 8px" }} strokeWidth={1.25} />
                <p style={{ color: "#2C1A1A", fontWeight: 600, fontSize: "0.92rem", margin: 0 }}>No orders placed yet</p>
                <p style={{ color: "#8A6A6A", fontSize: "0.82rem", marginTop: "4px" }}>
                  Orders placed by buyers will show up here automatically.
                </p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FFFBFC" }}>
                    {["Order ID", "Customer", "Items", "Status", "Total", "Date"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 20px",
                          fontSize: "0.72rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#8A6A6A",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o: Record<string, unknown>, i: number) => {
                    const shipping = (o.shipping_address as { name?: string; city?: string }) ?? {};
                    const items = (o.order_items ?? []) as Array<unknown>;
                    return (
                      <tr
                        key={o.id as string}
                        style={{ borderTop: "1px solid #F0DDE0", background: i % 2 === 0 ? "#fff" : "#FDF8F9" }}
                      >
                        <td style={{ padding: "12px 20px", fontSize: "0.82rem", fontWeight: 700, color: "#7D4757" }}>
                          #{(o.id as string).slice(0, 8).toUpperCase()}
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "0.85rem", color: "#2C1A1A", fontWeight: 600 }}>
                          {shipping.name || "Guest"}
                          {shipping.city ? <span style={{ color: "#8A6A6A", fontWeight: 400, fontSize: "0.75rem", display: "block" }}>{shipping.city}</span> : null}
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "0.82rem", color: "#5A3A3A" }}>
                          {items.length} {items.length === 1 ? "item" : "items"}
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 10px",
                              borderRadius: "999px",
                              background: (statusColor[o.status as string] || "#8A6A6A") + "22",
                              color: statusColor[o.status as string] || "#8A6A6A",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          >
                            {o.status as string}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "0.85rem", fontWeight: 600, color: "#2C1A1A" }}>
                          {formatPKR(o.total as number)}
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "0.82rem", color: "#8A6A6A" }}>
                          {new Date(o.created_at as string).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
