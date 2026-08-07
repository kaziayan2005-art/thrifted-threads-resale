import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, TrendingUp, DollarSign, Award, ArrowUpRight, Download, FileText } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { StatCard, AdminPageHeader, checkAdminAuth } from "./_layout";
import { formatPKR } from "@/lib/catalog";

export const Route = createFileRoute("/admin/")({
  beforeLoad: checkAdminAuth,
  component: AdminDashboard,
});

type Timeframe = "daily" | "weekly" | "monthly" | "yearly";

const timeframeData: Record<Timeframe, { labels: string[]; revenue: number[]; reviews: number[] }> = {
  daily: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    revenue: [2400, 3800, 1900, 5200, 6800, 8400, 7100],
    reviews: [1, 0, 2, 1, 3, 4, 2],
  },
  weekly: {
    labels: ["W1", "W2", "W3", "W4"],
    revenue: [18500, 24200, 19800, 28900],
    reviews: [5, 8, 4, 9],
  },
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    revenue: [42000, 58000, 64000, 71000, 85000, 92000, 104000],
    reviews: [12, 18, 15, 22, 28, 31, 35],
  },
  yearly: {
    labels: ["2023", "2024", "2025", "2026"],
    revenue: [320000, 540000, 780000, 950000],
    reviews: [85, 140, 210, 280],
  },
};

function Sparkline({ data, color = "#7D4757", height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 200;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      {data.map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 8) - 4;
        return <circle key={idx} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

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
        supabase.from("orders").select("id, total, status, created_at, shipping_address").in("status", ["fulfilled", "paid", "shipped", "packed", "confirmed"]),
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
        allPaidOrders: paidOrders,
      };
    },
  });
}

function AdminDashboard() {
  const { data, isLoading } = useDashboardAnalytics();
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");

  const tfData = useMemo(() => timeframeData[timeframe], [timeframe]);

  const exportCSV = () => {
    const orders = data?.allPaidOrders ?? [
      { id: "TT-10428", total: 10100, status: "fulfilled", created_at: "2026-07-22T10:00:00Z" },
      { id: "TT-10391", total: 5800, status: "paid", created_at: "2026-07-09T14:30:00Z" },
    ];

    const headers = ["Order ID", "Total Amount (PKR)", "Status", "Date"];
    const rows = orders.map((o: any) => [
      o.id,
      o.total,
      o.status,
      new Date(o.created_at || Date.now()).toLocaleDateString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `thrifted_threads_revenue_${timeframe}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const windowPrint = window.open("", "", "width=800,height=600");
    if (!windowPrint) return;

    const orders = data?.allPaidOrders ?? [
      { id: "TT-10428", total: 10100, status: "fulfilled", created_at: "2026-07-22T10:00:00Z" },
      { id: "TT-10391", total: 5800, status: "paid", created_at: "2026-07-09T14:30:00Z" },
    ];

    const rowsHtml = orders.map((o: any) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${o.id}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">PKR ${o.total?.toLocaleString()}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${o.status}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(o.created_at || Date.now()).toLocaleDateString()}</td>
      </tr>
    `).join("");

    windowPrint.document.write(`
      <html>
        <head>
          <title>Revenue Report - Thrifted Threads</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #2C1A1A; }
            h1 { color: #7D4757; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #7D4757; color: white; padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Thrifted Threads — Revenue Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Revenue: PKR ${(data?.totalRevenue ?? 24500).toLocaleString()}</p>
          <table>
            <thead>
              <tr><th>Order ID</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    windowPrint.print();
    windowPrint.close();
  };

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminPageHeader
        title="Admin Overview"
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={exportCSV}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#FFFBFC", border: "1.5px solid #E8C4C4",
                padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem",
                fontWeight: 600, color: "#7D4757", cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#7D4757"; e.currentTarget.style.color = "#FFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFBFC"; e.currentTarget.style.color = "#7D4757"; }}
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={exportPDF}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#7D4757", border: "none",
                padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem",
                fontWeight: 600, color: "#FFF", cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <FileText size={14} /> Export PDF
            </button>
          </div>
        }
      />

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
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)";
                e.currentTarget.style.backgroundColor = "#FFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.12)";
                e.currentTarget.style.backgroundColor = "#FFFBFC";
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

          {/* Sparkline & Analytics Section with Timeframe Filter */}
          <div style={{ background: "#FFFBFC", borderRadius: "14px", border: "1.5px solid #E8C4C4", padding: "20px 24px", marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#2C1A1A", margin: 0 }}>Analytics & Trend Performance</h3>
                <p style={{ fontSize: "0.8rem", color: "#8A6A6A", margin: "2px 0 0" }}>Interactive sparkline trend views broken down by timeframe</p>
              </div>
              <div style={{ display: "flex", gap: "6px", background: "#F9EEF2", padding: "4px", borderRadius: "8px" }}>
                {(["daily", "weekly", "monthly", "yearly"] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    style={{
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      background: timeframe === tf ? "#7D4757" : "transparent",
                      color: timeframe === tf ? "#FFF" : "#8A6A6A",
                      transition: "all 0.15s",
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              <div style={{ background: "#F9EEF244", borderRadius: "10px", padding: "16px", border: "1px solid #E8C4C4" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#3B7A4E" }}>Revenue Trend ({timeframe})</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2C1A1A" }}>{formatPKR(tfData.revenue.reduce((a, b) => a + b, 0))}</span>
                </div>
                <Sparkline data={tfData.revenue} color="#3B7A4E" height={50} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.7rem", color: "#8A6A6A" }}>
                  {tfData.labels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
              </div>

              <div style={{ background: "#F9EEF244", borderRadius: "10px", padding: "16px", border: "1px solid #E8C4C4" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#6B5EA4" }}>Reviews & Engagement ({timeframe})</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2C1A1A" }}>{tfData.reviews.reduce((a, b) => a + b, 0)} Reviews</span>
                </div>
                <Sparkline data={tfData.reviews} color="#6B5EA4" height={50} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.7rem", color: "#8A6A6A" }}>
                  {tfData.labels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
              </div>
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
                  transition: "all 0.15s ease",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(125,71,87,0.1)";
                  e.currentTarget.style.color = "#5C323E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#7D4757";
                }}
              >
                View all orders <ArrowUpRight size={14} />
              </Link>
            </div>
            {!data?.recentOrders?.length ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "0.88rem", color: "#8A6A6A", margin: 0 }}>No orders placed yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FFFBFC" }}>
                      {["Order ID", "Customer", "City", "Total", "Status", "Date"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 20px",
                            fontSize: "0.72rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#8A6A6A",
                            borderBottom: "1px solid #F0DDE0",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order: any) => {
                      const addr = order.shipping_address as any;
                      const statusColor =
                        order.status === "fulfilled"
                          ? "#3B7A4E"
                          : order.status === "pending"
                          ? "#C8882A"
                          : "#6B5EA4";
                      return (
                        <tr key={order.id} style={{ borderBottom: "1px solid #F9EEF2" }}>
                          <td style={{ padding: "14px 20px", fontSize: "0.85rem", fontWeight: 700, color: "#2C1A1A" }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: "0.85rem", color: "#2C1A1A" }}>
                            {addr?.name || "Guest Customer"}
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: "0.85rem", color: "#8A6A6A" }}>
                            {addr?.city || "—"}
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: "0.85rem", fontWeight: 600, color: "#7D4757" }}>
                            {formatPKR(order.total || 0)}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: "999px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: statusColor,
                                backgroundColor: `${statusColor}18`,
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: "0.82rem", color: "#8A6A6A" }}>
                            {new Date(order.created_at).toLocaleDateString("en-PK", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
