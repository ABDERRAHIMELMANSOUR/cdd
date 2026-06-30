import { Breadcrumb } from "@/components/ui";
import { formatDate } from "@/lib/format";

export type FullPost = {
  title: string;
  excerpt: string | null;
  content: string | null;
  featured: string | null;
  publishedAt: Date | null;
  authorName: string | null;
  category?: { name: string } | null;
  tags?: { name: string }[];
};

export default function PostDetail({
  post,
  crumbLabel,
  crumbHref,
}: {
  post: FullPost;
  crumbLabel: string;
  crumbHref: string;
}) {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Activités", href: "/activities" },
          { label: crumbLabel, href: crumbHref },
          { label: post.title },
        ]}
      />
      <article className="container-cdd max-w-3xl pb-20">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {post.category && <span className="font-semibold text-accent">{post.category.name}</span>}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          {post.authorName && <span>· {post.authorName}</span>}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-brand sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p>}
        {post.featured && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured} alt={post.title} className="my-8 w-full rounded-2xl object-cover" />
        )}
        {post.content && (
          <div className="prose mt-6 max-w-none whitespace-pre-line leading-relaxed text-gray-700">
            {post.content}
          </div>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t.name} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand">
                #{t.name}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
