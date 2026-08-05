import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { posts } from "@/lib/posts";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "The Style Edit | Thrifted Threads" },
      { name: "description", content: "Styling notes, sustainability writing and get-the-look guides from the Thrifted Threads studio." },
      { property: "og:title", content: "The Style Edit | Thrifted Threads" },
      { property: "og:description", content: "Styling notes and sustainability writing from the studio." },
    ],
  }),
  component: Journal,
});

function Journal() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Journal" title="The Style Edit" intro="Notes from the sorting table — styling, care, and the occasional rant about fast fashion." />
      <ul className="mx-auto max-w-3xl divide-y divide-border px-4 pb-24">
        {posts.map((p) => (
          <li key={p.slug} className="py-6">
            <p className="type-eyebrow text-muted-foreground">
              {p.category} · {p.date}
            </p>
            <h2 className="type-h3 mt-2">
              <Link to="/journal/$slug" params={{ slug: p.slug }} className="hover:underline underline-offset-4">
                {p.title}
              </Link>
            </h2>
            <p className="type-caption mt-2">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </SiteLayout>
  );
}
