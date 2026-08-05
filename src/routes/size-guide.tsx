import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size Guide | Thrifted Threads" },
      { name: "description", content: "Cross-brand sizing reference and flat-measurement guidance for pre-loved pieces." },
      { property: "og:title", content: "Size Guide | Thrifted Threads" },
      { property: "og:description", content: "Cross-brand sizing tables and how we measure flat." },
    ],
  }),
  component: SizeGuide,
});

const rows = [
  ["XS", "32–34", "24–26", "34–36", "UK 6", "EU 34"],
  ["S", "34–36", "26–28", "36–38", "UK 8", "EU 36"],
  ["M", "36–38", "28–30", "38–40", "UK 10", "EU 38"],
  ["L", "39–41", "31–33", "41–43", "UK 14", "EU 42"],
  ["XL", "42–44", "34–36", "44–46", "UK 16", "EU 44"],
];

function SizeGuide() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Fit"
        title="Size guide"
        intro="Pre-loved sizing drifts between brands and decades. Always trust the flat measurements on the listing over the label."
      />
      <div className="mx-auto max-w-3xl px-4 pb-24">
        <div className="ink-frame overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Cross-brand size conversion in inches</caption>
            <thead>
              <tr className="border-b border-foreground">
                {["Size", "Bust", "Waist", "Hip", "UK", "EU"].map((h) => (
                  <th key={h} scope="col" className="type-eyebrow p-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]} className="border-b border-border last:border-0">
                  {r.map((cell, i) => (
                    <td key={i} className="p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="type-h2 mt-12">How we measure</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Garments are laid flat and measured edge to edge: chest under the armhole, length from the
          high shoulder point, shoulder seam to seam. Double the flat chest for the full
          circumference.
        </p>
      </div>
    </SiteLayout>
  );
}
