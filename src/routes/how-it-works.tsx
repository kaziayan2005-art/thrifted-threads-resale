import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works | Thrifted Threads" },
      { name: "description", content: "Sourcing, quality checks, grading and dispatch — the five steps every Thrifted Threads piece goes through." },
      { property: "og:title", content: "How It Works | Thrifted Threads" },
      { property: "og:description", content: "The five steps every piece goes through before it reaches the rail." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { n: "01", title: "We source", body: "Studio samples, single-wear outfits and studio returns bought outright — never taken on consignment." },
  { n: "02", title: "We inspect", body: "Daylight check for marks, pilling, hems, hardware and odour. Anything beyond repair is diverted to textile recycling." },
  { n: "03", title: "We authenticate", body: "Branded pieces get a label, stitch and hardware check against reference photos before they can be published." },
  { n: "04", title: "We grade & photograph", body: "One of four condition tiers, plus close-up photos of every disclosed flaw and a flat measurement set." },
  { n: "05", title: "We dispatch", body: "Steamed, wrapped in recycled tissue, out within 48 hours with WhatsApp tracking." },
];

function HowItWorks() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Process"
        title="From rail to doorstep"
        intro="Nothing gets published until it has cleared all five steps. If a piece can't be graded confidently, we don't list it."
      />
      <ol className="mx-auto max-w-3xl space-y-10 px-4 pb-24">
        {steps.map((s) => (
          <li key={s.n} className="grid gap-4 sm:grid-cols-[4rem_1fr]">
            <span className="type-h3 text-muted-foreground">{s.n}</span>
            <div>
              <h2 className="type-h3">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed">{s.body}</p>
              <div className="ink-rule mt-6" />
            </div>
          </li>
        ))}
      </ol>
    </SiteLayout>
  );
}
