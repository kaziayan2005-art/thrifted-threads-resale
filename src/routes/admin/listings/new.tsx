import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Plus, X, Upload, GripVertical } from "lucide-react";
import { useCreateListing, uploadListingPhoto } from "@/hooks/useListings";
import { AdminBreadcrumb, AdminPageHeader } from "../_layout";
import { conditions, occasions, sizes, brands } from "@/lib/catalog";

export const Route = createFileRoute("/admin/listings/new")({
  component: NewListing,
});

interface FlawEntry { label: string; note: string }
interface PhotoEntry { file: File; preview: string; altText: string }

function NewListing() {
  const navigate = useNavigate();
  const createListing = useCreateListing();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form fields
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [occasion, setOccasion] = useState("");
  const [condition, setCondition] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [resalePrice, setResalePrice] = useState("");
  const [fabric, setFabric] = useState("");
  const [measurements, setMeasurements] = useState("");
  const [description, setDescription] = useState("");
  const [bestSeller, setBestSeller] = useState(false);
  const [statusDraft, setStatusDraft] = useState(true);

  // Flaws
  const [flaws, setFlaws] = useState<FlawEntry[]>([]);
  const addFlaw = () => setFlaws(f => [...f, { label: "", note: "" }]);
  const removeFlaw = (i: number) => setFlaws(f => f.filter((_, j) => j !== i));
  const updateFlaw = (i: number, key: "label" | "note", val: string) =>
    setFlaws(f => f.map((fw, j) => j === i ? { ...fw, [key]: val } : fw));

  // Shoot story
  const [hasShoot, setHasShoot] = useState(false);
  const [shootCampaign, setShootCampaign] = useState("");
  const [shootSeason, setShootSeason] = useState("");
  const [shootBlurb, setShootBlurb] = useState("");

  // Photos
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const entries: PhotoEntry[] = files.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      altText: "",
    }));
    setPhotos(p => [...p, ...entries].slice(0, 8));
  };
  const removePhoto = (i: number) => setPhotos(p => p.filter((_, j) => j !== i));
  const updateAlt = (i: number, val: string) =>
    setPhotos(p => p.map((ph, j) => j === i ? { ...ph, altText: val } : ph));

  // Slug generator
  const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!brand.trim()) e.brand = "Brand is required";
    if (!size) e.size = "Size is required";
    if (!condition) e.condition = "Condition is required";
    if (!originalPrice || isNaN(Number(originalPrice))) e.originalPrice = "Valid original price required";
    if (!resalePrice || isNaN(Number(resalePrice))) e.resalePrice = "Valid resale price required";
    if (!description.trim()) e.description = "Description is required";
    if (photos.length === 0) e.photos = "At least one photo is required";
    photos.forEach((ph, i) => { if (!ph.altText.trim()) e[`altText_${i}`] = `Alt text required for photo ${i + 1}`; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // 1. Create listing
      const listing = await createListing.mutateAsync({
        slug: toSlug(title),
        title: title.trim(),
        description: description.trim(),
        brand: brand.trim(),
        size,
        color: color.trim(),
        occasion,
        condition_grade: condition,
        flaw_notes: flaws.filter(f => f.label.trim()),
        fabric_details: fabric.trim(),
        measurements: measurements.trim(),
        original_price: Number(originalPrice),
        resale_price: Number(resalePrice),
        water_saved_l: 3000,
        carbon_saved_kg: 7,
        shoot_story: hasShoot ? { campaign: shootCampaign, season: shootSeason, blurb: shootBlurb } : null,
        best_seller: bestSeller,
        status: statusDraft ? "draft" : "published",
      });

      // 2. Upload photos
      for (let i = 0; i < photos.length; i++) {
        await uploadListingPhoto(listing.id, photos[i].file, photos[i].altText, i);
      }

      navigate({ to: "/admin/listings" });
    } catch (err) {
      console.error(err);
      setErrors({ _global: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const input = (value: string, onChange: (v: string) => void, placeholder?: string, type = "text") => (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: "8px",
        border: "1.5px solid #E8C4C4", background: "#fff", color: "#2C1A1A",
        fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
      }}
    />
  );

  const select = (value: string, onChange: (v: string) => void, options: readonly string[], placeholder: string) => (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "9px 12px", borderRadius: "8px",
      border: "1.5px solid #E8C4C4", background: "#fff", color: value ? "#2C1A1A" : "#8A6A6A",
      fontSize: "0.88rem", outline: "none",
    }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const label = (text: string, required = false) => (
    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5A3A3A", letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>
      {text}{required && <span style={{ color: "#C08080" }}> *</span>}
    </label>
  );

  const err = (key: string) => errors[key]
    ? <p style={{ color: "#C08080", fontSize: "0.75rem", marginTop: "4px" }}>{errors[key]}</p>
    : null;

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", padding: "24px", marginBottom: "20px" }}>
      <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2C1A1A", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #F0DDE0" }}>{title}</h2>
      {children}
    </div>
  );

  const grid2 = (children: React.ReactNode) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>{children}</div>
  );

  const field = (children: React.ReactNode, errorKey?: string) => (
    <div style={{ marginBottom: "4px" }}>{children}{errorKey && err(errorKey)}</div>
  );

  return (
    <div style={{ padding: "32px 36px", maxWidth: "860px" }}>
      <AdminBreadcrumb items={[{ label: "Listings", to: "/admin/listings" }, { label: "New Listing" }]} />
      <AdminPageHeader title="New Listing" />

      {errors._global && (
        <div style={{ background: "#FDEAEA", border: "1.5px solid #C08080", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", color: "#C08080", fontSize: "0.85rem" }}>
          {errors._global}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic info */}
        {section("Basic Information", <>
          {field(<>{label("Title", true)}{input(title, setTitle, "e.g. Ivory Silk Camp Shirt")}</>, "title")}
          {grid2(<>
            {field(<>{label("Brand", true)}{input(brand, setBrand, "e.g. Sapphire")}</>, "brand")}
            {field(<>{label("Colour")}{input(color, setColor, "e.g. Ivory")}</>)}
            {field(<>{label("Size", true)}{select(size, setSize, sizes, "Select size")}</>, "size")}
            {field(<>{label("Occasion")}{select(occasion, setOccasion, occasions, "Select occasion")}</>)}
          </>)}
          {field(<>{label("Description", true)}<textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the piece honestly…" style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #E8C4C4", background: "#fff", color: "#2C1A1A", fontSize: "0.88rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} /></>, "description")}
        </>)}

        {/* Condition & Pricing */}
        {section("Condition & Pricing", <>
          {field(<>{label("Condition Grade", true)}{select(condition, setCondition, conditions, "Select condition")}</>, "condition")}
          {grid2(<>
            {field(<>{label("Original Price (PKR)", true)}{input(originalPrice, setOriginalPrice, "12500", "number")}</>, "originalPrice")}
            {field(<>{label("Resale Price (PKR)", true)}{input(resalePrice, setResalePrice, "4200", "number")}</>, "resalePrice")}
          </>)}
        </>)}

        {/* Details */}
        {section("Fabric & Measurements", <>
          {grid2(<>
            {field(<>{label("Fabric details")}{input(fabric, setFabric, "100% mulberry silk")}</>)}
            {field(<>{label("Measurements")}{input(measurements, setMeasurements, "Chest 52cm · Length 68cm")}</>)}
          </>)}
        </>)}

        {/* Flaws */}
        {section("Honest Disclosure", <>
          {flaws.map((flaw, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "10px", marginBottom: "10px", alignItems: "start" }}>
              {input(flaw.label, v => updateFlaw(i, "label", v), "e.g. Hem wear")}
              {input(flaw.note, v => updateFlaw(i, "note", v), "Describe flaw precisely…")}
              <button type="button" onClick={() => removeFlaw(i)} style={{ padding: "9px", borderRadius: "6px", background: "#FDEAEA", border: "none", cursor: "pointer", color: "#C08080" }}><X size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={addFlaw} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: "#F0E8EE", border: "none", cursor: "pointer", color: "#7D4757", fontSize: "0.82rem", fontWeight: 600 }}>
            <Plus size={13} /> Add flaw
          </button>
          {flaws.length === 0 && <p style={{ color: "#8A6A6A", fontSize: "0.82rem", marginTop: "8px" }}>No flaws? Leave empty — we'll show "No flaws found at intake."</p>}
        </>)}

        {/* Shoot story */}
        {section("Shop the Shoot (optional)", <>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "16px", fontSize: "0.88rem", color: "#2C1A1A" }}>
            <input type="checkbox" checked={hasShoot} onChange={e => setHasShoot(e.target.checked)} />
            This piece was part of a photoshoot
          </label>
          {hasShoot && <>
            {grid2(<>
              {field(<>{label("Campaign name")}{input(shootCampaign, setShootCampaign, "e.g. Late Light")}</>)}
              {field(<>{label("Season")}{input(shootSeason, setShootSeason, "e.g. Autumn 2025")}</>)}
            </>)}
            {field(<>{label("Story blurb")}<textarea value={shootBlurb} onChange={e => setShootBlurb(e.target.value)} rows={2} placeholder="Tell the story of this piece in the shoot…" style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #E8C4C4", background: "#fff", color: "#2C1A1A", fontSize: "0.88rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} /></>)}
          </>}
        </>)}

        {/* Photos */}
        {section("Photos", <>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} style={{ display: "none" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
            {photos.map((ph, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={ph.preview} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "8px", border: "1.5px solid #E8C4C4" }} />
                <button type="button" onClick={() => removePhoto(i)} style={{ position: "absolute", top: "4px", right: "4px", background: "#2C1A1A99", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                <input
                  value={ph.altText} onChange={e => updateAlt(i, e.target.value)}
                  placeholder={`Alt text for photo ${i + 1} *`}
                  style={{ marginTop: "6px", width: "100%", padding: "5px 8px", borderRadius: "6px", border: errors[`altText_${i}`] ? "1.5px solid #C08080" : "1.5px solid #E8C4C4", fontSize: "0.72rem", color: "#2C1A1A", boxSizing: "border-box" }}
                />
                {err(`altText_${i}`)}
              </div>
            ))}
            {photos.length < 8 && (
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: "4/5", border: "2px dashed #E8C4C4", borderRadius: "8px", background: "#F9EEF2", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: "#8A6A6A", fontSize: "0.78rem" }}>
                <Upload size={20} strokeWidth={1.5} /> Add photos
              </button>
            )}
          </div>
          {err("photos")}
          <p style={{ color: "#8A6A6A", fontSize: "0.75rem" }}>First photo is the primary listing image. Up to 8 photos. Alt text is required for accessibility.</p>
        </>)}

        {/* Options + submit */}
        {section("Publishing", <>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "16px", fontSize: "0.88rem", color: "#2C1A1A" }}>
            <input type="checkbox" checked={bestSeller} onChange={e => setBestSeller(e.target.checked)} />
            Mark as Best Seller
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" onClick={() => setStatusDraft(true)} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#F0E8EE", border: "1.5px solid #E8C4C4", color: "#7D4757", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save as Draft"}
            </button>
            <button type="submit" onClick={() => setStatusDraft(false)} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#7D4757", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Publishing…" : "Publish Now"}
            </button>
          </div>
        </>)}
      </form>
    </div>
  );
}
