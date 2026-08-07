import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { KeyRound, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/reset-password")({
  component: AdminResetPassword,
});

function AdminResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message || "Failed to update password. Link may have expired.");
    } else {
      setSuccess(true);
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
          maxWidth: "420px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ fontFamily: "'Kalam', cursive", fontSize: "1.8rem", color: "#7D4757", fontWeight: 700, lineHeight: 1 }}>
            Thrifted Threads
          </p>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A6A6A", marginTop: "6px" }}>
            Set New Password
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <CheckCircle2 size={48} color="#5B9A68" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2C1A1A", marginBottom: "8px" }}>
              Password Updated Successfully!
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#5A3A3A", lineHeight: 1.5, marginBottom: "24px" }}>
              Your admin account password has been reset. Your old password no longer works. You can now log in with your new credentials.
            </p>
            <button
              onClick={() => navigate({ to: "/admin/login" })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7D4757, #9B6070)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.92rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(125,71,87,0.3)",
              }}
            >
              Sign In to Admin Portal →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5A3A3A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: "10px", border: "1.5px solid #E8C4C4", background: "#F9EEF2", color: "#2C1A1A", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8A6A6A", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5A3A3A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E8C4C4", background: "#F9EEF2", color: "#2C1A1A", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <div style={{ background: "#FDEAEA", border: "1.5px solid #C08080", borderRadius: "8px", padding: "10px 14px", color: "#C08080", fontSize: "0.82rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: "8px",
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving New Password…
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Update Password
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
