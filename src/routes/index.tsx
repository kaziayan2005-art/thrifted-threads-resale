import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Ruler, ScanLine, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/lib/catalog";
import { Logo } from "@/components/Logo";

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
  { icon: ScanLine, title: "Graded by hand", body: "Four condition tiers, applied by the same two people, every time." },
  { icon: Sparkles, title: "Flaws photographed", body: "If there's a mark, you see it close up before you buy." },
  { icon: Leaf, title: "Impact counted", body: "Every order tallies the water and carbon your choice kept out of landfill." },
  { icon: Ruler, title: "Measured flat", body: "Real measurements, not brand size guesswork." },
];

function Home() {
  const arrivals = products.slice(0, 8);
  const best = products.filter((p) => p.bestSeller);

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:pt-20">
        <div>
          <p className="type-eyebrow text-muted-foreground">Lahore · Est. 2025</p>
          <h1 className="type-h1 mt-4">Every piece has a past.</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed">
            Single-wear, photoshoot-sample and gently-used clothing, graded honestly and sold once.
            No restocks, no mystery bins — just one of everything, with its story attached.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="border border-foreground bg-accent px-6 py-3 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
            >
              Shop new arrivals
            </Link>
            <Link
              to="/how-it-works"
              className="border border-foreground px-6 py-3 text-sm font-medium tracking-wide transition-colors hover:bg-secondary"
            >
              How we source
            </Link>
          </div>
        </div>
        <div className="ink-frame flex items-center justify-center p-8">
          <Logo className="h-64 w-auto md:h-80" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="ink-rule" />
        <ul className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <li key={t.title}>
              <t.icon className="size-6" strokeWidth={1} aria-hidden />
              <h2 className="type-h3 mt-3">{t.title}</h2>
              <p className="type-caption mt-1">{t.body}</p>
            </li>
          ))}
        </ul>
        <div className="ink-rule" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="type-h2">Browse the rail</h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {categories.map((c) => (
            <li key={c}>
              <Link
                to="/shop"
                search={{ category: c }}
                className="ink-tag hover:bg-secondary"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="type-h2">New arrivals</h2>
          <Link to="/shop" className="type-eyebrow underline underline-offset-4">
            See all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {arrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-foreground/15 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="type-h2">Best loved this month</h2>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
