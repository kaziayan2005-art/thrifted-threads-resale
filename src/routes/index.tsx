import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Ruler, ScanLine, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { useListings } from "@/hooks/useListings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thrifted Threads — Pre-Loved Luxury, One of Everything" },
      {
        name: "description",
        content:
          "Curated single-unit resale: condition-graded designer and photoshoot-sample clothing, with honest flaw photos and Shop the Shoot stories.",
      },
      { property: "og:title", content: "Thrifted Threads — Pre-Loved Luxury" },
      {
        property: "og:description",
        content: "Condition-graded, single-unit pre-loved fashion. Only one of everything.",
      },
    ],
  }),
  component: Home,
});


const trust = [
  { icon: ScanLine,  title: "Graded by hand",      body: "Four condition tiers, applied by the same two people, every time.",            bg: "#F0E0E8" },
  { icon: Sparkles,  title: "Flaws photographed",  body: "If there's a mark, you see it close up before you buy.",                       bg: "#E0E0F0" },
  { icon: Leaf,      title: "Impact counted",       body: "Every order tallies the water and carbon your choice kept out of landfill.",    bg: "#E8F0E0" },
  { icon: Ruler,     title: "Measured flat",        body: "Real measurements, not brand size guesswork.",                                  bg: "#F0EDE0" },
];

