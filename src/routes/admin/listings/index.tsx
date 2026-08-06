import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Eye, EyeOff, Edit3, Copy, Trash2, Search, Filter } from "lucide-react";
import { useAdminListings, useUpdateListing, useDeleteListing, useDuplicateListing } from "@/hooks/useListings";
import { AdminPageHeader, AdminBreadcrumb } from "../_layout";
import { brands, sizes, conditions } from "@/lib/catalog";

export const Route = createFileRoute("/admin/listings/")({
  component: AdminListings,
});

const statusColors: Record<string, { bg: string; color: string }> = {
  published: { bg: "#7DA88A22", color: "#3B7A4E" },
  draft:     { bg: "#E8B87A22", color: "#C8882A" },
  reserved:  { bg: "#9B8EC422", color: "#6B5EA4" },
  sold:      { bg: "#7D475722", color: "#7D4757" },
  delisted:  { bg: "#C0808022", color: "#C08080" },
};

function AdminListings() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [sizeFilter, setSizeFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");

  const { data: listings = [], isLoading } = useAdminListings(statusFilter || undefined);
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const duplicateListing = useDuplicateListing();

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "published" ? "delisted" : current === "draft" ? "published" : current;
    await updateListing.mutateAsync({ id, status: next });
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      await deleteListing.mutateAsync(id);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateListing.mutateAsync(id);
  };

  // Filter and sort listings in memory
  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          (l.title as string).toLowerCase().includes(q) ||
          (l.brand as string).toLowerCase().includes(q) ||
          (l.slug as string).toLowerCase().includes(q)
      );
    }

    if (brandFilter) result = result.filter((l) => l.brand === brandFilter);
    if (sizeFilter) result = result.filter((l) => l.size === sizeFilter);
    if (conditionFilter) result = result.filter((l) => l.condition_grade === conditionFilter);

    // Sort
    if (sort === "price-asc") {
      result.sort((a, b) => (a.resale_price as number) - (b.resale_price as number));
    } else if (sort === "price-desc") {
      result.sort((a, b) => (b.resale_price as number) - (a.resale_price as number));
    } else if (sort === "status") {
      result.sort((a, b) => (a.status as string).localeCompare(b.status as string));
    }

    return result;
  }, [listings, search, brandFilter, sizeFilter, conditionFilter, sort]);

  return (
    <div style={{ padding: "32px 36px" }}>
      <AdminBreadcrumb items={[{ label: "Listings" }]} />
      <AdminPageHeader
        title="Listings"
        action={
          <Link
            to="/admin/listings/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#7D4757",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(125,71,87,0.25)",
            }}
          >
            <Plus size={14} /> New Listing
          </Link>
        }
      />

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["", "published", "draft", "reserved", "sold", "delisted"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "1.5px solid",
              borderColor: statusFilter === s ? "#7D4757" : "#E8C4C4",
              background: statusFilter === s ? "#7D475714" : "#FFFBFC",
              color: statusFilter === s ? "#7D4757" : "#8A6A6A",
              transition: "all 0.15s",
            }}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
          </button>
        ))}
      </div>

      {/* Search & Filter toolbar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
          background: "#FFFBFC",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1.5px solid #E8C4C4",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search
            size={15}
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8A6A6A" }}
          />
          <input
            type="text"
            placeholder="Search by title, brand..."
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

        {/* Brand filter */}
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          style={{
            padding: "7px 10px",
            borderRadius: "6px",
            border: "1px solid #D9C5BE",
            fontSize: "0.82rem",
            background: "#fff",
            color: "#2C1A1A",
          }}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Size filter */}
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          style={{
            padding: "7px 10px",
            borderRadius: "6px",
            border: "1px solid #D9C5BE",
            fontSize: "0.82rem",
            background: "#fff",
            color: "#2C1A1A",
          }}
        >
          <option value="">All Sizes</option>
          {sizes.map((sz) => (
            <option key={sz} value={sz}>
              Size {sz}
            </option>
          ))}
        </select>

        {/* Condition filter */}
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          style={{
            padding: "7px 10px",
            borderRadius: "6px",
            border: "1px solid #D9C5BE",
            fontSize: "0.82rem",
            background: "#fff",
            color: "#2C1A1A",
          }}
        >
          <option value="">All Conditions</option>
          {conditions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "7px 10px",
            borderRadius: "6px",
            border: "1px solid #7D4757",
            fontSize: "0.82rem",
            background: "#F9EEF2",
            color: "#7D4757",
            fontWeight: 600,
          }}
        >
          <option value="newest">Sort: Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "1.5px solid #E8C4C4", overflow: "hidden" }}>
        {isLoading ? (
          <p style={{ padding: "32px", color: "#8A6A6A", textAlign: "center" }}>Loading inventory listings…</p>
        ) : !filteredListings.length ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2C1A1A" }}>No listings found.</p>
            <p style={{ fontSize: "0.85rem", color: "#8A6A6A", marginTop: "6px", marginBottom: "16px" }}>
              {search || brandFilter || sizeFilter || conditionFilter || statusFilter
                ? "Try clearing your search or active filters."
                : "Your inventory rail is empty. Add your first thrifted piece!"}
            </p>
            <Link
              to="/admin/listings/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#7D4757",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Plus size={14} /> Add new listing
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9EEF2" }}>
                {["Item", "Brand", "Size", "Condition", "Price", "Status", "Actions"].map((h) => (
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
              {filteredListings.map((l: Record<string, unknown>, i: number) => {
                const st = statusColors[l.status as string] ?? statusColors.draft;
                const photos = (l.listing_photos as Array<{ public_url: string }>) ?? [];
                const mainPhoto = photos[0]?.public_url;

                return (
                  <tr
                    key={l.id as string}
                    style={{ borderTop: "1px solid #F0DDE0", background: i % 2 === 0 ? "#fff" : "#FDF8F9" }}
                  >
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {mainPhoto ? (
                          <img
                            src={mainPhoto}
                            alt=""
                            style={{
                              width: "36px",
                              height: "45px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #E8C4C4",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "36px",
                              height: "45px",
                              background: "#F5E8EE",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.65rem",
                              color: "#7D4757",
                              fontWeight: 700,
                            }}
                          >
                            TT
                          </div>
                        )}
                        <div>
                          <p
                            style={{
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              color: "#2C1A1A",
                              maxWidth: "220px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              margin: 0,
                            }}
                          >
                            {l.title as string}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "#8A6A6A", margin: "2px 0 0" }}>
                            {l.slug as string}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#5A3A3A" }}>
                      {l.brand as string}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.82rem", color: "#5A3A3A" }}>
                      {l.size as string}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.78rem", color: "#5A3A3A" }}>
                      {l.condition_grade as string}
                    </td>
                    <td
                      style={{ padding: "10px 16px", fontSize: "0.85rem", fontWeight: 600, color: "#7D4757" }}
                    >
                      PKR {(l.resale_price as number).toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background: st.bg,
                          color: st.color,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {l.status as string}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <Link
                          to={`/admin/listings/${l.id as string}/edit`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "#F0E8EE",
                            color: "#7D4757",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          <Edit3 size={12} /> Edit
                        </Link>
                        {(l.status === "published" || l.status === "draft") && (
                          <button
                            onClick={() => toggleStatus(l.id as string, l.status as string)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: l.status === "published" ? "#FDEAEA" : "#EAF4EA",
                              color: l.status === "published" ? "#C08080" : "#3B7A4E",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {l.status === "published" ? (
                              <>
                                <EyeOff size={12} /> Delist
                              </>
                            ) : (
                              <>
                                <Eye size={12} /> Publish
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(l.id as string)}
                          title="Duplicate listing"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "#F0E4E8",
                            color: "#5A3A3A",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Copy size={12} /> Copy
                        </button>
                        <button
                          onClick={() => handleDelete(l.id as string, l.title as string)}
                          title="Delete listing"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "#FDF2F2",
                            color: "#C0392B",
                            fontSize: "0.75rem",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
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
