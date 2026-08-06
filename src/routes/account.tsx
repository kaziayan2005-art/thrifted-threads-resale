import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { formatPKR, products } from "@/lib/catalog";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account | Thrifted Threads" },
      { name: "description", content: "Order history, tracking, loyalty points and your personal sustainability tally." },
      { property: "og:title", content: "Your Account | Thrifted Threads" },
      { property: "og:description", content: "Orders, loyalty points and your impact tally." },
    ],
  }),
  component: Account,
});

const orders = [
  { id: "TT-10428", date: "22 July 2026", status: "Delivered", items: [0, 3] },
  { id: "TT-10391", date: "9 July 2026", status: "In transit", items: [11] },
];

function Account() {
  const rows = orders.map((o) => ({
    ...o,
    products: o.items.map((i) => products[i]).filter((p): p is NonNullable<typeof p> => Boolean(p)),
  }));
  const purchased = rows.flatMap((r) => r.products);
  const points = Math.round(purchased.reduce((s, p) => s + p.price, 0) / 100);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Account" title="Your dashboard" intro="Orders, tracking and the impact you've stacked up so far." />
      <div className="mx-auto max-w-4xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="ink-frame p-6">
            <p className="type-eyebrow text-muted-foreground">Loyalty points</p>
            <p className="type-h2 mt-2">{points}</p>
          </div>
        </div>

        <h2 className="type-h2 mt-14">Order history</h2>
        <ul className="mt-6 space-y-6">
          {rows.map((o) => (
            <li key={o.id} className="ink-frame p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="type-eyebrow">{o.id}</p>
                <span className="ink-tag">{o.status}</span>
              </div>
              <p className="type-caption mt-1">{o.date}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {o.products.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="hover:underline">
                      {p.name}
                    </Link>
                    <span>{formatPKR(p.price)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </SiteLayout>
  );
}
