import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import type { User, Session, AuthResponse } from "@supabase/supabase-js";
import { supabase, isMockMode } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: "buyer" | "admin" | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ data: AuthResponse["data"] | null; error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, session: null, profile: null, role: null, loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ data: null, error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) { setLoading(false); return; }

    // Detect password recovery link redirect in URL hash or query params
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      if ((hash.includes("type=recovery") || search.includes("type=recovery")) && !window.location.pathname.startsWith("/admin/reset-password")) {
        window.location.href = "/admin/reset-password" + hash;
        return;
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }

      if (event === "PASSWORD_RECOVERY" && typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/reset-password")) {
        window.location.href = "/admin/reset-password";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data ?? null);
    setLoading(false);
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });
    return { data: res.data, error: res.error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/account`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile,
      role: profile?.role ?? null,
      loading, signIn, signUp, signInWithGoogle, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useIsAdmin = () => useContext(AuthContext).role === "admin";
