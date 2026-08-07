import { createFileRoute, Outlet, Link, redirect, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingBag, Package, Star, Tag, LogOut, ChevronRight, Menu, X, Users, Settings, Heart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isMockMode } from "@/lib/supabase";
import { isDeviceTrusted, setDeviceTrusted } from "./admin/login";

export async function checkAdminAuth() {
  // On server-side rendering (SSR), pass through to let the client browser verify session & role
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (isMockMode) {
      if (!isDeviceTrusted()) {
        throw redirect({ to: "/admin/login" });
      }
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !isDeviceTrusted()) {
      throw redirect({ to: "/admin/login" });
    }

    const { data: myRole } = await supabase.rpc("get_my_role");
    let userRole = myRole;

    if (!userRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      userRole = profile?.role;
    }

    if (userRole !== "admin") throw redirect({ to: "/" });
  } catch (err: any) {
    if (err && typeof err === "object" && ("isRedirect" in err || "to" in err || "status" in err || err.statusCode === 302 || err.statusCode === 307 || err.statusCode === 308 || err.type === "redirect")) {
      throw err;
    }
    console.error("Admin auth check error:", err);
    throw redirect({ to: "/admin/login" });
  }
}

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login" || location.pathname === "/admin/reset-password") {
      return;
    }
    await checkAdminAuth();
  },
  component: AdminLayoutRouteComponent,
});

const navItems = [
  { to: "/admin",           label: "Dashboard",   icon: LayoutDashboard },
  { to: "/admin/listings",  label: "Listings",     icon: ShoppingBag },
  { to: "/admin/orders",    label: "Orders",       icon: Package },
  { to: "/admin/customers", label: "Customers",    icon: Users },
  { to: "/admin/reviews",   label: "Reviews",      icon: Star },
  { to: "/admin/love-notes",label: "Love Notes",   icon: Heart },
  { to: "/admin/settings",  label: "Settings",     icon: Settings },
] as const;

function AdminLayoutRouteComponent() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Render child routes directly without sidebar wrapper for login & reset password
  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return <Outlet />;
  }

  return <AdminLayout />;
}

function AdminLayout() {
  const { signOut, profile } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setDeviceTrusted(false);
    await signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F9EEF2", fontFamily: "'DM Sans', sans-serif" }}>
      {/* CSS rules for responsive layout */}
      <style>{`
        @media (min-width: 768px) {
          .admin-layout-container {
            flex-direction: row !important;
          }
          .admin-sidebar {
            display: flex !important;
            position: sticky !important;
            transform: none !important;
            top: 0;
            height: 100vh;
          }
          .admin-mobile-header {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .admin-layout-container {
            flex-direction: column !important;
          }
          .admin-sidebar {
            display: ${mobileOpen ? "flex" : "none"} !important;
            position: fixed !important;
            top: 52px;
            left: 0;
            right: 0;
            bottom: 0;
            height: calc(100vh - 52px);
            z-index: 9999;
          }
        }
      `}</style>

      {/* Mobile Top Header */}
      <header className="admin-mobile-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#2C1A1A", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#fff", position: "sticky", top: 0, zIndex: 99999 }}>
        <div>
          <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "#E8C4C4", margin: 0 }}>Admin Portal</p>
          <p style={{ fontFamily: "'Kalam', cursive", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Thrifted Threads</p>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600 }}
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />} Menu
        </button>
      </header>

      <div className="admin-layout-container" style={{ display: "flex", flex: 1, minWidth: 0 }}>
        {/* Sidebar */}
        <aside
          className="admin-sidebar"
          style={{
            width: "250px",
            backgroundColor: "#2C1A1A",
            flexDirection: "column",
            flexShrink: 0,
            zIndex: 9990,
            overflowY: "auto",
          }}
        >
          {/* Logo area */}
          <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color: "#E8C4C4", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "4px" }}>Admin Portal</p>
            <p style={{ color: "#FFFBFC", fontFamily: "'Kalam', cursive", fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Thrifted Threads</p>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "14px 10px" }}>
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "11px 14px", borderRadius: "8px", marginBottom: "4px",
                    color: active ? "#FFFBFC" : "#B09090",
                    background: active ? "#7D4757" : "transparent",
                    fontSize: "0.88rem", fontWeight: active ? 600 : 400,
                    textDecoration: "none", transition: "all 0.15s",
                  }}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User + sign out */}
          <div style={{ padding: "14px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", marginBottom: "10px" }}>
              <p style={{ color: "#E8C4C4", fontSize: "0.78rem", fontWeight: 600, margin: 0 }}>{profile?.name ?? "Admin"}</p>
              <p style={{ color: "#8A6A6A", fontSize: "0.7rem", margin: "2px 0 0" }}>Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                background: "rgba(232, 136, 138, 0.15)", border: "1px solid rgba(232, 136, 138, 0.3)", cursor: "pointer",
                color: "#FFDADA", fontSize: "0.85rem", fontWeight: 600, transition: "background 0.15s",
              }}
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Breadcrumb helper ────────────────────────────────────────
export function AdminBreadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "#8A6A6A", marginBottom: "20px", flexWrap: "wrap" }}>
      <Link to="/admin" style={{ color: "#7D4757", textDecoration: "none" }}>Admin</Link>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ChevronRight size={12} />
          {item.to
            ? <Link to={item.to} style={{ color: "#7D4757", textDecoration: "none" }}>{item.label}</Link>
            : <span style={{ color: "#2C1A1A" }}>{item.label}</span>
          }
        </span>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────
export function StatCard({ label, value, color = "#7D4757", to, search }: { label: string; value: number | string; color?: string; to?: string; search?: Record<string, string> }) {
  const content = (
    <div style={{
      background: "#FFFBFC", borderRadius: "12px", padding: "20px 24px",
      border: "1.5px solid #E8C4C4",
      boxShadow: "0 2px 12px rgba(125,71,87,0.06)",
      transition: "transform 0.15s, border-color 0.15s",
      cursor: to ? "pointer" : "default",
    }}>
      <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8A6A6A", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontSize: "2rem", fontWeight: 700, color, fontFamily: "'Kalam', cursive" }}>{value}</p>
    </div>
  );

  if (to) {
    return (
      <Link to={to} search={search} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}

// ─── Page header ─────────────────────────────────────────────
export function AdminPageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 style={{ fontFamily: "'Kalam', cursive", fontSize: "1.8rem", color: "#2C1A1A", fontWeight: 700, margin: 0 }}>{title}</h1>
      {action && <div className="flex items-center gap-2 flex-wrap">{action}</div>}
    </div>
  );
}
