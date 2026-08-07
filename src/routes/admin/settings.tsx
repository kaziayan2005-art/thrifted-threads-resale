import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Settings as SettingsIcon, Tag, ShieldCheck, CreditCard, Sliders, ChevronRight } from "lucide-react";
import { AdminBreadcrumb, AdminPageHeader, checkAdminAuth } from "./_layout";
import { useGradingScale, useCreateGrade, useDeleteGrade } from "@/hooks/useGrading";

export const Route = createFileRoute("/admin/settings")({
  beforeLoad: checkAdminAuth,
  component: AdminSettings,
});

function AdminSettings() {
  const { data: grades = [], isLoading } = useGradingScale();
  const [activeTab, setActiveTab] = useState<"grading" | "store" | "general">("grading");

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminBreadcrumb items={[{ label: "Settings" }]} />
      <AdminPageHeader title="Store & Admin Settings" />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", borderBottom: "1.5px solid #E8C4C4", paddingBottom: "12px" }}>
        {[
          { id: "grading", label: "Grading Scale Config", icon: Tag },
          { id: "store", label: "Store Policies & Payments", icon: CreditCard },
          { id: "general", label: "System Preferences", icon: Sliders },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background: active ? "#7D4757" : "transparent",
                color: active ? "#FFFBFC" : "#8A6A6A",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Grading Scale */}
      {activeTab === "grading" && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              background: "#FFFBFC",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1.5px solid #E8C4C4",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#2C1A1A", margin: 0 }}>
                Condition Grading Scale Definitions
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#8A6A6A", margin: "4px 0 0" }}>
                These condition grades are assigned during intake and displayed on garment product pages.
              </p>
            </div>
            <Link
              to="/admin/grading"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#7D4757",
                color: "#fff",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Edit Grading Scale <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflow: "hidden" }}>
            {isLoading ? (
              <p style={{ padding: "24px", color: "#8A6A6A" }}>Loading grading definitions…</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9EEF2" }}>
                    {["Grade Label", "Definition / Customer Guarantee", "Order"].map((h) => (
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
                  {grades.map((g, i) => (
                    <tr key={g.id} style={{ borderTop: "1px solid #F0DDE0", background: i % 2 === 0 ? "#fff" : "#FDF8F9" }}>
                      <td style={{ padding: "14px 20px", fontWeight: 700, color: "#7D4757", fontSize: "0.88rem" }}>
                        {g.label}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#2C1A1A", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        {g.description}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#8A6A6A", fontSize: "0.82rem", fontWeight: 600 }}>
                        #{g.sort_order}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: Store Policies & Payments */}
      {activeTab === "store" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2C1A1A", margin: "0 0 12px" }}>
              Active Payment Provider
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#5A3A3A", lineHeight: 1.5, margin: 0 }}>
              <strong>Stripe Hosted Checkout</strong> — 100% advance payment via Card. Cash on Delivery is disabled per store policy to reserve single-unit inventory securely.
            </p>
          </div>

          <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2C1A1A", margin: "0 0 12px" }}>
              Fulfillment SLA
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#5A3A3A", lineHeight: 1.5, margin: 0 }}>
              Items are reserved for 20 minutes during checkout. Confirmed orders are dispatched within 48 hours via courier.
            </p>
          </div>
        </div>
      )}

      {/* Tab: General System Preferences */}
      {activeTab === "general" && (
        <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "24px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2C1A1A", margin: "0 0 8px" }}>
            Platform Architecture
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#8A6A6A", lineHeight: 1.5 }}>
            Single Admin Inventory Model (No consignment or third-party sellers). Pre-loved clothing items are unique, single-unit inventory pieces.
          </p>
        </div>
      )}
    </div>
  );
}
