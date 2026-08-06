// Auto-generated types — after Supabase project is created, run:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
// This file is a hand-written approximation matching the schema in 001_initial_schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "buyer" | "admin";
          name: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: "buyer" | "admin";
          name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          role?: "buyer" | "admin";
          name?: string | null;
          phone?: string | null;
        };
      };
      listings: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          brand: string;
          size: string;
          color: string;
          occasion: string;
          condition_grade: string;
          flaw_notes: Json;
          fabric_details: string;
          measurements: string;
          original_price: number;
          resale_price: number;
          water_saved_l: number;
          carbon_saved_kg: number;
          status: "draft" | "published" | "reserved" | "sold" | "delisted";
          shoot_story: Json | null;
          best_seller: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      listing_photos: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          public_url: string;
          alt_text: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listing_photos"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["listing_photos"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string | null;
          status: "pending" | "paid" | "fulfilled" | "cancelled";
          total: number;
          payment_provider: "stripe";
          payment_reference: string | null;
          stripe_session_id: string | null;
          shipping_address: Json;
          whatsapp_notified: boolean;
          email_notified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          listing_id: string | null;
          price_at_purchase: number;
          listing_snapshot: Json;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      wishlists: {
        Row: {
          id: string;
          buyer_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wishlists"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["wishlists"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          listing_id: string | null;
          order_id: string | null;
          buyer_id: string;
          rating: number;
          comment: string;
          photo_url: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      grading_definitions: {
        Row: { id: string; label: string; description: string; sort_order: number; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["grading_definitions"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["grading_definitions"]["Insert"]>;
      };
      sustainability_impact: {
        Row: { id: string; item_type: string; water_saved_l: number; carbon_saved_kg: number };
        Insert: Omit<Database["public"]["Tables"]["sustainability_impact"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["sustainability_impact"]["Insert"]>;
      };
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type ListingPhoto = Database["public"]["Tables"]["listing_photos"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type WishlistItem = Database["public"]["Tables"]["wishlists"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type GradingDefinition = Database["public"]["Tables"]["grading_definitions"]["Row"];
