import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMember, isStaff } from "@/lib/session";
import { AUTHOR_SELECT } from "@/lib/portal";
import { getT } from "@/i18n/locale";
import PostCard, { type FeedPostView } from "../PostCard";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = getT();
  return { title: t.feed.title, robots: { index: false } };
}

/**
 * One post, with every comment.
 *
 * The feed shows three comments per post and a count. Before this page that
 * count was a dead end: a post with eleven replies displayed three and told
 * you about the other eight without offering them. This is where "see all
 * comments" goes, and it doubles as a link a supporter can send to another —
 * a post in the feed had no address of its own.
 *
 * It reuses PostCard rather than restating the layout, so a change to how a
 * post looks cannot apply in one place and not the other. The only difference
 * is the comment window, which is why that is a prop.
 */
export default async function PostPage({ params }: { params: { id: string } }) {
  const user = await requireMember();
  const { t } = getT();

  const post = await prisma.communityPost.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      content: true,
      mediaUrl: true,
      createdAt: true,
      hidden: true,
      author: { select: AUTHOR_SELECT },
      repostOfId: true,
      repostOf: {
        select: {
          id: true,
          content: true,
          mediaUrl: true,
          createdAt: true,
          author: { select: AUTHOR_SELECT },
        },
      },
      likes: { where: { authorId: user.id }, select: { authorId: true } },
      comments: {
        where: { hidden: false },
        // Oldest first here: a full thread reads as a conversation, unlike the
        // feed's three, which are a preview of the most recent.
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: { select: AUTHOR_SELECT },
        },
      },
      _count: {
        select: { likes: true, comments: { where: { hidden: false } }, reposts: true },
      },
    },
  });

  // A hidden post is moderated away; staff can still open it to review what
  // they hid, which is the whole reason hiding is not deletion.
  if (!post || (post.hidden && !isStaff(user.role))) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/portal/feed" className="text-sm text-gray-500 hover:text-brand">
        ← {t.feed.title}
      </Link>

      <PostCard
        post={post as FeedPostView}
        viewerId={user.id}
        canModerate={isStaff(user.role)}
        viewerName={user.name ?? ""}
        viewerImage={user.image}
        t={t}
        showAllComments
      />
    </div>
  );
}
