import { useState, useEffect } from "react";
import { supabase, isMockMode } from "@/lib/supabase";

export interface LoveNote {
  id: string;
  src: string;
  alt: string;
  caption: string;
  rotate: string;
  top: string;
  left: string;
  pinColor: string;
  tape: boolean;
  sort_order: number;
}

export const DEFAULT_LOVE_NOTES: LoveNote[] = [
  {
    id: "note-1",
    src: "/ig-review-1.png",
    alt: "Instagram DM: Customer loves the cream embroidered kurta",
    caption: "literally cried it's so beautiful 😭💕",
    rotate: "-4deg",
    top: "48px",
    left: "2%",
    pinColor: "#E8888A",
    tape: true,
    sort_order: 1,
  },
  {
    id: "note-2",
    src: "/ig-review-2.png",
    alt: "Instagram DM: Customer got compliments at wedding",
    caption: "got SO many compliments 🌿✨",
    rotate: "3deg",
    top: "20px",
    left: "26%",
    pinColor: "#9B8EC4",
    tape: false,
    sort_order: 2,
  },
  {
    id: "note-3",
    src: "/ig-review-3.png",
    alt: "Instagram comments: customers raving about the maroon lawn",
    caption: "giving everything!! 😍🔥",
    rotate: "-2deg",
    top: "60px",
    left: "51%",
    pinColor: "#7DA88A",
    tape: true,
    sort_order: 3,
  },
  {
    id: "note-4",
    src: "/ig-review-4.png",
    alt: "Instagram story reply: 3 orders and counting 💗",
    caption: "one of a kind, literally 💗",
    rotate: "5deg",
    top: "30px",
    left: "74%",
    pinColor: "#E8B87A",
    tape: false,
    sort_order: 4,
  },
];

const LOCAL_STORAGE_KEY = "tt_love_notes_data";

function getLocalNotes(): LoveNote[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to read love notes from localStorage", e);
  }
  return DEFAULT_LOVE_NOTES;
}

function saveLocalNotes(notes: LoveNote[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    // Trigger custom event for same-tab reactive updates
    window.dispatchEvent(new Event("tt_love_notes_updated"));
  } catch (e) {
    console.error("Failed to save love notes to localStorage", e);
  }
}

export function useLoveNotes() {
  const [notes, setNotes] = useState<LoveNote[]>(getLocalNotes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync with localStorage changes across components
    const handleUpdate = () => {
      setNotes(getLocalNotes());
    };

    window.addEventListener("tt_love_notes_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // If Supabase table exists in non-mock mode, fetch from DB
    if (!isMockMode) {
      setLoading(true);
      supabase
        .from("love_notes")
        .select("*")
        .order("sort_order", { ascending: true })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setNotes(data as LoveNote[]);
            saveLocalNotes(data as LoveNote[]);
          }
          setLoading(false);
        });
    }

    return () => {
      window.removeEventListener("tt_love_notes_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addNote = async (newNote: Omit<LoveNote, "id" | "sort_order">) => {
    const id = `note-${Date.now()}`;
    const sort_order = notes.length + 1;
    const noteWithId: LoveNote = { ...newNote, id, sort_order };
    const updated = [...notes, noteWithId];

    setNotes(updated);
    saveLocalNotes(updated);

    if (!isMockMode) {
      await supabase.from("love_notes").insert(noteWithId as any);
    }
    return noteWithId;
  };

  const updateNote = async (id: string, updates: Partial<LoveNote>) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, ...updates } : n));
    setNotes(updated);
    saveLocalNotes(updated);

    if (!isMockMode) {
      await supabase.from("love_notes").update(updates as any).eq("id", id);
    }
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveLocalNotes(updated);

    if (!isMockMode) {
      await supabase.from("love_notes").delete().eq("id", id);
    }
  };

  const reorderNotes = async (reordered: LoveNote[]) => {
    const updated = reordered.map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));
    setNotes(updated);
    saveLocalNotes(updated);

    if (!isMockMode) {
      for (const item of updated) {
        await supabase.from("love_notes").upsert(item as any);
      }
    }
  };

  const resetToDefault = () => {
    setNotes(DEFAULT_LOVE_NOTES);
    saveLocalNotes(DEFAULT_LOVE_NOTES);
  };

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
    resetToDefault,
  };
}
