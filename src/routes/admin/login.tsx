import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

const TRUSTED_DEVICE_KEY = "tt_admin_trusted_device";

export function isDeviceTrusted(): boolean {
  return localStorage.getItem(TRUSTED_DEVICE_KEY) === "true";
}

export function setDeviceTrusted(trusted: boolean): void {
  if (trusted) {
    localStorage.setItem(TRUSTED_DEVICE_KEY, "true");
  } else {
    localStorage.removeItem(TRUSTED_DEVICE_KEY);
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
  if (!loading && role === "admin" && isDeviceTrusted()) {
    navigate({ to: "/admin" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError("Invalid credentials. Please try again.");
      setSubmitting(false);
      return;
    }

    // Use SECURITY DEFINER function — bypasses RLS, always returns correct role
    const { data: myRole, error: roleError } = await supabase.rpc("get_my_role");

    if (roleError) {
      setError("Could not verify account role. Please try again.");
      await supabase.auth.signOut();
      setSubmitting(false);
      return;
    }

    if (myRole === "admin") {
      setDeviceTrusted(trustDevice);
      navigate({ to: "/admin" });
    } else {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #F9EEF2 0%, #F0E8F4 50%, #EEE8F8 100%)",
      fontFamily: "'DM Sans', sans-serif", padding: "24px",
    }}>
      <div style={{
        background: "#FFFBFC", borderRadius: "20px", padding: "40px 36px",
        border: "1.5px solid #E8C4C4",
        boxShadow: "0 8px 40px rgba(125,71,87,0.12)",
        width: "100%", maxWidth: "400px",
      }}>
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
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com" required autoComplete="email"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E8C4C4", background: "#F9EEF2", color: "#2C1A1A", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5A3A3A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
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
            type="submit" disabled={submitting}
            style={{
              width: "100%", padding: "12px", borderRadius: "10px",
              background: "linear-gradient(135deg, #7D4757, #9B6070)",
              color: "#fff", fontWeight: 700, fontSize: "0.92rem", border: "none",
              cursor: submitting ? "wait" : "pointer",
              boxShadow: "0 4px 16px rgba(125,71,87,0.3)",
              opacity: submitting ? 0.8 : 1, transition: "opacity 0.15s",
            }}
          >
            {submitting ? "Signing in…" : "Sign in to Admin"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.78rem", color: "#8A6A6A" }}>
          Admin access only. <a href="/" style={{ color: "#7D4757", textDecoration: "none", fontWeight: 600 }}>← Back to shop</a>
        </p>
      </div>
    </div>
  );
}
