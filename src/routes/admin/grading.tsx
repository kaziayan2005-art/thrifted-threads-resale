import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit3, Trash2, Save, X } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { AdminBreadcrumb, AdminPageHeader, checkAdminAuth } from "./_layout";
import type { GradingDefinition } from "@/lib/database.types";

export const Route = createFileRoute("/admin/grading")({
  beforeLoad: checkAdminAuth,
  component: AdminGrading,
});

function useGradingDefs() {
  return useQuery({
    queryKey: ["grading-definitions"],
    queryFn: async () => {
      if (isMockMode) return [
        { id: "1", label: "New with Tags",     description: "Never worn. Original tags attached. Mint condition.",                              sort_order: 1, created_at: "" },
        { id: "2", label: "Photoshoot Sample", description: "Worn exclusively for a photoshoot or campaign. No signs of personal wear.",       sort_order: 2, created_at: "" },
        { id: "3", label: "Worn Once",         description: "Worn a single time. No visible flaws unless explicitly noted.",                   sort_order: 3, created_at: "" },
        { id: "4", label: "Gently Used",       description: "Shows light signs of wear. Any flaws are photographed and described in detail.", sort_order: 4, created_at: "" },
      ] as GradingDefinition[];
      const { data, error } = await supabase.from("grading_definitions").select("*").order("sort_order");
      if (error) throw error;
      return data as GradingDefinition[];
    },
  });
}

function AdminGrading() {
  const queryClient = useQueryClient();
  const { data: defs = [], isLoading } = useGradingDefs();
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (d: GradingDefinition) => {
    setEditId(d.id); setEditLabel(d.label); setEditDesc(d.description); setAdding(false);
  };
  const cancelEdit = () => { setEditId(null); setAdding(false); };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    await supabase.from("grading_definitions").update({ label: editLabel, description: editDesc }).eq("id", editId);
    queryClient.invalidateQueries({ queryKey: ["grading-definitions"] });
    setEditId(null);
    setSaving(false);
  };

  const addNew = async () => {
    if (!newLabel.trim() || !newDesc.trim()) return;
    setSaving(true);
    await supabase.from("grading_definitions").insert({ label: newLabel.trim(), description: newDesc.trim(), sort_order: defs.length + 1 });
    queryClient.invalidateQueries({ queryKey: ["grading-definitions"] });
    setAdding(false); setNewLabel(""); setNewDesc("");
    setSaving(false);
  };

  const deleteDef = async (id: string) => {
    if (!confirm("Delete this grading tier? This will affect listings using it.")) return;
    await supabase.from("grading_definitions").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["grading-definitions"] });
  };

  const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #E8C4C4", background: "#fff", color: "#2C1A1A", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "32px 36px", maxWidth: "720px" }}>
      <AdminBreadcrumb items={[{ label: "Grading Scale" }]} />
      <AdminPageHeader
        title="Grading Scale"
        action={
          !adding && !isMockMode ? (
            <button onClick={() => { setAdding(true); setEditId(null); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#7D4757", color: "#fff", padding: "9px 16px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
              <Plus size={14} /> Add Tier
            </button>
          ) : undefined
        }
      />
      <p style={{ color: "#8A6A6A", fontSize: "0.85rem", marginBottom: "24px" }}>
        These condition tiers are shown across the site on product listings, filters, and product detail pages. Changes take effect immediately.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {isLoading ? <p style={{ color: "#8A6A6A" }}>Loading…</p> : defs.map((d, i) => (
          <div key={d.id} style={{ background: "#FFFBFC", borderRadius: "12px", border: editId === d.id ? "2px solid #7D4757" : "1.5px solid #E8C4C4", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ background: "#7D475714", color: "#7D4757", borderRadius: "6px", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.78rem", flexShrink: 0 }}>{i + 1}</span>
              {editId === d.id ? (
                <input value={editLabel} onChange={e => setEditLabel(e.target.value)} style={{ ...inputStyle, fontWeight: 700 }} />
              ) : (
                <p style={{ fontWeight: 700, color: "#2C1A1A", fontSize: "0.92rem", flex: 1 }}>{d.label}</p>
              )}
              {!isMockMode && editId !== d.id && (
                <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                  <button onClick={() => startEdit(d)} style={{ padding: "5px 10px", borderRadius: "6px", background: "#F0E8EE", border: "none", cursor: "pointer", color: "#7D4757", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Edit3 size={11} /> Edit
                  </button>
                  <button onClick={() => deleteDef(d.id)} style={{ padding: "5px 10px", borderRadius: "6px", background: "#FDEAEA", border: "none", cursor: "pointer", color: "#C08080", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              )}
            </div>
            {editId === d.id ? (
              <>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", marginTop: "8px" }} />
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button onClick={saveEdit} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", background: "#7D4757", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
                    <Save size={13} /> Save
                  </button>
                  <button onClick={cancelEdit} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", background: "#F0E8EE", border: "none", color: "#7D4757", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <p style={{ fontSize: "0.85rem", color: "#5A3A3A", lineHeight: 1.6 }}>{d.description}</p>
            )}
          </div>
        ))}

        {/* Add new */}
        {adding && (
          <div style={{ background: "#FFFBFC", borderRadius: "12px", border: "2px solid #7D4757", padding: "18px 20px" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#7D4757", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>New Tier</p>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Tier label (e.g. Fair)" style={{ ...inputStyle, fontWeight: 700, marginBottom: "10px" }} />
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder="Description shown to buyers…" style={{ ...inputStyle, resize: "vertical" }} />
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button onClick={addNew} disabled={saving || !newLabel.trim()} style={{ padding: "7px 14px", borderRadius: "8px", background: "#7D4757", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>Add</button>
              <button onClick={cancelEdit} style={{ padding: "7px 14px", borderRadius: "8px", background: "#F0E8EE", border: "none", color: "#7D4757", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
