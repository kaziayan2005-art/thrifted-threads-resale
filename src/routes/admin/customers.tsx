import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, ShoppingBag, Eye, X, Phone, Mail } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { AdminBreadcrumb, AdminPageHeader } from "./_layout";
import { formatPKR } from "@/lib/catalog";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

interface CustomerRow {
  id: string;
  name: string | null;
  email?: string | null;
  phone: string | null;
  created_at: string;
  orderCount: number;
  totalSpent: number;
  orders: Array<{ id: string; total: number; status: string; created_at: string }>;
}

function useAdminCustomers() {
  return useQuery({
    queryKey: ["admin-customers"],
    queryFn: async (): Promise<CustomerRow[]> => {
      if (isMockMode) {
        return [
          {
            id: "cust-1",
            name: "Aisha Khan",
            email: "aisha@example.com",
            phone: "+92 300 1234567",
            created_at: new Date().toISOString(),
            orderCount: 2,
            totalSpent: 9400,
            orders: [
              { id: "ord-101", total: 4200, status: "fulfilled", created_at: new Date().toISOString() },
              { id: "ord-102", total: 5200, status: "paid", created_at: new Date().toISOString() },
            ],
          },
        ];
      }

      // Fetch profiles & orders
      const [{ data: profiles, error: profErr }, { data: orders, error: ordErr }] = await Promise.all([
        supabase.from("profiles").select("id, name, phone, created_at, role").eq("role", "buyer"),
        supabase.from("orders").select("id, buyer_id, total, status, created_at, shipping_address"),
      ]);

      if (profErr) throw profErr;
      if (ordErr) throw ordErr;

      const orderList = orders ?? [];

      return (profiles ?? []).map((p) => {
        const userOrders = orderList.filter((o) => o.buyer_id === p.id);
        const totalSpent = userOrders
          .filter((o) => ["fulfilled", "paid", "shipped", "packed", "confirmed"].includes(o.status))
          .reduce((sum, o) => sum + (o.total || 0), 0);

        // Try extracting email/phone from shipping_address if missing on profile
        const sampleShipping = (userOrders[0]?.shipping_address as { email?: string; phone?: string }) ?? {};

        return {
          id: p.id,
          name: p.name || sampleShipping.email || "Registered Buyer",
          email: sampleShipping.email || null,
          phone: p.phone || sampleShipping.phone || null,
          created_at: p.created_at,
          orderCount: userOrders.length,
          totalSpent,
          orders: userOrders,
        };
      });
    },
  });
}

function AdminCustomers() {
  const { data: customers = [], isLoading } = useAdminCustomers();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminBreadcrumb items={[{ label: "Customers" }]} />
      <AdminPageHeader title="Registered Customers" />

      {/* Search Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          alignItems: "center",
          background: "#FFFBFC",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1.5px solid #E8C4C4",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={15}
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8A6A6A" }}
          />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 12px 7px 32px",
              borderRadius: "6px",
              border: "1px solid #D9C5BE",
              fontSize: "0.82rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflow: "hidden" }}>
        {isLoading ? (
          <p style={{ padding: "32px", color: "#8A6A6A", textAlign: "center" }}>Loading customer records…</p>
        ) : !filteredCustomers.length ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <Users size={36} color="#8A6A6A" style={{ margin: "0 auto 12px" }} strokeWidth={1.25} />
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2C1A1A" }}>No customers found.</p>
            <p style={{ fontSize: "0.85rem", color: "#8A6A6A", marginTop: "6px" }}>
              {search ? "No customer accounts match your search query." : "Registered buyer profiles will appear here."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9EEF2" }}>
                {["Customer Name", "Contact", "Total Orders", "Total Spent", "Joined Date", "Actions"].map((h) => (
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
              {filteredCustomers.map((c, i) => (
                <tr
                  key={c.id}
                  style={{ borderTop: "1px solid #F0DDE0", background: i % 2 === 0 ? "#fff" : "#FDF8F9" }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: "0.88rem", color: "#2C1A1A" }}>
                    {c.name}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#5A3A3A" }}>
                    {c.phone && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
                        <Phone size={12} color="#7D4757" /> {c.phone}
                      </span>
                    )}
                    {c.email && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8A6A6A", fontSize: "0.78rem" }}>
                        <Mail size={12} color="#8A6A6A" /> {c.email}
                      </span>
                    )}
                    {!c.phone && !c.email && <span style={{ color: "#8A6A6A" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.85rem", fontWeight: 600, color: "#2C1A1A" }}>
                    {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.88rem", fontWeight: 700, color: "#7D4757" }}>
                    {formatPKR(c.totalSpent)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "#8A6A6A" }}>
                    {new Date(c.created_at).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => setSelectedCustomer(c)}
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
                      <Eye size={12} /> View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
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
            if (e.target === e.currentTarget) setSelectedCustomer(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
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
                  Customer Profile
                </p>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#7D4757", margin: "2px 0 0" }}>
                  {selectedCustomer.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8A6A6A" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ padding: "12px 14px", background: "#F7EDE8", borderRadius: "8px", border: "1px solid #E8C4C4" }}>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: "#8A6A6A", textTransform: "uppercase", fontWeight: 700 }}>Order History</p>
                  <p style={{ margin: "4px 0 0", fontSize: "1.2rem", fontWeight: 700, color: "#2C1A1A" }}>{selectedCustomer.orderCount} orders</p>
                </div>
                <div style={{ padding: "12px 14px", background: "#F7EDE8", borderRadius: "8px", border: "1px solid #E8C4C4" }}>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: "#8A6A6A", textTransform: "uppercase", fontWeight: 700 }}>Total Spent</p>
                  <p style={{ margin: "4px 0 0", fontSize: "1.2rem", fontWeight: 700, color: "#7D4757" }}>{formatPKR(selectedCustomer.totalSpent)}</p>
                </div>
              </div>

              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A6A", marginBottom: "10px" }}>
                Past Orders
              </p>
              {!selectedCustomer.orders.length ? (
                <p style={{ fontSize: "0.85rem", color: "#8A6A6A" }}>No orders placed yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedCustomer.orders.map((o) => (
                    <div
                      key={o.id}
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
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#7D4757" }}>
                          #{o.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#8A6A6A" }}>
                          {new Date(o.created_at).toLocaleDateString("en-PK")} · {o.status}
                        </p>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#2C1A1A" }}>
                        {formatPKR(o.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
