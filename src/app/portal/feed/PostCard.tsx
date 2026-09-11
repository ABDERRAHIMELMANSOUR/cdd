import Link from "next/link";
import Avatar from "@/components/portal/Avatar";
import { timeAgo } from "@/lib/portal";
import CommentForm from "./CommentForm";
import { toggleLike, removePost, removeComment } from "./actions";

type Author = {
  id: string;
  name: string;
  image: string | null;
  position: string | null;
  company: string | null;
};

export type FeedPostView = {
  id: string;
  content: string;
  mediaUrl: string | null;
  createdAt: Date;
  author: Author;
  likes: { authorId: string }[];
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    author: Author;
  }[];
  _count: { likes: number; comments: number };
};

/** Render a media link as a picture when it plainly is one, otherwise as a
 *  link. Guessing from the extension is imperfect, but the failure is a link
 *  that renders as a link — not a broken image frame. */
function isImage(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(url);
}

function byline(author: Author): string | null {
  return [author.position, author.company].filter(Boolean).join(" · ") || null;
}

export default function PostCard({
  post,
  viewerId,
  canModerate,
  viewerName,
  viewerImage,
}: {
  post: FeedPostView;
  viewerId: string;
  canModerate: boolean;
  viewerName: string;
  viewerImage: string | null;
}) {
  // `likes` is fetched filtered to the viewer, so a post with a thousand likes
  // still ships one row to decide how this button looks.
  const liked = post.likes.length > 0;
  const mine = post.author.id === viewerId;
  const sub = byline(post.author);

  return (
    <article className="card p-4 sm:p-5">
      <header className="flex items-start gap-3">
        <Link href={`/portal/members/${post.author.id}`}>
          <Avatar name={post.author.name} src={post.author.image} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/portal/members/${post.author.id}`}
            className="font-medium text-gray-900 hover:text-brand"
          >
            {post.author.name}
          </Link>
          {sub && <p className="truncate text-sm text-gray-500">{sub}</p>}
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>

        {(mine || canModerate) && (
          <form action={removePost}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-red-600"
            >
              {mine ? "Supprimer" : "Masquer"}
            </button>
          </form>
        )}
      </header>

      {/* whitespace-pre-wrap keeps the author's paragraph breaks; React escapes
          the text itself, so no markup in a post can execute. break-words
          stops a pasted 300-character URL widening the card on a phone. */}
      <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-800">
        {post.content}
      </p>

      {post.mediaUrl &&
        (isImage(post.mediaUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary
          // member-supplied URLs, which next/image would need allow-listed hosts for.
          <img
            src={post.mediaUrl}
            alt=""
            loading="lazy"
            className="mt-3 max-h-[28rem] w-full rounded-xl border border-gray-100 object-cover"
          />
        ) : (
          <a
            href={post.mediaUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-3 block truncate rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-brand hover:bg-gray-100"
          >
            {post.mediaUrl}
          </a>
        ))}

      <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
        <form action={toggleLike}>
          <input type="hidden" name="postId" value={post.id} />
          <button
            type="submit"
            aria-pressed={liked}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
              liked ? "text-brand" : "text-gray-500 hover:text-brand"
            }`}
          >
            <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
            J&apos;aime
            {post._count.likes > 0 && (
              <span className="text-xs text-gray-400">({post._count.likes})</span>
            )}
          </button>
        </form>

        <span className="text-sm text-gray-400">
          {post._count.comments} commentaire{post._count.comments > 1 ? "s" : ""}
        </span>
      </div>

      {post.comments.length > 0 && (
        <ul className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {post.comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2">
              <Link href={`/portal/members/${c.author.id}`}>
                <Avatar name={c.author.name} src={c.author.image} size={32} />
              </Link>
              <div className="min-w-0 flex-1 rounded-xl bg-gray-50 px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/portal/members/${c.author.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-brand"
                  >
                    {c.author.name}
                  </Link>
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                  {(c.author.id === viewerId || canModerate) && (
                    <form action={removeComment} className="ml-auto">
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="text-xs text-gray-400 hover:text-red-600"
                        aria-label="Supprimer ce commentaire"
                      >
                        ×
                      </button>
                    </form>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-700">
                  {c.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CommentForm postId={post.id} name={viewerName} image={viewerImage} />
    </article>
  );
}
