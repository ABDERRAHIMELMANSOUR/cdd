import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { requireMember, isStaff } from "@/lib/session";
import { AUTHOR_SELECT } from "@/lib/portal";
import Composer from "./Composer";
import PostCard, { type FeedPostView } from "./PostCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fil d'actualité", robots: { index: false } };

/** How many posts one page of the feed carries. Comments are capped per post
 *  as well: an old thread with 200 replies must not become the whole page. */
const PAGE_SIZE = 25;
const COMMENTS_PER_POST = 3;

/**
 * A hard ceiling on how far "Charger plus" will go.
 *
 * Each click re-fetches everything already shown (see below), so without a
 * ceiling a determined scroller eventually asks the database for every post
 * the foundation has ever published, in one query, on every click.
 */
const MAX_PAGES = 20;

export default async function FeedPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const user = await requireMember();

  const requested = Number.parseInt(searchParams?.page ?? "1", 10);
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), MAX_PAGES) : 1;

  /*
   * "Load more" by growing the window rather than by offsetting it.
   *
   * A server-rendered feed has no client-side list to append to, so ?page=2
   * fetching posts 26-50 would REPLACE the first 25 — the button would read
   * "load more" and behave like "next page", losing everything above it. Taking
   * page * PAGE_SIZE keeps the earlier posts on screen, which is what the
   * button promises.
   *
   * The cost is honest and bounded: page 3 re-reads the 50 rows it already
   * showed. At a foundation's posting volume that is one indexed query on
   * createdAt, and it buys a feed that needs no client-side state, works with
   * the back button, and survives a refresh with the same posts in place.
   *
   * One extra row is fetched purely to answer "is there more?" without a
   * second COUNT query, and dropped before rendering.
   */
  const take = page * PAGE_SIZE;

  const posts = await safe<FeedPostView[]>(
    () =>
      prisma.communityPost.findMany({
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        take: take + 1,
        select: {
          id: true,
          content: true,
          mediaUrl: true,
          createdAt: true,
          author: { select: AUTHOR_SELECT },
          // Filtered to the viewer on purpose: the card only needs to know
          // whether *they* liked it, and fetching every like to find out would
          // grow with the popularity of the post.
          likes: { where: { authorId: user.id }, select: { authorId: true } },
          comments: {
            where: { hidden: false },
            orderBy: { createdAt: "desc" },
            take: COMMENTS_PER_POST,
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: { select: AUTHOR_SELECT },
            },
          },
          // The comment count is filtered too: a post whose only reply was
          // moderated away must not keep advertising "1 commentaire" above an
          // empty thread.
          _count: { select: { likes: true, comments: { where: { hidden: false } } } },
        },
      }),
    []
  );

  const hasMore = posts.length > take;
  const visible = hasMore ? posts.slice(0, take) : posts;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900">Fil d&apos;actualité</h1>
        <p className="mt-1 text-sm text-gray-600">
          Les publications des supporters de CDD Pays-Bas.
        </p>
      </header>

      <Composer name={user.name ?? ""} image={user.image} />

      {visible.length === 0 ? (
        <p className="card p-8 text-center text-sm text-gray-600">
          Rien n&apos;a encore été publié. Lancez la conversation.
        </p>
      ) : (
        <div className="space-y-5">
          {visible.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                // Newest-first fetch, oldest-first display: taking the LATEST
                // three replies is what you want, reading them bottom-up is not.
                comments: [...post.comments].reverse(),
              }}
              viewerId={user.id}
              canModerate={isStaff(user.role)}
              viewerName={user.name ?? ""}
              viewerImage={user.image}
            />
          ))}

          {hasMore ? (
            <div className="pt-1 text-center">
              {/* A plain link, not a button: it works before hydration, the
                  back button undoes it, and a refresh keeps the same posts on
                  screen. `scroll={false}` stops Next jumping to the top of the
                  feed, which would undo the reading position the click was
                  meant to preserve. */}
              <Link
                href={`/portal/feed?page=${page + 1}`}
                scroll={false}
                className="btn-outline inline-block"
              >
                Charger plus
              </Link>
            </div>
          ) : (
            page >= MAX_PAGES && (
              <p className="pt-1 text-center text-sm text-gray-400">
                Fin des publications affichables.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
