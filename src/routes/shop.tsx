import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import {
  brands,
  categories,
  colors,
  conditions,
  occasions,
  products,
  sizes,
} from "@/lib/catalog";
import type { Product } from "@/types";

interface ShopSearch {
  category?: string | undefined;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Pre-Loved Pieces | Thrifted Threads" },
      {
        name: "description",
        content:
          "Filter condition-graded, single-unit resale clothing by size, brand, condition, price, occasion and colour.",
      },
      { property: "og:title", content: "Shop All Pre-Loved Pieces | Thrifted Threads" },
      { property: "og:description", content: "One of everything. Filter by size, brand and condition." },
    ],
  }),
  component: Shop,
});

type Sort = "newest" | "price-asc" | "price-desc" | "condition";
const conditionRank = new Map(conditions.map((c, i) => [c, i]));

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Shop() {
  const { category } = Route.useSearch();
  const [selCategories, setCategories] = useState<string[]>(category ? [category] : []);
  const [selSizes, setSizes] = useState<string[]>([]);
  const [selBrands, setBrands] = useState<string[]>([]);
  const [selConditions, setConditions] = useState<string[]>([]);
  const [selOccasions, setOccasions] = useState<string[]>([]);
  const [selColors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sort, setSort] = useState<Sort>("newest");
  const [drawer, setDrawer] = useState(false);

  const results = useMemo(() => {
    const match = (p: Product) =>
      (selCategories.length === 0 || selCategories.includes(p.category)) &&
      (selSizes.length === 0 || selSizes.includes(p.size)) &&
      (selBrands.length === 0 || selBrands.includes(p.brand)) &&
      (selConditions.length === 0 || selConditions.includes(p.condition)) &&
      (selOccasions.length === 0 || selOccasions.includes(p.occasion)) &&
      (selColors.length === 0 || selColors.includes(p.color)) &&
      p.price <= maxPrice;

    const list = products.filter((p) => p.status === "published" && match(p));
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "condition")
      sorted.sort(
        (a, b) => (conditionRank.get(a.condition) ?? 9) - (conditionRank.get(b.condition) ?? 9),
      );
    if (sort === "newest") sorted.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    return sorted;
  }, [selCategories, selSizes, selBrands, selConditions, selOccasions, selColors, maxPrice, sort]);

  const filters = (
    <div className="space-y-8">
      <Group label="Category" options={categories} selected={selCategories} onToggle={(v) => setCategories(toggle(selCategories, v))} />
      <Group label="Size" options={sizes} selected={selSizes} onToggle={(v) => setSizes(toggle(selSizes, v))} />
      <Group label="Condition" options={conditions} selected={selConditions} onToggle={(v) => setConditions(toggle(selConditions, v))} />
      <Group label="Brand" options={brands} selected={selBrands} onToggle={(v) => setBrands(toggle(selBrands, v))} />
      <Group label="Occasion" options={occasions} selected={selOccasions} onToggle={(v) => setOccasions(toggle(selOccasions, v))} />
      <Group label="Colour" options={colors} selected={selColors} onToggle={(v) => setColors(toggle(selColors, v))} />
      <div>
        <h3 className="type-eyebrow mb-3">Max price</h3>
        <input
          type="range"
          min={1000}
          max={15000}
          step={500}
          value={maxPrice}
          aria-label="Maximum price in rupees"
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--terracotta)]"
        />
        <p className="type-caption mt-1">Up to PKR {maxPrice.toLocaleString("en-PK")}</p>
      </div>
    </div>
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="The rail"
        title="Shop everything"
        intro="Each listing is a single unit. When it sells, it's gone for good — so the filters below are the whole inventory, not a sample of it."
      />

      <div className="mx-auto max-w-6xl gap-10 px-4 pb-20 lg:flex">
        <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">
          {filters}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="type-caption">{results.length} pieces</p>
            <div className="flex items-center gap-3">
              <label className="type-eyebrow" htmlFor="sort">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="border border-foreground bg-background px-3 py-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price, low to high</option>
                <option value="price-desc">Price, high to low</option>
                <option value="condition">Condition</option>
              </select>
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="ink-tag lg:hidden"
                aria-haspopup="dialog"
              >
                <SlidersHorizontal className="size-3.5" strokeWidth={1.25} /> Filters
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="ink-frame border-dashed p-12 text-center">
              <p className="type-h3">The rail is empty here.</p>
              <p className="type-caption mt-2">Loosen a filter — everything is one-of-one, so combinations run thin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className="fixed inset-0 z-50 flex lg:hidden"
        >
          <button
            type="button"
            aria-label="Close filters"
            className="flex-1 bg-foreground/30"
            onClick={() => setDrawer(false)}
          />
          <div className="w-80 max-w-[85vw] overflow-y-auto border-l border-foreground bg-background p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="type-h3">Filters</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters">
                <X className="size-5" strokeWidth={1.25} />
              </button>
            </div>
            {filters}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function Group({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="type-eyebrow mb-3">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o)}
              className={`ink-tag transition-colors ${on ? "bg-foreground text-background" : "hover:bg-secondary"}`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
