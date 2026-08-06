// Supabase client — initialized once, imported everywhere
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Thrifted Threads] Supabase env vars missing — running in mock-data mode. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to real data."
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const isMockMode = !supabaseUrl || !supabaseAnonKey || import.meta.env.VITE_USE_MOCK_DATA === "true";
