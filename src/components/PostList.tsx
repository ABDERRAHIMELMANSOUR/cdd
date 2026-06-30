import Link from "next/link";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui";

export type PostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured: string | null;
  publishedAt: Date | null;
  authorName: string | null;
  category?: { name: string } | null;
};

export default function PostList({ posts, base }: { posts: PostCard[]; base: string }) {
  if (posts.length === 0) return <EmptyState message="Aucun article pour le moment." />;
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <Link key={p.id} href={`${base}/${p.slug}`} className="card overflow-hidden">
          {p.featured ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.featured} alt={p.title} className="h-48 w-full object-cover" />
          ) : (
            <div className="h-48 w-full bg-gradient-to-br from-brand to-brand-light" />
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {p.category && <span className="font-semibold text-accent">{p.category.name}</span>}
              {p.publishedAt && <span>{formatDate(p.publishedAt)}</span>}
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-gray-900">{p.title}</h3>
            {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-gray-600">{p.excerpt}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
