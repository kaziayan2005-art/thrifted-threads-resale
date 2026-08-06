import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package2, Truck, XCircle } from "lucide-react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { AdminBreadcrumb, AdminPageHeader } from "./_layout";
import { formatPKR } from "@/lib/catalog";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#E8B87A22", color: "#C8882A" },
  paid:      { bg: "#9B8EC422", color: "#6B5EA4" },
  fulfilled: { bg: "#7DA88A22", color: "#7DA88A" },
  cancelled: { bg: "#C0808022", color: "#C08080" },
};

function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: orders = [], isLoading } = useAdminOrders(statusFilter || undefined);
  const updateStatus = useUpdateOrderStatus();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const changeStatus = async (orderId: string, status: "fulfilled" | "cancelled") => {
    setLoadingId(orderId);
    try { await updateStatus.mutateAsync({ orderId, status }); }
    catch (e) { alert((e as Error).message); }
    finally { setLoadingId(null); }
  };

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminBreadcrumb items={[{ label: "Orders" }]} />
      <AdminPageHeader title="Orders" />

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["", "pending", "paid", "fulfilled", "cancelled"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "6px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "1.5px solid",
            borderColor: statusFilter === s ? "#7D4757" : "#E8C4C4",
            background: statusFilter === s ? "#7D475714" : "#FFFBFC",
            color: statusFilter === s ? "#7D4757" : "#8A6A6A",
          }}>
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: "#8A6A6A" }}>Loading orders…</p>
      ) : !orders.length ? (
        <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "40px", textAlign: "center", color: "#8A6A6A" }}>
          No orders found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {orders.map((o: Record<string, unknown>) => {
            const shipping = o.shipping_address as { name: string; phone: string; email: string; city: string; address: string } | null;
            const items = (o.order_items ?? []) as Array<Record<string, unknown>>;
            const st = statusColors[o.status as string] ?? statusColors.pending;
            const isLoading = loadingId === o.id;

            return (
              <div key={o.id as string} style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#F9EEF2", borderBottom: "1px solid #F0DDE0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: 700, color: "#7D4757", fontSize: "0.88rem" }}>
                      #{(o.id as string).slice(0, 8).toUpperCase()}
                    </span>
                    <span style={{ padding: "2px 10px", borderRadius: "999px", background: st.bg, color: st.color, fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>
                      {o.status as string}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#8A6A6A" }}>
                      {new Date(o.created_at as string).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#2C1A1A" }}>
                    {formatPKR(o.total as number)}
                  </span>
                </div>

                {/* Body */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", padding: "0" }}>
                  {/* Buyer info */}
                  <div style={{ padding: "16px 20px", borderRight: "1px solid #F0DDE0" }}>
                    <p style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A6A", marginBottom: "8px" }}>Buyer</p>
                    <p style={{ fontWeight: 600, color: "#2C1A1A", fontSize: "0.88rem" }}>{shipping?.name ?? "Guest"}</p>
                    {shipping?.phone && <p style={{ color: "#5A3A3A", fontSize: "0.82rem" }}>{shipping.phone}</p>}
                    {shipping?.email && <p style={{ color: "#5A3A3A", fontSize: "0.82rem" }}>{shipping.email}</p>}
                    {shipping?.address && <p style={{ color: "#8A6A6A", fontSize: "0.78rem", marginTop: "4px" }}>{shipping.address}, {shipping.city}</p>}
                  </div>

                  {/* Items */}
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A6A", marginBottom: "8px" }}>Items</p>
                    {items.map((item, i) => {
                      const snap = item.listing_snapshot as { title: string; slug: string } | null;
                      return (
                        <p key={i} style={{ fontSize: "0.85rem", color: "#2C1A1A", marginBottom: "4px" }}>
                          · {snap?.title ?? "Item"} — PKR {(item.price_at_purchase as number).toLocaleString()}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                {(o.status === "paid" || o.status === "pending") && (
                  <div style={{ padding: "12px 20px", borderTop: "1px solid #F0DDE0", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => changeStatus(o.id as string, "fulfilled")}
                      disabled={isLoading}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", background: "#7DA88A", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", opacity: isLoading ? 0.6 : 1 }}
                    >
                      <Truck size={14} /> Mark Fulfilled
                    </button>
                    <button
                      onClick={() => changeStatus(o.id as string, "cancelled")}
                      disabled={isLoading}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", background: "#F0E8EE", border: "1.5px solid #E8C4C4", color: "#C08080", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                    <span style={{ fontSize: "0.75rem", color: "#8A6A6A", alignSelf: "center", marginLeft: "4px" }}>
                      {o.whatsapp_notified ? "✓ WA notified" : ""} {o.email_notified ? "✓ Email sent" : ""}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
