import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story | Thrifted Threads" },
      { name: "description", content: "How Thrifted Threads sources single-wear and photoshoot-sample clothing, and why resale is the point." },
      { property: "og:title", content: "Our Story | Thrifted Threads" },
      { property: "og:description", content: "An indie resale label built on honest grading and one-of-one inventory." },
    ],
  }),
  component: Story,
});

function Story() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title="We started with one rail."
        intro="Thrifted Threads began in a Lahore studio flat with a wire hanger, a camera and forty pieces nobody wanted to throw away."
      />
      <Prose>
        <p>
          Most of what we sell never really got worn. Photoshoot samples come back from a morning on
          set and sit in storage. Wedding-season outfits get one evening. Studio returns get written
          off. We buy those pieces outright, check them under daylight, grade them honestly and list
          them once.
        </p>
        <h2>Why one of everything</h2>
        <p>
          We don't restock. Every listing is a single unit, which means the piece you're looking at
          is the exact piece that arrives — the same buttons, the same tiny mark on the cuff, the
          same story. It also means we can't hide behind a size run. If we get the grading wrong,
          there's nowhere for it to go.
        </p>
        <h2>Sourcing, not consignment</h2>
        <p>
          There's no seller portal here, and there won't be one. We source and list everything
          ourselves so the standard stays the same across the whole rail. That's slower and it caps
          how fast we grow — we think it's the trade worth making.
        </p>
        <h2>The waste maths</h2>
        <p>
          A single cotton shirt takes roughly 2,700 litres of water to produce. Buying it second
          hand keeps that production run from happening. We tally the water and carbon on every
          order so the number is concrete rather than a slogan.
        </p>
      </Prose>
    </SiteLayout>
  );
}
