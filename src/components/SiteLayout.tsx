import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { useShop } from "@/store/shop";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/our-story", label: "Our Story" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/condition-guide", label: "Condition & Authenticity" },
  { to: "/sustainability", label: "Impact" },
  { to: "/contact", label: "Contact" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" strokeWidth={1.25} /> : <Menu className="size-5" strokeWidth={1.25} />}
        </button>

        <Logo className="h-12 w-auto md:h-14" />

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="type-eyebrow transition-opacity hover:opacity-60"
              activeProps={{ className: "type-eyebrow underline underline-offset-4" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/shop" aria-label="Search the shop" className="hidden sm:block">
            <Search className="size-5" strokeWidth={1.25} />
          </Link>
          <Link to="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`} className="relative">
            <Heart className="size-5" strokeWidth={1.25} />
            {wishlist.length > 0 && <Dot n={wishlist.length} />}
          </Link>
          <Link to="/cart" aria-label={`Cart, ${cart.length} items`} className="relative">
            <ShoppingBag className="size-5" strokeWidth={1.25} />
            {cart.length > 0 && <Dot n={cart.length} />}
          </Link>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-foreground/15 px-4 py-3 md:hidden">
          <ul className="space-y-3">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} onClick={() => setOpen(false)} className="type-eyebrow">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function Dot({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-accent text-[10px] text-accent-foreground">
      {n}
    </span>
  );
}

const footerLinks = [
  { to: "/size-guide", label: "Size Guide" },
  { to: "/journal", label: "Style Edit" },
  { to: "/faq", label: "FAQ" },
  { to: "/returns", label: "Returns & Exchanges" },
  { to: "/account", label: "Account" },
] as const;

function Footer() {
  return (
    <footer className="mt-24 border-t border-foreground/15">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <Logo className="h-20 w-auto" />
          <p className="type-caption mt-4 max-w-xs">
            Pre-loved luxury, graded by hand in Lahore. One of everything, never restocked.
          </p>
        </div>
        <div>
          <h2 className="type-eyebrow mb-4">Good to know</h2>
          <ul className="space-y-2 text-sm">
            {footerLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:underline underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="type-eyebrow mb-4">Talk to us</h2>
          <p className="text-sm">
            WhatsApp is our fastest channel — order updates and styling questions both live there.
          </p>
          <a
            href="https://wa.me/923000000000"
            className="ink-tag mt-4 hover:bg-secondary"
            rel="noreferrer noopener"
            target="_blank"
          >
            Message on WhatsApp
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <div className="ink-rule mb-4" />
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
