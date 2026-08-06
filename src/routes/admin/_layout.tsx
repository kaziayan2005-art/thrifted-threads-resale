import { createFileRoute, Outlet, Link, redirect, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, Package, Star, Tag, LogOut, ChevronRight,
} from "lucide-react";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

import { isDeviceTrusted, setDeviceTrusted } from "./login";

export const Route = createFileRoute("/admin/_layout")({
  beforeLoad: async () => {
    // Check Supabase session + admin role + trusted device flag
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !isDeviceTrusted()) {
      throw redirect({ to: "/admin/login" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

const navItems = [
  { to: "/admin",           label: "Dashboard",   icon: LayoutDashboard },
  { to: "/admin/listings",  label: "Listings",     icon: ShoppingBag },
  { to: "/admin/orders",    label: "Orders",       icon: Package },
  { to: "/admin/customers", label: "Customers",    icon: Users },
  { to: "/admin/reviews",   label: "Reviews",      icon: Star },
  { to: "/admin/settings",  label: "Settings",     icon: Settings },
] as const;

function AdminLayout() {
  const { signOut, profile } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9EEF2", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: "240px", flexShrink: 0,
        background: "#2C1A1A",
        display: "flex", flexDirection: "column",
        padding: "0",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo area */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: "#E8C4C4", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "4px" }}>Admin Portal</p>
          <p style={{ color: "#FFFBFC", fontFamily: "'Kalam', cursive", fontSize: "1.1rem", fontWeight: 700 }}>Thrifted Threads</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px", marginBottom: "2px",
                  color: active ? "#FFFBFC" : "#B09090",
                  background: active ? "#7D4757" : "transparent",
                  fontSize: "0.88rem", fontWeight: active ? 600 : 400,
                  textDecoration: "none", transition: "all 0.15s",
                }}
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", marginBottom: "8px" }}>
            <p style={{ color: "#E8C4C4", fontSize: "0.75rem", fontWeight: 600 }}>{profile?.name ?? "Admin"}</p>
            <p style={{ color: "#8A6A6A", fontSize: "0.7rem" }}>Administrator</p>
          </div>
          <button
            onClick={async () => {
              setDeviceTrusted(false);
              await signOut();
            }}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              width: "100%", padding: "9px 12px", borderRadius: "8px",
              background: "transparent", border: "none", cursor: "pointer",
              color: "#8A6A6A", fontSize: "0.85rem", transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E8888A")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8A6A6A")}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}

// ─── Breadcrumb helper ────────────────────────────────────────
export function AdminBreadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "#8A6A6A", marginBottom: "20px" }}>
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
      <h1 style={{ fontFamily: "'Kalam', cursive", fontSize: "1.8rem", color: "#2C1A1A", fontWeight: 700 }}>{title}</h1>
      {action}
    </div>
  );
}
