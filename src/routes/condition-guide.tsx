import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { ConditionBadge } from "@/components/ConditionBadge";
import { conditions } from "@/lib/catalog";

export const Route = createFileRoute("/condition-guide")({
  head: () => ({
    meta: [
      { title: "Condition & Authenticity Guide | Thrifted Threads" },
      { name: "description", content: "Our four condition grades explained in full, plus how branded pieces are authenticated before listing." },
      { property: "og:title", content: "Condition & Authenticity Guide | Thrifted Threads" },
      { property: "og:description", content: "Four grades, one flaw taxonomy, no surprises." },
    ],
  }),
  component: Guide,
});

const detail: Record<string, string> = {
  "New with Tags": "Unworn with original tags attached. No alterations, no wash, no wear.",
  "Photoshoot Sample": "Worn on set only, usually for a few hours. May show pin marks or steam creases, never wash wear.",
  "Worn Once": "A single outing. Washed or dry-cleaned once, structure and colour intact.",
  "Gently Used": "Regular wear with disclosed, photographed flaws. Nothing structural, nothing hidden.",
};

const flaws = [
  ["Mark", "Any stain or discolouration, photographed at 15cm."],
  ["Pilling", "Surface bobbling, graded light / moderate."],
  ["Hem wear", "Fraying or loose stitching at hem or cuff."],
  ["Hardware", "Zips, buttons or clasps that are replaced or worn."],
  ["Repair", "Any mend we made, described and shown."],
];

function Guide() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Trust"
        title="Condition & authenticity"
        intro="One grading scale, applied by the same team, across every listing. Nothing is described as 'good condition' — that means nothing."
      />
      <div className="mx-auto max-w-3xl px-4 pb-24">
        <ul className="space-y-8">
          {conditions.map((c) => (
            <li key={c}>
              <ConditionBadge condition={c} />
              <p className="mt-3 text-sm leading-relaxed">{detail[c]}</p>
              <div className="ink-rule mt-6" />
            </li>
          ))}
        </ul>

        <h2 className="type-h2 mt-14">Flaw taxonomy</h2>
        <p className="mt-3 text-sm">Every disclosed flaw uses one of these labels, so listings stay comparable.</p>
        <dl className="mt-6 space-y-4">
          {flaws.map(([label, body]) => (
            <div key={label}>
              <dt className="type-eyebrow">{label}</dt>
              <dd className="type-caption">{body}</dd>
            </div>
          ))}
        </dl>

        <h2 className="type-h2 mt-14">Authentication</h2>
        <p className="mt-3 text-sm leading-relaxed">
          Branded pieces are checked against reference photos for label typography, stitch density,
          hardware stamps and lining construction. If any of the four fail, the piece is rejected
          outright — we don't list "possibly authentic" items at a discount.
        </p>
      </div>
    </SiteLayout>
  );
}
