import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isMockMode } from "@/lib/supabase";
import { ShieldCheck, KeyRound, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

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

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  // Already logged in as admin AND device is trusted → redirect
  if (!loading && role === "admin" && isDeviceTrusted()) {
    navigate({ to: "/admin" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (isMockMode) {
      // In mock mode, allow admin sign-in seamlessly
      setDeviceTrusted(trustDevice);
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
      setDeviceTrusted(trustDevice);
      navigate({ to: "/admin" });
    } else {
      await supabase.auth.signOut();
      setError(
        `This account (${email}) does not have admin privileges. (Current role: ${finalRole || "buyer"}). Update its role in your Supabase 'profiles' table.`
      );
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitting(true);
    setError("");

    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      setForgotSubmitting(false);
      return;
    }

    if (!isMockMode) {
      // Execute server-side SECURITY DEFINER RPC check against auth.users & profiles table (role = 'admin')
      const { data: isAdmin, error: rpcError } = await supabase.rpc("check_is_admin_email", {
        p_email: trimmedEmail,
      });

      // If RPC executed cleanly and explicitly returned false -> User is not an admin
      if (!rpcError && isAdmin === false) {
        setError("No admin account found with this email.");
        setForgotSubmitting(false);
        return;
      }

      if (rpcError) {
        console.warn(
          "[Thrifted Threads] RPC 'check_is_admin_email' error:",
          rpcError.message,
          "— Proceeding with Supabase Auth reset."
        );
      }

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (resetErr) {
        setError(resetErr.message);
        setForgotSubmitting(false);
        return;
      }
    } else {
      // Mock mode: simulate success for testing
      setForgotSubmitting(false);
      setForgotSent(true);
      return;
    }

    setForgotSubmitting(false);
    setForgotSent(true);
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
            {mode === "login" ? "Admin Portal" : "Reset Admin Password"}
          </p>
        </div>

        {mode === "login" ? (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5A3A3A", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSent(false);
                    setMode("forgot");
                  }}
                  style={{ background: "none", border: "none", color: "#7D4757", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                >
                  Forgot Password?
                </button>
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
        ) : (
          <div>
            {forgotSent ? (
              <div style={{ textAlign: "center" }}>
                <CheckCircle2 size={44} color="#5B9A68" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#2C1A1A", marginBottom: "8px" }}>
                  Check your inbox
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#5A3A3A", lineHeight: 1.5, marginBottom: "24px" }}>
                  If an account with <strong>{forgotEmail || "that email"}</strong> is registered, we have sent a secure password reset link to it.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "10px",
                    background: "#7D4757",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ fontSize: "0.85rem", color: "#5A3A3A", marginBottom: "18px", lineHeight: 1.4 }}>
                  Enter your registered admin email address below. We'll send you a link to reset your password.
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5A3A3A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E8C4C4", background: "#F9EEF2", color: "#2C1A1A", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                {error && (
                  <div style={{ background: "#FDEAEA", border: "1.5px solid #C08080", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#C08080", fontSize: "0.82rem" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #7D4757, #9B6070)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    border: "none",
                    cursor: forgotSubmitting ? "wait" : "pointer",
                    boxShadow: "0 4px 16px rgba(125,71,87,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {forgotSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending Link…
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} /> Send Reset Link
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("login")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "16px",
                    background: "none",
                    border: "none",
                    color: "#7D4757",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </form>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.78rem", color: "#8A6A6A" }}>
          Admin access only. <a href="/" style={{ color: "#7D4757", textDecoration: "none", fontWeight: 600 }}>← Back to shop</a>
        </p>
      </div>
    </div>
  );
}
