import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Package, Star, Clock, CheckCircle } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { StatCard, AdminPageHeader } from "./_layout";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function useDashboardStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      if (isMockMode) return { published: 20, pendingOrders: 2, pendingReviews: 0, recentOrders: [] };

      const [{ count: published }, { count: pendingOrders }, { count: pendingReviews }, { data: recentOrders }] =
        await Promise.all([
          supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("orders").select("id, status, total, created_at, shipping_address").order("created_at", { ascending: false }).limit(8),
        ]);

      return { published: published ?? 0, pendingOrders: pendingOrders ?? 0, pendingReviews: pendingReviews ?? 0, recentOrders: recentOrders ?? [] };
    },
  });
}

const statusColor: Record<string, string> = {
  pending: "#E8B87A", paid: "#7DA88A", fulfilled: "#7D4757", cancelled: "#C08080",
};

function AdminDashboard() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminPageHeader title="Dashboard" />

      {isLoading ? (
        <p style={{ color: "#8A6A6A" }}>Loading stats…</p>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "36px" }}>
            <StatCard label="Published Listings" value={data?.published ?? 0} color="#7D4757" />
            <StatCard label="Pending Orders" value={data?.pendingOrders ?? 0} color="#E8B87A" />
            <StatCard label="Pending Reviews" value={data?.pendingReviews ?? 0} color="#9B8EC4" />
          </div>

          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "36px" }}>
            {[
              { to: "/admin/listings/new", label: "＋ Add new listing", icon: ShoppingBag, bg: "#7D4757", color: "#fff" },
              { to: "/admin/orders", label: "→ View all orders", icon: Package, bg: "#FFFBFC", color: "#2C1A1A" },
              { to: "/admin/reviews", label: "★ Moderate reviews", icon: Star, bg: "#FFFBFC", color: "#2C1A1A" },
              { to: "/admin/grading", label: "⊘ Edit grading scale", icon: Star, bg: "#FFFBFC", color: "#2C1A1A" },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "16px 20px", borderRadius: "10px",
                background: item.bg, color: item.color,
                border: item.bg === "#FFFBFC" ? "1.5px solid #E8C4C4" : "none",
                textDecoration: "none", fontWeight: 600, fontSize: "0.88rem",
                boxShadow: "0 2px 8px rgba(125,71,87,0.07)",
                transition: "opacity 0.15s",
              }}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Recent orders table */}
          <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0DDE0" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#2C1A1A" }}>Recent Orders</h2>
            </div>
            {!data?.recentOrders?.length ? (
              <p style={{ padding: "24px 20px", color: "#8A6A6A", fontSize: "0.88rem" }}>No orders yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9EEF2" }}>
                    {["Order ID", "Status", "Total", "Date"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A6A", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o: Record<string, unknown>, i: number) => (
                    <tr key={o.id as string} style={{ borderTop: "1px solid #F0DDE0", background: i % 2 === 0 ? "#fff" : "#FDF8F9" }}>
                      <td style={{ padding: "12px 20px", fontSize: "0.82rem", fontWeight: 600, color: "#7D4757" }}>
                        #{(o.id as string).slice(0, 8).toUpperCase()}
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 10px", borderRadius: "999px",
                          background: statusColor[o.status as string] + "22",
                          color: statusColor[o.status as string],
                          fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize",
                        }}>{o.status as string}</span>
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "0.85rem", color: "#2C1A1A" }}>PKR {(o.total as number).toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", fontSize: "0.82rem", color: "#8A6A6A" }}>
                        {new Date(o.created_at as string).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
