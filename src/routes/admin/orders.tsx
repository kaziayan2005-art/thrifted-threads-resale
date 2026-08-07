import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Package2, Truck, XCircle, Eye, CheckCircle2, Clock, ShieldCheck, X } from "lucide-react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { AdminBreadcrumb, AdminPageHeader, checkAdminAuth } from "../admin";
import { formatPKR } from "@/lib/catalog";

interface OrdersSearch {
  status?: string;
}

export const Route = createFileRoute("/admin/orders")({
  beforeLoad: checkAdminAuth,
  validateSearch: (search: Record<string, unknown>): OrdersSearch => ({
    status: typeof search["status"] === "string" ? search["status"] : undefined,
  }),
  component: AdminOrders,
});

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#E8B87A22", color: "#C8882A" },
  confirmed: { bg: "#9B8EC422", color: "#6B5EA4" },
  packed:    { bg: "#6BA4B822", color: "#2B7A94" },
  shipped:   { bg: "#7DA88A22", color: "#3B7A4E" },
  fulfilled: { bg: "#7DA88A33", color: "#2E6B40" },
  paid:      { bg: "#7DA88A22", color: "#3B7A4E" },
  cancelled: { bg: "#C0808022", color: "#C08080" },
  returned:  { bg: "#D8909022", color: "#A84A4A" },
};

function AdminOrders() {
  const searchParams = Route.useSearch();
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.status || "");
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);

  const { data: orders = [], isLoading } = useAdminOrders(statusFilter || undefined);
  const updateStatus = useUpdateOrderStatus();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateStatus.mutateAsync({ orderId, status: nextStatus });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-9">
      <AdminBreadcrumb items={[{ label: "Orders" }]} />
      <AdminPageHeader title="Orders" />

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["", "pending", "confirmed", "packed", "shipped", "fulfilled", "cancelled", "returned"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: statusFilter === s ? 700 : 500,
              border: "1.5px solid #E8C4C4",
              background: statusFilter === s ? "#7D4757" : "#FFFBFC",
              color: statusFilter === s ? "#FFF" : "#7D4757",
              cursor: "pointer",
              transition: "all 0.15s",
              textTransform: "capitalize",
            }}
          >
            {s ? s : "All Orders"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflowX: "auto" }}>
        {isLoading ? (
          <p style={{ padding: "32px", color: "#8A6A6A", textAlign: "center" }}>Loading orders…</p>
        ) : !orders.length ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <Package2 size={36} color="#8A6A6A" style={{ margin: "0 auto 12px" }} strokeWidth={1.25} />
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2C1A1A" }}>No orders found.</p>
            <p style={{ fontSize: "0.85rem", color: "#8A6A6A", marginTop: "6px" }}>
              {statusFilter
                ? `There are currently no orders with status "${statusFilter}".`
                : "When customers place orders, they will appear here."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9EEF2" }}>
                {["Order #", "Customer", "Items", "Amount", "Payment Method", "Status", "Date", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 16px",
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
              {orders.map((o: Record<string, unknown>, i: number) => {
                const shipping = (o.shipping_address as { name?: string; city?: string; email?: string }) ?? {};
                const items = (o.order_items ?? []) as Array<Record<string, unknown>>;
                const st = statusColors[o.status as string] ?? statusColors.pending;
                const isUpdating = updatingId === o.id;

                return (
                  <tr
                    key={o.id as string}
                    style={{ borderTop: "1px solid #F0DDE0", background: i % 2 === 0 ? "#fff" : "#FDF8F9" }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: "0.85rem", color: "#7D4757" }}>
                      #{(o.id as string).slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#2C1A1A" }}>
                        {shipping.name || "Guest Buyer"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#8A6A6A" }}>
                        {shipping.city || "Pakistan"}
                      </p>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#5A3A3A" }}>
                      {items.length} {items.length === 1 ? "piece" : "pieces"}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: "0.85rem", color: "#2C1A1A" }}>
                      {formatPKR(o.total as number)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "#5A3A3A" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: "#F0E8EE",
                          color: "#7D4757",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                        }}
                      >
                        Card (Stripe 100% advance)
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <select
                        value={o.status as string}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(o.id as string, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "999px",
                          background: st.bg,
                          color: st.color,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          border: "none",
                          cursor: isUpdating ? "wait" : "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="fulfilled">Fulfilled / Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "#8A6A6A" }}>
                      {new Date(o.created_at as string).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          background: "#F0E8EE",
                          color: "#7D4757",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={12} /> Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: "rgba(44, 26, 26, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#FFFBFC",
              border: "1.5px solid #7D4757",
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(44,26,26,0.3)",
              color: "#2C1A1A",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: "1px solid #E8C4C4",
                backgroundColor: "#F9EEF2",
              }}
            >
              <div>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", color: "#8A6A6A", textTransform: "uppercase", margin: 0 }}>
                  Order Details
                </p>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#7D4757", margin: "2px 0 0" }}>
                  #{(selectedOrder.id as string).slice(0, 8).toUpperCase()}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8A6A6A" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Shipping info */}
              <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: "#F7EDE8", borderRadius: "10px", border: "1px solid #E8C4C4" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A6A", marginBottom: "8px" }}>
                  Shipping & Customer Info
                </p>
                {(() => {
                  const s = (selectedOrder.shipping_address as { name?: string; phone?: string; email?: string; address?: string; city?: string; postal?: string }) ?? {};
                  return (
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#2C1A1A" }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>{s.name || "Guest Buyer"}</p>
                      <p style={{ margin: 0, color: "#5A3A3A" }}>Phone: {s.phone || "N/A"}</p>
                      <p style={{ margin: 0, color: "#5A3A3A" }}>Email: {s.email || "N/A"}</p>
                      <p style={{ margin: "4px 0 0", color: "#8A6A6A" }}>
                        Address: {s.address ? `${s.address}, ${s.city} ${s.postal || ""}` : "No address provided"}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Items */}
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A6A", marginBottom: "10px" }}>
                  Ordered Items
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {((selectedOrder.order_items as Array<Record<string, unknown>>) ?? []).map((item, idx) => {
                    const snap = (item.listing_snapshot as { title?: string; brand?: string; resale_price?: number }) ?? {};
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          backgroundColor: "#FDF8F9",
                          borderRadius: "8px",
                          border: "1px solid #F0DDE0",
                        }}
                      >
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.88rem", color: "#2C1A1A" }}>
                            {snap.title || "Thrifted Piece"}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#8A6A6A" }}>
                            {snap.brand || "Graded Resale"}
                          </p>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#7D4757" }}>
                          {formatPKR(item.price_at_purchase as number)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div style={{ borderTop: "1px solid #E8C4C4", paddingTop: "14px", display: "flex", justifyBetween: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#8A6A6A" }}>
                    Payment: Card via Stripe (100% advance)
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#8A6A6A" }}>
                    Placed: {new Date(selectedOrder.created_at as string).toLocaleString("en-PK")}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.78rem", color: "#8A6A6A", display: "block" }}>Total Paid</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#7D4757" }}>
                    {formatPKR(selectedOrder.total as number)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
