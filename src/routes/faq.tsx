import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ | Thrifted Threads" },
      { name: "description", content: "Answers on sizing, condition grading, authenticity, delivery, payment and returns for pre-loved orders." },
      { property: "og:title", content: "FAQ | Thrifted Threads" },
      { property: "og:description", content: "Common questions about buying pre-loved with us." },
    ],
  }),
  component: Faq,
});

const faqs = [
  ["Will this item be restocked?", "No. Every piece is a single unit sourced once. When it sells it leaves the site permanently — wishlisting it helps us find something similar, but it won't come back."],
  ["How do I know the photos are of the actual item?", "Because they always are. We photograph every piece individually, including close-ups of any disclosed flaw. We never use stock or brand imagery."],
  ["What if it doesn't fit?", "Use the flat measurements on the listing rather than the size label. If it still misses, see our returns and exchange policy — you have 7 days."],
  ["Is everything authenticated?", "Every branded piece is checked against reference photos for label, stitching, hardware and lining before it can be published. Anything that fails is rejected, not discounted."],
  ["Which payment methods work?", "Card via Stripe's hosted checkout, JazzCash, Easypaisa, and cash on delivery within major cities."],
  ["How fast is delivery?", "Dispatched within 48 hours. Two to four working days nationwide, with tracking sent over WhatsApp."],
  ["Do you buy clothes from the public?", "Not at the moment. We source directly from studios, brands and campaign shoots so grading stays consistent."],
];

function Faq() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Support" title="Questions, answered" />
      <div className="mx-auto max-w-2xl px-4 pb-24">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm">{q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SiteLayout>
  );
}
