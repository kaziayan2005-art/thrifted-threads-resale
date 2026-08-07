import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, TrendingUp, DollarSign, Award, ArrowUpRight, Download, FileText, Heart } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { StatCard, AdminPageHeader, checkAdminAuth } from "../admin";
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

function RevenueHoverCard({
  children,
  totalRevenue,
  orderCount,
  avgOrderValue,
  topCategory,
}: {
  children: React.ReactNode;
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  topCategory: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
            width: "250px",
            background: "#2C1A1A",
            color: "#FFFBFC",
            borderRadius: "10px",
            padding: "14px 16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            zIndex: 100,
            pointerEvents: "none",
            border: "1px solid #7D4757",
            fontSize: "0.78rem",
          }}
        >
          <p style={{ color: "#E8C4C4", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px", fontWeight: 700 }}>
            Revenue Breakdown
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#B09090" }}>Total Sales:</span>
            <span style={{ fontWeight: 700, color: "#FFFBFC" }}>{formatPKR(totalRevenue)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#B09090" }}>Paid Orders:</span>
            <span style={{ fontWeight: 700, color: "#FFFBFC" }}>{orderCount} orders</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#B09090" }}>Avg Order Value:</span>
            <span style={{ fontWeight: 700, color: "#FFFBFC" }}>{formatPKR(avgOrderValue)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#B09090" }}>Top Category:</span>
            <span style={{ fontWeight: 700, color: "#E8C4C4" }}>{topCategory}</span>
          </div>
          {/* Arrow indicator */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #2C1A1A",
            }}
          />
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading } = useDashboardAnalytics();
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");

  // Date Range and Preset Controls
  const [presetPeriod, setPresetPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly" | "custom">("monthly");
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [toDate, setToDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const handlePresetChange = (preset: "daily" | "weekly" | "monthly" | "yearly") => {
    setPresetPeriod(preset);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setToDate(todayStr);

    if (preset === "daily") {
      setFromDate(todayStr);
    } else if (preset === "weekly") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setFromDate(`${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}-${String(past.getDate()).padStart(2, "0")}`);
    } else if (preset === "monthly") {
      setFromDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
    } else if (preset === "yearly") {
      setFromDate(`${now.getFullYear()}-01-01`);
    }
  };

  const tfData = useMemo(() => timeframeData[timeframe], [timeframe]);

  const filteredOrders = useMemo(() => {
    const orders = data?.allPaidOrders ?? [
      { id: "TT-10428", total: 10100, status: "fulfilled", created_at: "2026-07-22T10:00:00Z" },
      { id: "TT-10391", total: 5800, status: "paid", created_at: "2026-07-09T14:30:00Z" },
      { id: "TT-10385", total: 8600, status: "shipped", created_at: "2026-08-01T09:15:00Z" },
    ];

    if (!fromDate && !toDate) return orders;

    return orders.filter((o: any) => {
      const oTime = new Date(o.created_at || Date.now()).getTime();
      const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : 0;
      const toTime = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Infinity;
      return oTime >= fromTime && oTime <= toTime;
    });
  }, [data?.allPaidOrders, fromDate, toDate]);

  const filteredTotalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  }, [filteredOrders]);

  const exportCSV = () => {
    const headers = ["Order ID", "Total Amount (PKR)", "Status", "Date"];
    const rows = filteredOrders.map((o: any) => [
      o.id,
      o.total,
      o.status,
      new Date(o.created_at || Date.now()).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `thrifted_threads_revenue_${fromDate || "all"}_to_${toDate || "present"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const windowPrint = window.open("", "_blank", "width=800,height=600");
    if (!windowPrint) return;

    const rowsHtml = filteredOrders.map((o: any) => `
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
            body { font-family: sans-serif; padding: 24px; color: #2C1A1A; }
            h1 { color: #7D4757; margin-bottom: 6px; }
            .sub { color: #8A6A6A; font-size: 0.9rem; margin-bottom: 20px; }
            .summary-box { background: #F9EEF2; padding: 14px 18px; border-radius: 8px; font-weight: bold; margin-bottom: 20px; border: 1px solid #E8C4C4; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #7D4757; color: white; padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Thrifted Threads — Revenue Report</h1>
          <div class="sub">Date Range: ${fromDate || "All time"} to ${toDate || "Present"} | Generated on: ${new Date().toLocaleString()}</div>
          <div class="summary-box">
            Total Filtered Revenue: PKR ${filteredTotalRevenue.toLocaleString()} (${filteredOrders.length} orders)
          </div>
          <table>
            <thead>
              <tr><th>Order ID</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="4" style="padding: 12px; text-align: center;">No orders found for selected date range.</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-9">
      <AdminPageHeader
        title="Admin Overview"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/admin/love-notes"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#FFFBFC", border: "1.5px solid #E8C4C4",
                padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem",
                fontWeight: 600, color: "#7D4757", textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#7D4757"; e.currentTarget.style.color = "#FFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFBFC"; e.currentTarget.style.color = "#7D4757"; }}
            >
              <Heart size={14} /> Love Notes 💌
            </Link>
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

      {/* Date Range & Presets Filter Bar */}
      <div className="bg-[#FFFBFC] border border-[#E8C4C4] rounded-xl p-4 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7D4757]">Period Presets:</span>
          {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePresetChange(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                presetPeriod === p
                  ? "bg-[#7D4757] text-white shadow-xs"
                  : "bg-[#F9EEF2] text-[#8A6A6A] hover:bg-[#E8C4C4]/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#8A6A6A]">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPresetPeriod("custom"); }}
              className="bg-white border border-[#D9C5BE] text-[#2C1A1A] px-2.5 py-1.5 rounded-md text-xs outline-none text-center cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#8A6A6A]">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPresetPeriod("custom"); }}
              className="bg-white border border-[#D9C5BE] text-[#2C1A1A] px-2.5 py-1.5 rounded-md text-xs outline-none text-center cursor-pointer"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: "#8A6A6A" }}>Loading dashboard analytics…</p>
      ) : (
        <>
          {/* Primary Action Hero Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#7D4757] to-[#5C323E] text-white p-5 rounded-2xl mb-7 shadow-lg">
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
                whiteSpace: "nowrap",
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

          {/* Revenue Detail Hover Card & Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            <RevenueHoverCard
              totalRevenue={data?.totalRevenue ?? filteredTotalRevenue}
              orderCount={data?.allPaidOrders?.length ?? filteredOrders.length}
              avgOrderValue={data?.avgOrderValue ?? (filteredOrders.length ? Math.round(filteredTotalRevenue / filteredOrders.length) : 0)}
              topCategory={data?.topCategory ?? "Outerwear"}
            >
              <div className="bg-[#FFFBFC] rounded-xl p-5 border-1.5 border-[#E8C4C4] shadow-xs cursor-pointer hover:border-[#7D4757] transition-all">
                <p className="text-[0.72rem] tracking-widest uppercase text-[#8A6A6A] mb-1">Total Revenue (Hover)</p>
                <p className="text-2xl font-bold text-[#3B7A4E] font-display">
                  {formatPKR(data?.totalRevenue ?? filteredTotalRevenue)}
                </p>
                <p className="text-[0.7rem] text-[#8A6A6A] mt-1">Hover for instant category & AOV breakdown</p>
              </div>
            </RevenueHoverCard>

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div style={{ background: "#F9EEF244", borderRadius: "10px", padding: "16px", border: "1px solid #E8C4C4" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#3B7A4E" }}>Revenue Trend ({timeframe})</span>
                  <RevenueHoverCard
                    totalRevenue={tfData.revenue.reduce((a, b) => a + b, 0)}
                    orderCount={tfData.revenue.filter(v => v > 0).length}
                    avgOrderValue={Math.round(tfData.revenue.reduce((a, b) => a + b, 0) / Math.max(1, tfData.revenue.filter(v => v > 0).length))}
                    topCategory={data?.topCategory ?? "Outerwear"}
                  >
                    <span className="text-sm font-bold text-[#2C1A1A] cursor-pointer underline decoration-dotted">
                      {formatPKR(tfData.revenue.reduce((a, b) => a + b, 0))}
                    </span>
                  </RevenueHoverCard>
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
