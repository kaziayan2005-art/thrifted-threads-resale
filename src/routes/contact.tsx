import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support | Thrifted Threads" },
      { name: "description", content: "Reach the Thrifted Threads studio by WhatsApp or the contact form for sizing, orders and returns." },
      { property: "og:title", content: "Contact & Support | Thrifted Threads" },
      { property: "og:description", content: "WhatsApp us or send a note — we answer within a working day." },
    ],
  }),
  component: Contact,
});

const field = "mt-1 w-full border border-input bg-background px-3 py-2 text-sm";

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Support" title="Talk to us" intro="Two people read every message. WhatsApp is fastest; the form is fine for anything less urgent." />
      <div className="mx-auto grid max-w-4xl gap-10 px-4 pb-24 md:grid-cols-2">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <label className="block text-sm">
            Name
            <input className={field} name="name" required maxLength={100} />
          </label>
          <label className="block text-sm">
            Email
            <input className={field} type="email" name="email" required maxLength={255} />
          </label>
          <label className="block text-sm">
            Message
            <textarea className={`${field} h-32`} name="message" required maxLength={1000} />
          </label>
          <button
            type="submit"
            className="border border-foreground bg-accent px-6 py-3 text-sm font-medium text-accent-foreground cursor-pointer transition-all duration-200 hover:bg-secondary hover:text-foreground hover:shadow-md"
          >
            Send message
          </button>
          {sent && (
            <p role="status" className="type-caption">
              Thanks — we'll reply within one working day.
            </p>
          )}
        </form>

        <aside className="ink-frame h-fit p-6">
          <h2 className="type-h3">Faster on WhatsApp</h2>
          <p className="type-caption mt-2">
            Order updates, sizing checks and styling questions. Mon–Sat, 11am–7pm PKT.
          </p>
          <a
            href="https://wa.me/923332711821"
            target="_blank"
            rel="noreferrer noopener"
            className="ink-tag mt-5 inline-flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-secondary hover:shadow-sm"
          >
            <MessageCircle className="size-3.5" strokeWidth={1.25} /> Open WhatsApp
          </a>
          <div className="ink-rule my-6" />
          <p className="type-caption">Studio: Gulberg III, Lahore — visits by appointment only.</p>
        </aside>
      </div>
    </SiteLayout>
  );
}
