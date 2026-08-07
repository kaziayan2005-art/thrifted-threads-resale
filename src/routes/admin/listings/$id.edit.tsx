import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminListings, useUpdateListing } from "@/hooks/useListings";
import { AdminBreadcrumb, AdminPageHeader, checkAdminAuth } from "../../admin";
import { conditions, occasions, sizes, brands } from "@/lib/catalog";

export const Route = createFileRoute("/admin/listings/$id/edit")({
  beforeLoad: checkAdminAuth,
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: listings = [], isLoading } = useAdminListings();
  const updateListing = useUpdateListing();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const listing = listings.find((l: Record<string, unknown>) => l.id === id);

  // Local editable state (initialized from listing once loaded)
  const [title, setTitle] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<string | null>(null);
  const [resalePrice, setResalePrice] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [bestSeller, setBestSeller] = useState<boolean | null>(null);

  if (isLoading) return <div style={{ padding: "40px" }}>Loading…</div>;
  if (!listing) return <div style={{ padding: "40px", color: "#C08080" }}>Listing not found.</div>;

  const l = listing as Record<string, unknown>;

  // Initialize local state from listing on first render
  if (title === null) { setTitle(l.title as string); return null; }
  if (brand === null) { setBrand(l.brand as string); return null; }
  if (size === null) { setSize(l.size as string); return null; }
  if (color === null) { setColor(l.color as string); return null; }
  if (occasion === null) { setOccasion(l.occasion as string); return null; }
  if (condition === null) { setCondition(l.condition_grade as string); return null; }
  if (originalPrice === null) { setOriginalPrice(String(l.original_price)); return null; }
  if (resalePrice === null) { setResalePrice(String(l.resale_price)); return null; }
  if (fabric === null) { setFabric(l.fabric_details as string); return null; }
  if (measurements === null) { setMeasurements(l.measurements as string); return null; }
  if (description === null) { setDescription(l.description as string); return null; }
  if (bestSeller === null) { setBestSeller(l.best_seller as boolean); return null; }

  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    try {
      await updateListing.mutateAsync({
        id,
        title: title!.trim(),
        brand: brand!.trim(),
        size: size!,
        color: color!.trim(),
        occasion: occasion!,
        condition_grade: condition!,
        original_price: Number(originalPrice),
        resale_price: Number(resalePrice),
        fabric_details: fabric!.trim(),
        measurements: measurements!.trim(),
        description: description!.trim(),
        best_seller: bestSeller!,
        ...(newStatus ? { status: newStatus } : {}),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "8px",
    border: "1.5px solid #E8C4C4", background: "#fff",
    color: "#2C1A1A", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" as const,
  };
  const labelStyle = {
    display: "block" as const, fontSize: "0.72rem", fontWeight: 600 as const,
    color: "#5A3A3A", letterSpacing: "0.08em", marginBottom: "5px", textTransform: "uppercase" as const,
  };
  const section = (heading: string, children: React.ReactNode) => (
    <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "24px", marginBottom: "20px" }}>
      <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2C1A1A", marginBottom: "18px", paddingBottom: "10px", borderBottom: "1px solid #F0DDE0" }}>{heading}</h2>
      {children}
    </div>
  );

  return (
    <div style={{ padding: "32px 36px", maxWidth: "860px" }}>
      <AdminBreadcrumb items={[{ label: "Listings", to: "/admin/listings" }, { label: l.title as string }]} />
      <AdminPageHeader
        title="Edit Listing"
        action={
          <span style={{
            padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, textTransform: "capitalize",
            background: l.status === "published" ? "#7DA88A22" : "#E8B87A22",
            color: l.status === "published" ? "#7DA88A" : "#C8882A",
          }}>
            {l.status as string}
          </span>
        }
      />

      {section("Basic Information", <>
        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Title</label>
          <input value={title!} onChange={e => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <div><label style={labelStyle}>Brand</label><input value={brand!} onChange={e => setBrand(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Colour</label><input value={color!} onChange={e => setColor(e.target.value)} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Size</label>
            <select value={size!} onChange={e => setSize(e.target.value)} style={inputStyle}>
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Occasion</label>
            <select value={occasion!} onChange={e => setOccasion(e.target.value)} style={inputStyle}>
              <option value="">— None —</option>
              {occasions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={description!} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </>)}

      {section("Condition & Pricing", <>
        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Condition Grade</label>
          <select value={condition!} onChange={e => setCondition(e.target.value)} style={inputStyle}>
            {conditions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div><label style={labelStyle}>Original Price (PKR)</label><input type="number" value={originalPrice!} onChange={e => setOriginalPrice(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Resale Price (PKR)</label><input type="number" value={resalePrice!} onChange={e => setResalePrice(e.target.value)} style={inputStyle} /></div>
        </div>
      </>)}

      {section("Fabric & Measurements", <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div><label style={labelStyle}>Fabric Details</label><input value={fabric!} onChange={e => setFabric(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Measurements</label><input value={measurements!} onChange={e => setMeasurements(e.target.value)} style={inputStyle} /></div>
        </div>
      </>)}

      {/* Actions */}
      <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => handleSave()} disabled={saving} style={{ padding: "10px 20px", borderRadius: "8px", background: "#7D4757", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
        </button>
        {l.status === "draft" && (
          <button onClick={() => handleSave("published")} disabled={saving} style={{ padding: "10px 20px", borderRadius: "8px", background: "#7DA88A", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>
            Save & Publish
          </button>
        )}
        {l.status === "published" && (
          <button onClick={() => handleSave("delisted")} disabled={saving} style={{ padding: "10px 20px", borderRadius: "8px", background: "#F0E8EE", border: "1.5px solid #E8C4C4", color: "#C08080", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>
            Delist
          </button>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto", fontSize: "0.85rem", color: "#5A3A3A", cursor: "pointer" }}>
          <input type="checkbox" checked={bestSeller!} onChange={e => setBestSeller(e.target.checked)} />
          Best Seller
        </label>
      </div>
    </div>
  );
}
