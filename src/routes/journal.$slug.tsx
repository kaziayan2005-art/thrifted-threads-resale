import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { getPost } from "@/lib/posts";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Post not found | Thrifted Threads" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} | The Style Edit` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return (
    <SiteLayout>
      <article className="mx-auto max-w-2xl px-4 pb-24 pt-14">
        <Link to="/journal" className="type-eyebrow underline underline-offset-4">
          ← The Style Edit
        </Link>
        <p className="type-eyebrow mt-8 text-muted-foreground">
          {post.category} · {post.date}
        </p>
        <h1 className="type-h1 mt-3">{post.title}</h1>
        <div className="ink-rule my-8" />
        <div className="space-y-5 leading-relaxed">
          {post.body.map((para: string) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}
