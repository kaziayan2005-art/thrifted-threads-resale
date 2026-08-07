import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { useShop } from "@/store/shop";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/condition-guide", label: "Condition & Authenticity" },
  { to: "/our-story", label: "Our Story" },
  { to: "/contact", label: "Contact" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const { user, loading } = useAuth();

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "rgba(247, 237, 232, 0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #E8C4C4",
        boxShadow: "0 1px 20px rgba(125,71,87,0.07)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ color: "#7D4757" }}
        >
          {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
        </button>

        <Logo className="h-12 w-auto md:h-14" />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="type-eyebrow transition-all duration-200 hover:text-accent hover:border-b-2 hover:border-accent hover:pb-[2px]"
              style={{ color: "#2C1A1A", letterSpacing: "0.18em", fontSize: "0.65rem" }}
              activeProps={{
                className: "type-eyebrow",
                style: { color: "#7D4757", borderBottom: "2px solid #7D4757", paddingBottom: "2px" },
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            aria-label="Search the shop"
            className="hidden sm:block cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:drop-shadow-sm"
            style={{ color: "#7D4757" }}
          >
            <Search className="size-5" strokeWidth={1.5} />
          </Link>
          <Link
            to="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} items`}
            className="group relative cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:drop-shadow-sm"
            style={{ color: "#7D4757" }}
          >
            <Heart className="size-5 transition-colors duration-200 group-hover:fill-[#7d4757]" strokeWidth={1.5} />
            {wishlist.length > 0 && <Dot n={wishlist.length} />}
          </Link>
          <Link
            to="/cart"
            aria-label={`Cart, ${cart.length} items`}
            className="relative cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:drop-shadow-sm"
            style={{ color: "#7D4757" }}
          >
            <ShoppingBag className="size-5" strokeWidth={1.5} />
            {cart.length > 0 && <Dot n={cart.length} />}
          </Link>
          {!loading && (
            user ? (
              <Link
                to="/account"
                aria-label="Your account"
                className="cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:drop-shadow-sm"
                style={{ color: "#7D4757" }}
              >
                <User className="size-5" strokeWidth={1.5} />
              </Link>
            ) : (
              <button
                type="button"
                aria-label="Sign in or create account"
                onClick={() => setAuthOpen(true)}
                className="cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:drop-shadow-sm"
                style={{ color: "#7D4757" }}
              >
                <User className="size-5" strokeWidth={1.5} />
              </button>
            )
          )}
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t px-4 py-4 md:hidden"
          style={{ borderColor: "#E8C4C4", background: "rgba(247,237,232,0.98)" }}
        >
          <ul className="space-y-4">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="type-eyebrow block py-1"
                  style={{ color: "#7D4757" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="border-t pt-4" style={{ borderColor: "#E8C4C4" }}>
              {user ? (
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="type-eyebrow block py-1"
                  style={{ color: "#7D4757" }}
                >
                  Account
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => { setOpen(false); setAuthOpen(true); }}
                  className="type-eyebrow block py-1"
                  style={{ color: "#7D4757" }}
                >
                  Sign in / Sign up
                </button>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function Dot({ n }: { n: number }) {
  return (
    <span
      className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full text-[10px]"
      style={{ background: "#7D4757", color: "#FDF6F2", fontWeight: 700 }}
    >
      {n}
    </span>
  );
}

const footerLinks = [
  { to: "/size-guide", label: "Size Guide" },
  { to: "/faq", label: "FAQ" },
  { to: "/returns", label: "Returns & Exchanges" },
  { to: "/account", label: "Account" },
] as const;

function Footer() {
  return (
    <footer
      className="mt-24"
      style={{
        borderTop: "1px solid #E8C4C4",
        background: "linear-gradient(180deg, #F7EDE8 0%, #F0E4E8 100%)",
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <Logo className="h-20 w-auto" />
          <p className="type-caption mt-4 max-w-xs" style={{ color: "#8A6A6A" }}>
            Pre-loved luxury, graded by hand in Lahore. One of everything, never restocked.
          </p>
        </div>
        <div>
          <h2 className="type-eyebrow mb-5" style={{ color: "#7D4757" }}>Good to know</h2>
          <ul className="space-y-3 text-sm">
            {footerLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="transition-colors"
                  style={{ color: "#5A3A3A" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#7D4757")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#5A3A3A")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="type-eyebrow mb-5" style={{ color: "#7D4757" }}>Talk to us</h2>
          <p className="text-sm" style={{ color: "#6A4A4A" }}>
            WhatsApp is our fastest channel — order updates and styling questions both live there.
          </p>
          <a
            href="https://wa.me/923332711821"
            rel="noreferrer noopener"
            target="_blank"
            className="mt-5 inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            style={{
              background: "#7D4757",
              color: "#FDF6F2",
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              boxShadow: "0 3px 12px rgba(125,71,87,0.25)",
            }}
          >
            Message on WhatsApp
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <div style={{ height: "1.5px", background: "linear-gradient(to right, #E8C4C4, #C8C0D8, #E8C4C4)", borderRadius: "9px", marginBottom: "1rem", opacity: 0.7 }} />
        <p className="type-caption">© {new Date().getFullYear()} Thrifted Threads. Every piece has a past.</p>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
