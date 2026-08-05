import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { getById, products } from "@/lib/catalog";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      { title: "Sustainability Impact | Thrifted Threads" },
      { name: "description", content: "Water and carbon avoided by buying pre-loved — measured per piece, tallied per order and across the whole rail." },
      { property: "og:title", content: "Sustainability Impact | Thrifted Threads" },
      { property: "og:description", content: "The water and carbon your pre-loved choices keep out of production." },
    ],
  }),
  component: Impact,
});

function Counter({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="ink-frame p-6">
      <p className="type-h2">
        {value}
        <span className="text-base"> {unit}</span>
      </p>
      <p className="type-caption mt-1">{label}</p>
    </div>
  );
}

function Impact() {
  const wishlist = useShop((s) => s.wishlist);
  const cart = useShop((s) => s.cart);
  const mine = [...new Set([...cart, ...wishlist])]
    .map(getById)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const totalWater = products.reduce((s, p) => s + p.waterSavedL, 0);
  const totalCarbon = products.reduce((s, p) => s + p.carbonSavedKg, 0);
  const myWater = mine.reduce((s, p) => s + p.waterSavedL, 0);
  const myCarbon = mine.reduce((s, p) => s + p.carbonSavedKg, 0);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Impact"
        title="The maths, out loud"
        intro="Buying second hand doesn't save water — it avoids a new production run that would have used it. Here's what that adds up to."
      />
      <div className="mx-auto max-w-4xl px-4 pb-24">
        <h2 className="type-h3">Across the current rail</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Counter value={totalWater.toLocaleString("en-PK")} unit="litres" label="Water avoided if every listed piece finds a home" />
          <Counter value={totalCarbon.toLocaleString("en-PK")} unit="kg CO₂e" label="Carbon avoided across the same rail" />
        </div>

        <h2 className="type-h3 mt-14">Your running tally</h2>
        <p className="type-caption mt-1">Based on the {mine.length} piece(s) in your bag and wishlist.</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Counter value={myWater.toLocaleString("en-PK")} unit="litres" label="Water you'd avoid" />
          <Counter value={myCarbon.toLocaleString("en-PK")} unit="kg CO₂e" label="Carbon you'd avoid" />
        </div>

        <div className="ink-rule my-14" />
        <h2 className="type-h3">How we calculate it</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Each category carries a conservative production footprint — 2,700L for a cotton top, up to
          5,100L for outerwear — drawn from published lifecycle assessments. We apply the figure once
          per garment and never count the same piece twice. It's an estimate, and we'd rather show
          the method than round it up.
        </p>
      </div>
    </SiteLayout>
  );
}
