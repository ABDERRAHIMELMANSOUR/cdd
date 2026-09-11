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

export default async function FeedPage() {
  const user = await requireMember();

  const posts = await safe<FeedPostView[]>(
    () =>
      prisma.communityPost.findMany({
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
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

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900">Fil d&apos;actualité</h1>
        <p className="mt-1 text-sm text-gray-600">
          Les publications des donateurs de CDD Pays-Bas.
        </p>
      </header>

      <Composer name={user.name ?? ""} image={user.image} />

      {posts.length === 0 ? (
        <p className="card p-8 text-center text-sm text-gray-600">
          Rien n&apos;a encore été publié. Lancez la conversation.
        </p>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
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
        </div>
      )}
    </div>
  );
}
