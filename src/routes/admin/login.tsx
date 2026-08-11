import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isMockMode } from "@/lib/supabase";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

const ADMIN_SESSION_KEY = "tt_admin_session";

export function isDeviceTrusted(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setDeviceTrusted(trusted: boolean): void {
  if (typeof window === "undefined") return;
  if (trusted) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
  } else {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem("tt_admin_trusted_device");
  }
}

function AdminLogin() {
  const { signIn, role, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as admin AND device is trusted → redirect
  if (isDeviceTrusted() && (isMockMode || (!loading && role === "admin"))) {
    navigate({ to: "/admin" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (isMockMode) {
      // In mock mode, allow admin sign-in seamlessly
      setDeviceTrusted(true);
      navigate({ to: "/admin" });
      setSubmitting(false);
      return;
    }

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError("Invalid credentials. Please verify your email and password.");
      setSubmitting(false);
      return;
    }

    // Use SECURITY DEFINER RPC to get account role
    const { data: myRole, error: roleError } = await supabase.rpc("get_my_role");

    let finalRole = myRole;

    if (roleError) {
      // Fallback: Query profiles table directly
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        finalRole = prof?.role;
      }
    }

    if (finalRole === "admin") {
      setDeviceTrusted(true);
      navigate({ to: "/admin" });
    } else {
      await supabase.auth.signOut();
      setError(
        `This account (${email}) does not have admin privileges. (Current role: ${finalRole || "buyer"}). Update its role in your Supabase 'profiles' table.`
      );
      setSubmitting(false);
    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #F9EEF2 0%, #F0E8F4 50%, #EEE8F8 100%)",
        fontFamily: "'DM Sans', sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#FFFBFC",
          borderRadius: "20px",
          padding: "40px 36px",
          border: "1.5px solid #E8C4C4",
          boxShadow: "0 8px 40px rgba(125,71,87,0.12)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ fontFamily: "'Kalam', cursive", fontSize: "1.8rem", color: "#7D4757", fontWeight: 700, lineHeight: 1 }}>
            Thrifted Threads
          </p>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A6A6A", marginTop: "6px" }}>
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5A3A3A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E8C4C4", background: "#F9EEF2", color: "#2C1A1A", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5A3A3A", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E8C4C4", background: "#F9EEF2", color: "#2C1A1A", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Trust this device checkbox */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.82rem", color: "#5A3A3A" }}>
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  style={{ accentColor: "#7D4757", width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <ShieldCheck size={15} color="#7D4757" /> Trust this device (stay signed in)
                </span>
              </label>
            </div>

            {error && (
              <div style={{ background: "#FDEAEA", border: "1.5px solid #C08080", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#C08080", fontSize: "0.82rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7D4757, #9B6070)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.92rem",
                border: "none",
                cursor: submitting ? "wait" : "pointer",
                boxShadow: "0 4px 16px rgba(125,71,87,0.3)",
                opacity: submitting ? 0.8 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {submitting ? "Signing in…" : "Sign in to Admin"}
            </button>
          </form>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.78rem", color: "#8A6A6A" }}>
          Admin access only. <a href="/" style={{ color: "#7D4757", textDecoration: "none", fontWeight: 600 }}>← Back to shop</a>
        </p>
      </div>
    </div>
  );
}