function Home() {
  const { data: listings = [], isLoading } = useListings();
  const arrivals = listings.slice(0, 8);
  const best = listings.filter((p) => p.bestSeller);

  return (
    <SiteLayout>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          }}
        >
          {/* Top-left blob */}
          <div style={{
            position: "absolute", top: "-80px", left: "-100px",
            width: "420px", height: "420px",
            borderRadius: "50% 70% 60% 40% / 60% 40% 70% 50%",
            background: "#B87A8A", opacity: 0.18,
            filter: "blur(2px)",
          }} />
          {/* Bottom-right blob */}
          <div style={{
            position: "absolute", bottom: "-60px", right: "-80px",
            width: "340px", height: "340px",
            borderRadius: "60% 40% 50% 70% / 50% 60% 40% 60%",
            background: "#C8C0D8", opacity: 0.22,
            filter: "blur(2px)",
          }} />
          {/* Small accent blob */}
          <div style={{
            position: "absolute", top: "40%", left: "40%",
            width: "180px", height: "180px",
            borderRadius: "40% 60% 70% 30% / 60% 30% 70% 40%",
            background: "#E8C4C4", opacity: 0.2,
            filter: "blur(1px)",
          }} />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-14 md:grid-cols-2 md:pt-24" style={{ zIndex: 1 }}>
          <div className="animate-float-in">
            <p className="type-eyebrow" style={{ color: "#7D4757", letterSpacing: "0.22em" }}>
              Lahore · Est. 2025
            </p>
            <h1 className="type-h1 mt-4" style={{ lineHeight: 1.08 }}>
              Every piece has<br />a past.
            </h1>
            {/* Decorative underline like reference */}
            <div style={{
              width: "180px", height: "4px", marginTop: "8px",
              background: "linear-gradient(to right, #7D4757, #C8C0D8)",
              borderRadius: "9px", opacity: 0.7,
            }} />
            <p className="mt-6 max-w-md text-base leading-relaxed" style={{ color: "#6A4A4A" }}>
              Single-wear, photoshoot-sample and gently-used clothing, graded honestly and sold once.
              No restocks, no mystery bins — just one of everything, with its story attached.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                style={{
                  background: "#7D4757", color: "#FDF6F2",
                  padding: "0.75rem 1.75rem",
                  borderRadius: "0.6rem",
                  fontSize: "0.9rem", fontWeight: 600,
                  letterSpacing: "0.04em",
                  border: "none",
                  boxShadow: "0 4px 18px rgba(125,71,87,0.28)",
                  transition: "opacity 0.2s, transform 0.15s",
                  display: "inline-block",
                }}
                className="hover:opacity-90 hover:-translate-y-0.5"
              >
                Shop new arrivals
              </Link>
              <Link
                to="/shop"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  color: "#7D4757",
                  padding: "0.75rem 1.75rem",
                  borderRadius: "0.6rem",
                  fontSize: "0.9rem", fontWeight: 600,
                  letterSpacing: "0.04em",
                  border: "1.5px solid #D9C5BE",
                  transition: "background 0.2s, transform 0.15s",
                  display: "inline-block",
                  backdropFilter: "blur(4px)",
                }}
                className="hover:bg-white hover:-translate-y-0.5"
              >
                Browse all
              </Link>
            </div>
          </div>

          {/* Right side — clothing rack hero image */}
          <div
            style={{
              borderRadius: "1.5rem",
              overflow: "hidden",
              boxShadow: "0 8px 48px rgba(125,71,87,0.22)",
              border: "3px solid rgba(255,255,255,0.7)",
              background: "#EDD8D0",
              minHeight: "340px",
            }}
          >
            <img
              src="/hero-rack.jpg"
              alt="Pre-loved Pakistani clothing on a rack — colourful kurtis in cream, pink, sage, yellow, rust and maroon"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                minHeight: "340px",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Trust pillars ─────────────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.5)", borderTop: "1px solid #E8C4C4", borderBottom: "1px solid #E8C4C4" }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((t) => (
              <li
                key={t.title}
                style={{
                  background: "rgba(255,255,255,0.72)",
                  border: "1.5px solid #E8C4C4",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  boxShadow: "0 2px 12px rgba(125,71,87,0.06)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  display: "flex", flexDirection: "column", gap: "0.5rem",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(125,71,87,0.14)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(125,71,87,0.06)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: "2.5rem", height: "2.5rem",
                  borderRadius: "0.6rem",
                  background: t.bg,
                  display: "grid", placeItems: "center",
                }}>
                  <t.icon className="size-5" strokeWidth={1.5} style={{ color: "#7D4757" }} aria-hidden />
                </div>
                <h2 className="type-h3" style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{t.title}</h2>
                <p className="type-caption">{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── New arrivals ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="type-h2">New arrivals</h2>
          <Link
            to="/shop"
            style={{ color: "#7D4757", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.08em", textDecoration: "underline", textUnderlineOffset: "4px" }}
          >
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {isLoading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : arrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── Best loved ────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #F5E8EE 0%, #EEE8F5 100%)", borderTop: "1px solid #E8C4C4", borderBottom: "1px solid #E8C4C4" }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="type-h2 mb-8">Best loved this month</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {isLoading
              ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
              : best.length > 0
                ? best.map((p) => <ProductCard key={p.id} product={p} />)
                : arrivals.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── Love notes softboard ──────────────────────────── */}
      <SoftboardSection />
    </SiteLayout>
  );
}

/* ─── Polaroid Softboard Section ─────────────────────────── */

const reviews = [
  {
    src: "/ig-review-1.png",
    alt: "Instagram DM: Customer loves the cream embroidered kurta",
    caption: "literally cried it's so beautiful 😭💕",
    rotate: "-4deg",
    top: "48px",
    left: "2%",
    pinColor: "#E8888A",
    tape: true,
  },
  {
    src: "/ig-review-2.png",
    alt: "Instagram DM: Customer got compliments at wedding",
    caption: "got SO many compliments 🌿✨",
    rotate: "3deg",
    top: "20px",
    left: "26%",
    pinColor: "#9B8EC4",
    tape: false,
  },
  {
    src: "/ig-review-3.png",
    alt: "Instagram comments: customers raving about the maroon lawn",
    caption: "giving everything!! 😍🔥",
    rotate: "-2deg",
    top: "60px",
    left: "51%",
    pinColor: "#7DA88A",
    tape: true,
  },
  {
    src: "/ig-review-4.png",
    alt: "Instagram story reply: 3 orders and counting 💗",
    caption: "one of a kind, literally 💗",
    rotate: "5deg",
    top: "30px",
    left: "74%",
    pinColor: "#E8B87A",
    tape: false,
  },
];

function PushPin({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", zIndex: 3 }}>
      {/* Pin head */}
      <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, white 0%, ${color} 55%)`, boxShadow: `0 3px 8px ${color}99, 0 1px 3px rgba(0,0,0,0.15)`, border: "1.5px solid rgba(255,255,255,0.6)" }} />
      {/* Pin stem */}
      <div style={{ width: "2px", height: "12px", background: "linear-gradient(to bottom, #C8A0B0, #A07888)", borderRadius: "0 0 2px 2px", marginTop: "-2px" }} />
    </div>
  );
}

function Tape() {
  return (
    <div style={{
      position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)",
      width: "64px", height: "20px",
      background: "rgba(232, 196, 212, 0.55)",
      borderRadius: "3px",
      boxShadow: "0 1px 4px rgba(125,71,87,0.1)",
      border: "1px solid rgba(200,160,180,0.35)",
      zIndex: 3,
    }} />
  );
}

function SoftboardSection() {
  return (
    <section
      style={{
        background: `
          radial-gradient(ellipse at 15% 60%, rgba(200,160,190,0.22) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 25%, rgba(200,192,216,0.28) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 90%, rgba(232,196,196,0.2) 0%, transparent 50%),
          repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(125,71,87,0.03) 32px, rgba(125,71,87,0.03) 33px),
          repeating-linear-gradient(90deg, transparent, transparent 32px, rgba(125,71,87,0.03) 32px, rgba(125,71,87,0.03) 33px),
          linear-gradient(160deg, #F9EEF2 0%, #F0E8F4 35%, #EEE8F8 60%, #F5EAF0 100%)
        `,
        padding: "72px 16px 80px",
        borderTop: "3px solid #E8C4C4",
        borderBottom: "3px solid #E8C4C4",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft vignette */}
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 80px rgba(125,71,87,0.08)", pointerEvents: "none", zIndex: 0 }} />

      {/* Decorative corner gems (mauve/blush) */}
      {[
        { top: "14px", left: "14px", c: "#C48090" },
        { top: "14px", right: "14px", c: "#9B8EC4" },
        { bottom: "14px", left: "14px", c: "#9B8EC4" },
        { bottom: "14px", right: "14px", c: "#C48090" },
      ].map((p, i) => (
        <div key={i} style={{ position: "absolute", ...p, c: undefined, width: "12px", height: "12px", borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, #fff 0%, ${p.c} 60%)`, boxShadow: `0 2px 6px ${p.c}66`, zIndex: 1 }} />
      ))}

      <div className="mx-auto max-w-6xl" style={{ position: "relative", zIndex: 2 }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p className="type-eyebrow" style={{ color: "#7D4757", letterSpacing: "0.22em" }}>straight from instagram</p>
          <h2 className="type-h2" style={{ color: "#2C1A1A", marginTop: "8px" }}>Love notes 💌</h2>
          <p style={{ color: "#8A6A6A", fontSize: "0.95rem", marginTop: "8px" }}>
            Real messages from our girls — unedited, unfiltered.
          </p>
        </div>

        {/* Polaroids board */}
        <div style={{ position: "relative", minHeight: "420px" }}>
          {reviews.map((r) => (
            <div
              key={r.src}
              style={{
                position: "absolute",
                top: r.top,
                left: r.left,
                width: "clamp(180px, 20vw, 230px)",
                transform: `rotate(${r.rotate})`,
                transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s",
                cursor: "pointer",
                zIndex: 2,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "rotate(0deg) scale(1.07)";
                (e.currentTarget as HTMLElement).style.zIndex = "10";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 50px rgba(125,71,87,0.25), 0 4px 16px rgba(125,71,87,0.15)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = `rotate(${r.rotate}) scale(1)`;
                (e.currentTarget as HTMLElement).style.zIndex = "2";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {/* Push pin or tape */}
              {r.tape ? <Tape /> : <PushPin color={r.pinColor} />}

              {/* Polaroid frame */}
              <div style={{
                background: "#FFFBFC",
                padding: "10px 10px 38px 10px",
                boxShadow: "0 8px 28px rgba(125,71,87,0.18), 0 2px 8px rgba(125,71,87,0.08)",
                borderRadius: "4px",
                border: "1px solid rgba(232,196,204,0.5)",
              }}>
                {/* Screenshot image */}
                <img
                  src={r.src}
                  alt={r.alt}
                  style={{
                    width: "100%",
                    aspectRatio: "4/5",
                    objectFit: "cover",
                    objectPosition: "top",
                    display: "block",
                    borderRadius: "1px",
                  }}
                />
                {/* Polaroid caption strip */}
                <p style={{
                  fontFamily: "'Kalam', cursive",
                  fontSize: "0.82rem",
                  color: "#7D4757",
                  textAlign: "center",
                  marginTop: "12px",
                  lineHeight: 1.35,
                  padding: "0 4px",
                }}>
                  {r.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "80px" }}>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer noopener"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)",
              color: "#fff",
              padding: "0.7rem 1.6rem",
              borderRadius: "999px",
              fontSize: "0.88rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              boxShadow: "0 4px 20px rgba(131,58,180,0.35)",
              textDecoration: "none",
              transition: "opacity 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Follow us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
