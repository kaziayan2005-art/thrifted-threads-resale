import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Eye, EyeOff, Edit3 } from "lucide-react";
import { useAdminListings, useUpdateListing } from "@/hooks/useListings";
import { AdminPageHeader, AdminBreadcrumb } from "../_layout";

export const Route = createFileRoute("/admin/listings/")({
  component: AdminListings,
});

const statusColors: Record<string, { bg: string; color: string }> = {
  published: { bg: "#7DA88A22", color: "#7DA88A" },
  draft:     { bg: "#E8B87A22", color: "#C8882A" },
  reserved:  { bg: "#9B8EC422", color: "#6B5EA4" },
  sold:      { bg: "#7D475722", color: "#7D4757" },
  delisted:  { bg: "#C0808022", color: "#C08080" },
};

function AdminListings() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data: listings = [], isLoading } = useAdminListings(statusFilter || undefined);
  const updateListing = useUpdateListing();

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "published" ? "delisted" : current === "draft" ? "published" : current;
    await updateListing.mutateAsync({ id, status: next });
  };

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminBreadcrumb items={[{ label: "Listings" }]} />
      <AdminPageHeader
        title="Listings"
        action={
          <Link to="/admin/listings/new" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#7D4757", color: "#fff", padding: "9px 18px",
            borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600,
            textDecoration: "none",
          }}>
            <Plus size={14} /> New Listing
          </Link>
        }
      />

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["", "published", "draft", "reserved", "sold", "delisted"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "6px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "1.5px solid",
            borderColor: statusFilter === s ? "#7D4757" : "#E8C4C4",
            background: statusFilter === s ? "#7D475714" : "#FFFBFC",
            color: statusFilter === s ? "#7D4757" : "#8A6A6A",
            transition: "all 0.15s",
          }}>
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflow: "hidden" }}>
        {isLoading ? (
          <p style={{ padding: "24px", color: "#8A6A6A" }}>Loading listings…</p>
        ) : !listings.length ? (
          <p style={{ padding: "24px", color: "#8A6A6A" }}>No listings found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9EEF2" }}>
                {["Title", "Brand", "Size", "Condition", "Price", "Status", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A6A", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l: Record<string, unknown>, i: number) => {
                const st = statusColors[l.status as string] ?? statusColors.draft;
                return (
                  <tr key={l.id as string} style={{ borderTop: "1px solid #F0DDE0", background: i % 2 === 0 ? "#fff" : "#FDF8F9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: "0.85rem", color: "#2C1A1A", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title as string}</td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#5A3A3A" }}>{l.brand as string}</td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#5A3A3A" }}>{l.size as string}</td>
                    <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "#5A3A3A" }}>{l.condition_grade as string}</td>
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", fontWeight: 600, color: "#7D4757" }}>PKR {(l.resale_price as number).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "999px", background: st.bg, color: st.color, fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>
                        {l.status as string}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link to={`/admin/listings/${l.id as string}/edit`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", background: "#F0E8EE", color: "#7D4757", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                          <Edit3 size={12} /> Edit
                        </Link>
                        {(l.status === "published" || l.status === "draft") && (
                          <button
                            onClick={() => toggleStatus(l.id as string, l.status as string)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", background: l.status === "published" ? "#FDEAEA" : "#EAF4EA", color: l.status === "published" ? "#C08080" : "#7DA88A", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}
                          >
                            {l.status === "published" ? <><EyeOff size={12} /> Delist</> : <><Eye size={12} /> Publish</>}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
