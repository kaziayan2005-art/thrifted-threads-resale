import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Return & Exchange Policy | Thrifted Threads" },
      { name: "description", content: "Seven-day returns on pre-loved pieces, how exchanges work on single-unit stock, and what we can't accept." },
      { property: "og:title", content: "Return & Exchange Policy | Thrifted Threads" },
      { property: "og:description", content: "Seven days, honest conditions, no restocking fee." },
    ],
  }),
  component: Returns,
});

function Returns() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Policy" title="Returns & exchanges" intro="Seven days from delivery. No restocking fee." />
      <Prose>
        <h2>What you can return</h2>
        <p>
          Any piece, for any reason, within seven days of delivery — as long as it comes back
          unworn, unwashed and with our tag still attached.
        </p>
        <h2>Exchanges on one-of-one stock</h2>
        <p>
          Because every listing is a single unit, we can't swap a piece for another size. An
          exchange is processed as a return plus a fresh order, and we'll hold a replacement piece
          for you for 48 hours while it's arranged.
        </p>
        <h2>What we can't accept</h2>
        <ul>
          <li>Pieces returned after seven days</li>
          <li>Anything worn, washed, altered or scented</li>
          <li>Returns based on a flaw that was disclosed and photographed on the listing</li>
        </ul>
        <h2>If we got the grade wrong</h2>
        <p>
          If a piece arrives with damage we failed to disclose, message us on WhatsApp with a photo.
          We refund in full including return shipping, and the listing photos get audited.
        </p>
        <h2>Refund timing</h2>
        <p>
          Card refunds land in five to seven working days. JazzCash, Easypaisa and cash-on-delivery
          orders are refunded by bank transfer within three working days of the return arriving.
        </p>
      </Prose>
    </SiteLayout>
  );
}
