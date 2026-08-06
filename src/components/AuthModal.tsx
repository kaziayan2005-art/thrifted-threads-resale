import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: Mode;
  /** Shown as a contextual hint above the form — e.g. "Sign in to view your wishlist" */
  hint?: string;
}

export function AuthModal({ isOpen, onClose, defaultMode = "login", hint }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const reset = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
    setSuccessMessage(null);
    setShowPw(false);
    setSubmitting(false);
    setGoogleSubmitting(false);
  };

  const switchMode = (m: Mode) => {
    reset();
    setMode(m);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError("Invalid email or password. Please verify your credentials.");
        setSubmitting(false);
        return;
      }
      handleClose();
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setSubmitting(false);
        return;
      }

      const { data, error } = await signUp(email, password, name);

      if (error) {
        setError(
          error.message.includes("already registered") || error.message.includes("already in use")
            ? "An account with this email already exists. Try signing in instead."
            : error.message
        );
        setSubmitting(false);
        return;
      }

      if (data?.session) {
        handleClose();
      } else {
        const { error: signInErr } = await signIn(email, password);
        if (!signInErr) {
          handleClose();
        } else {
          setSuccessMessage(`Account created successfully! You can now sign in with ${email}.`);
          setSubmitting(false);
        }
      }
    }
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(44, 26, 26, 0.65)",
        backdropFilter: "blur(6px)",
        boxSizing: "border-box",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "440px",
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          backgroundColor: "#FDF6F2",
          border: "1.5px solid #7D4757",
          borderRadius: "16px",
          boxShadow: "0 24px 64px rgba(44, 26, 26, 0.4)",
          color: "#2C1A1A",
          fontFamily: "'DM Sans', sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #E8C4C4",
            backgroundColor: "#F7EDE8",
          }}
        >
          <div>
            <span
              style={{
                display: "block",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8A6A6A",
              }}
            >
              {mode === "login" ? "Welcome back" : "Create account"}
            </span>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#2C1A1A",
                marginTop: "2px",
                margin: 0,
              }}
            >
              {mode === "login" ? "Sign in to Thrifted Threads" : "Join Thrifted Threads"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              color: "#8A6A6A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {hint && !successMessage && (
            <div
              style={{
                marginBottom: "20px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #E8C4C4",
                backgroundColor: "#F9EEF2",
                fontSize: "0.8rem",
                color: "#5A3A3A",
              }}
            >
              {hint}
            </div>
          )}

          {/* Google SSO Button */}
          {!successMessage && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleSubmitting || submitting}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  border: "1.5px solid #D9C5BE",
                  backgroundColor: "#FFFFFF",
                  color: "#2C1A1A",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "background-color 0.15s, border-color 0.15s",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                {googleSubmitting ? (
                  <Loader2 size={18} className="animate-spin" color="#7D4757" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                Continue with Google
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "18px 0",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, height: "1px", backgroundColor: "#E8C4C4" }} />
                <span style={{ fontSize: "0.75rem", color: "#8A6A6A", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                  or
                </span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#E8C4C4" }} />
              </div>
            </>
          )}

          {successMessage ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <CheckCircle2 size={48} color="#7DA88A" style={{ margin: "0 auto 12px" }} strokeWidth={1.5} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2C1A1A" }}>Account Created!</h3>
              <p style={{ fontSize: "0.85rem", color: "#8A6A6A", marginTop: "8px", lineHeight: 1.5 }}>
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => switchMode("login")}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#7D4757",
                  color: "#FDF6F2",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Go to Sign In →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {mode === "signup" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#2C1A1A",
                      marginBottom: "6px",
                    }}
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sara Ahmed"
                    autoComplete="name"
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #D9C5BE",
                      backgroundColor: "#FFFFFF",
                      color: "#2C1A1A",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#2C1A1A",
                    marginBottom: "6px",
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1.5px solid #D9C5BE",
                    backgroundColor: "#FFFFFF",
                    color: "#2C1A1A",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#2C1A1A",
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    minLength={mode === "signup" ? 6 : 1}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 40px 10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #D9C5BE",
                      backgroundColor: "#FFFFFF",
                      color: "#2C1A1A",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#8A6A6A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #E5C3C3",
                    backgroundColor: "#FDF2F2",
                    color: "#C0392B",
                    fontSize: "0.8rem",
                    lineHeight: 1.4,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || googleSubmitting}
                style={{
                  marginTop: "8px",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#7D4757",
                  color: "#FDF6F2",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: submitting ? "wait" : "pointer",
                  opacity: submitting ? 0.75 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(125, 71, 87, 0.25)",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </>
                ) : mode === "login" ? (
                  "Sign in with Email"
                ) : (
                  "Create Account with Email"
                )}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#8A6A6A", marginTop: "4px" }}>
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#7D4757",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#7D4757",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
