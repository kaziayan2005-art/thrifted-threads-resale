import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus, Trash2, ArrowUp, ArrowDown, Upload, RefreshCw, Check, Image as ImageIcon } from "lucide-react";
import { AdminBreadcrumb, AdminPageHeader, checkAdminAuth } from "../admin";
import { useLoveNotes, type LoveNote } from "@/hooks/useLoveNotes";

export const Route = createFileRoute("/admin/love-notes")({
  beforeLoad: checkAdminAuth,
  component: AdminLoveNotes,
});

function AdminLoveNotes() {
  const { notes, addNote, updateNote, deleteNote, reorderNotes, resetToDefault } = useLoveNotes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Note Form State
  const [newCaption, setNewCaption] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newSrc, setNewSrc] = useState("");
  const [newPinColor, setNewPinColor] = useState("#E8888A");
  const [newTape, setNewTape] = useState(true);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          callback(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrc) {
      alert("Please upload an image or provide an image URL");
      return;
    }

    const defaultPositions = [
      { top: "48px", left: "2%", rotate: "-4deg" },
      { top: "20px", left: "26%", rotate: "3deg" },
      { top: "60px", left: "51%", rotate: "-2deg" },
      { top: "30px", left: "74%", rotate: "5deg" },
    ];
    const pos = defaultPositions[notes.length % defaultPositions.length];

    await addNote({
      src: newSrc,
      alt: newAlt || "Customer review screenshot",
      caption: newCaption || "loved this piece! 💗",
      rotate: pos.rotate,
      top: pos.top,
      left: pos.left,
      pinColor: newPinColor,
      tape: newTape,
    });

    setNewCaption("");
    setNewAlt("");
    setNewSrc("");
    setShowAddModal(false);
    showNotification("New Love Note added successfully!");
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= notes.length) return;

    const newNotes = [...notes];
    const temp = newNotes[index];
    newNotes[index] = newNotes[targetIndex];
    newNotes[targetIndex] = temp;

    await reorderNotes(newNotes);
    showNotification("Love Notes reordered!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-9">
      <AdminBreadcrumb items={[{ label: "Love Notes Editor" }]} />
      <AdminPageHeader
        title="Love Notes (Polaroid Board)"
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                if (confirm("Reset Love Notes to initial demo content?")) {
                  resetToDefault();
                  showNotification("Reset to default polaroids!");
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "#F9EEF2",
                border: "1.5px solid #E8C4C4",
                color: "#7D4757",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} /> Reset Defaults
            </button>
            <button
              onClick={() => setShowAddModal(true)}
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
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(125,71,87,0.25)",
              }}
            >
              <Plus size={16} /> Add New Polaroid
            </button>
          </div>
        }
      />

      {toast && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 18px",
            background: "#EBF5ED",
            border: "1.5px solid #A3D9B1",
            borderRadius: "10px",
            color: "#276A3C",
            fontSize: "0.88rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Check size={16} /> {toast}
        </div>
      )}

      {/* Info Card */}
      <div
        style={{
          background: "#FFFBFC",
          borderRadius: "12px",
          border: "1.5px solid #E8C4C4",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#2C1A1A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Heart size={18} color="#7D4757" fill="#7D4757" /> Polaroid Template Safeguard
        </h3>
        <p style={{ fontSize: "0.85rem", color: "#5A3A3A", margin: "6px 0 0", lineHeight: 1.5 }}>
          The polaroid border styling, tape/pin overlays, shadow depth, rotation, and handwriting font (<span style={{ fontFamily: "'Kalam', cursive", color: "#7D4757", fontWeight: 700 }}>Kalam</span>) are locked to the fixed design template. Replacing or uploading photos will automatically slot into the existing frame.
        </p>
      </div>

      {/* Love Notes Grid / Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
        {notes.map((note, index) => (
          <div
            key={note.id}
            style={{
              background: "#FFFBFC",
              borderRadius: "14px",
              border: "1.5px solid #E8C4C4",
              padding: "16px",
              boxShadow: "0 4px 16px rgba(125,71,87,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Live Polaroid Preview Box */}
            <div
              style={{
                background: "#F9EEF2",
                borderRadius: "10px",
                padding: "24px 16px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Polaroid Card */}
              <div
                style={{
                  width: "160px",
                  background: "#FFFBFC",
                  padding: "8px 8px 24px 8px",
                  boxShadow: "0 6px 20px rgba(125,71,87,0.2)",
                  borderRadius: "4px",
                  border: "1px solid rgba(232,196,204,0.5)",
                  transform: `rotate(${note.rotate || "0deg"})`,
                  position: "relative",
                }}
              >
                {/* Tape or Pin */}
                {note.tape ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%) rotate(-1.5deg)",
                      width: "48px",
                      height: "14px",
                      background: "rgba(232, 196, 212, 0.55)",
                      borderRadius: "2px",
                      border: "1px solid rgba(200,160,180,0.35)",
                      zIndex: 3,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: "-14px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 35% 35%, white 0%, ${note.pinColor || "#E8888A"} 55%)`,
                      boxShadow: `0 2px 6px ${note.pinColor || "#E8888A"}99`,
                      zIndex: 3,
                    }}
                  />
                )}

                {/* Inner Image */}
                <img
                  src={note.src}
                  alt={note.alt}
                  style={{
                    width: "100%",
                    aspectRatio: "4/5",
                    objectFit: "cover",
                    objectPosition: "top",
                    borderRadius: "1px",
                  }}
                />

                {/* Caption */}
                <p
                  style={{
                    fontFamily: "'Kalam', cursive",
                    fontSize: "0.72rem",
                    color: "#7D4757",
                    textAlign: "center",
                    marginTop: "8px",
                    lineHeight: 1.2,
                  }}
                >
                  {note.caption}
                </p>
              </div>
            </div>

            {/* Note Edit Form */}
            {editingId === note.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A6A6A", textTransform: "uppercase" }}>Caption</label>
                  <input
                    type="text"
                    value={note.caption}
                    onChange={(e) => updateNote(note.id, { caption: e.target.value })}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #D9C5BE", fontSize: "0.85rem", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A6A6A", textTransform: "uppercase" }}>Alt Text</label>
                  <input
                    type="text"
                    value={note.alt}
                    onChange={(e) => updateNote(note.id, { alt: e.target.value })}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #D9C5BE", fontSize: "0.85rem", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A6A6A", textTransform: "uppercase" }}>Replace Photo</label>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <label style={{ padding: "6px 10px", borderRadius: "6px", background: "#7D4757", color: "#fff", fontSize: "0.78rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Upload size={13} /> Choose File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, (url) => updateNote(note.id, { src: url }))}
                      />
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingId(null);
                    showNotification("Polaroid updated!");
                  }}
                  style={{ marginTop: "4px", padding: "8px", borderRadius: "6px", background: "#7D4757", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Done Editing
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#8A6A6A", fontWeight: 700, letterSpacing: "0.08em" }}>Caption</span>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#2C1A1A", margin: "2px 0 0" }}>"{note.caption}"</p>
                </div>

                {/* Card Controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #F0DDE0" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      title="Move Up"
                      style={{ padding: "6px", borderRadius: "6px", border: "1px solid #E8C4C4", background: "#fff", color: index === 0 ? "#D9C5BE" : "#7D4757", cursor: index === 0 ? "default" : "pointer" }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === notes.length - 1}
                      title="Move Down"
                      style={{ padding: "6px", borderRadius: "6px", border: "1px solid #E8C4C4", background: "#fff", color: index === notes.length - 1 ? "#D9C5BE" : "#7D4757", cursor: index === notes.length - 1 ? "default" : "pointer" }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setEditingId(note.id)}
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "1.5px solid #7D4757", background: "transparent", color: "#7D4757", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Delete this Love Note polaroid?")) {
                          await deleteNote(note.id);
                          showNotification("Polaroid deleted!");
                        }
                      }}
                      title="Delete Polaroid"
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #E5C3C3", background: "#FDF2F2", color: "#C0392B", cursor: "pointer" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Polaroid Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(44, 26, 26, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#FFFBFC",
              borderRadius: "16px",
              border: "1.5px solid #7D4757",
              width: "100%",
              maxWidth: "460px",
              padding: "24px",
              boxShadow: "0 24px 64px rgba(44,26,26,0.3)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2C1A1A", margin: "0 0 16px" }}>
              Add New Love Note Polaroid
            </h3>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#2C1A1A", marginBottom: "6px" }}>
                  Polaroid Screenshot Image
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1.5px dashed #7D4757",
                      background: "#F9EEF2",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      color: "#7D4757",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    <Upload size={20} />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(e, (url) => setNewSrc(url))}
                    />
                  </label>

                  <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#8A6A6A", margin: 0 }}>— or paste image URL —</p>

                  <input
                    type="url"
                    placeholder="https://example.com/photo.png"
                    value={newSrc}
                    onChange={(e) => setNewSrc(e.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid #D9C5BE", fontSize: "0.85rem" }}
                  />
                </div>

                {newSrc && (
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <img src={newSrc} alt="Preview" style={{ height: "100px", borderRadius: "6px", objectFit: "cover", margin: "0 auto" }} />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#2C1A1A", marginBottom: "6px" }}>
                  Polaroid Caption (Handwritten style)
                </label>
                <input
                  type="text"
                  placeholder="e.g. absolutely in love with this silk dress! 💕"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #D9C5BE", fontSize: "0.88rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#2C1A1A", marginBottom: "6px" }}>
                  Alt Description
                </label>
                <input
                  type="text"
                  placeholder="Instagram review screenshot details"
                  value={newAlt}
                  onChange={(e) => setNewAlt(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #D9C5BE", fontSize: "0.88rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="attachment"
                    checked={newTape}
                    onChange={() => setNewTape(true)}
                  />
                  Use Washi Tape Overlay
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="attachment"
                    checked={!newTape}
                    onChange={() => setNewTape(false)}
                  />
                  Use Push Pin
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1.5px solid #D9C5BE", background: "#fff", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "#7D4757", color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                >
                  Add Polaroid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
