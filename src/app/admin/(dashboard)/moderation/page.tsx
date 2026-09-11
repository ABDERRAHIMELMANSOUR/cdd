import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { requireRole } from "@/lib/session";
import { AdminHeader, Panel, EmptyRow } from "@/components/admin/ui";
import { AUTHOR_SELECT, timeAgo } from "@/lib/portal";
import DeleteButton from "@/components/admin/DeleteButton";
import { restorePost, purgePost, restoreComment, purgeComment } from "./actions";

export const dynamic = "force-dynamic";

const LIMIT = 50;

function Author({ name, id }: { name: string; id: string }) {
  return (
    <Link href={`/portal/members/${id}`} className="font-medium text-gray-900 hover:text-brand">
      {name}
    </Link>
  );
}

export default async function ModerationAdmin() {
  await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const [posts, comments] = await Promise.all([
    safe(
      () =>
        prisma.communityPost.findMany({
          where: { hidden: true },
          orderBy: { createdAt: "desc" },
          take: LIMIT,
          select: {
            id: true,
            content: true,
            mediaUrl: true,
            createdAt: true,
            author: { select: AUTHOR_SELECT },
            _count: { select: { comments: true } },
          },
        }),
      []
    ),
    safe(
      () =>
        prisma.communityComment.findMany({
          where: { hidden: true },
          orderBy: { createdAt: "desc" },
          take: LIMIT,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: AUTHOR_SELECT },
            // So a moderator can see what the comment was replying to before
            // deciding — a remark that is baffling alone is often obvious in
            // context, and vice versa.
            post: { select: { id: true, content: true, hidden: true } },
          },
        }),
      []
    ),
  ]);

  const total = posts.length + comments.length;

  return (
    <>
      <AdminHeader
        title="Modération"
        subtitle={
          total === 0
            ? "Rien à examiner : aucun contenu masqué."
            : `${total} élément${total > 1 ? "s" : ""} masqué${total > 1 ? "s" : ""} en attente d'examen.`
        }
      />

      <div className="mb-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">
          Publications masquées ({posts.length})
        </h2>
        <Panel>
          {posts.length === 0 ? (
            <EmptyRow message="Aucune publication masquée." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {posts.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Author name={p.author.name} id={p.author.id} />
                    <span className="text-xs text-gray-400">{timeAgo(p.createdAt)}</span>
                    {p._count.comments > 0 && (
                      <span className="text-xs text-gray-400">
                        · {p._count.comments} commentaire{p._count.comments > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">
                    {p.content}
                  </p>

                  {p.mediaUrl && (
                    // Not a clickable link and not an <img>: a moderator should
                    // be able to read what was posted without their browser
                    // fetching it, and without one click away from whatever is
                    // at the other end.
                    <p className="mt-2 break-all rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      {p.mediaUrl}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <form action={restorePost}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-xs font-medium text-green-700 hover:underline">
                        Restaurer
                      </button>
                    </form>
                    <DeleteButton
                      action={purgePost}
                      id={p.id}
                      label="Supprimer définitivement"
                      confirm="Supprimer définitivement cette publication et ses commentaires ? Cette action est irréversible."
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">
          Commentaires masqués ({comments.length})
        </h2>
        <Panel>
          {comments.length === 0 ? (
            <EmptyRow message="Aucun commentaire masqué." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {comments.map((c) => (
                <li key={c.id} className="p-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Author name={c.author.name} id={c.author.id} />
                    <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">
                    {c.content}
                  </p>

                  <p className="mt-2 border-l-2 border-gray-200 pl-3 text-xs text-gray-500">
                    <span className="font-medium">En réponse à :</span>{" "}
                    <span className="line-clamp-2">{c.post.content}</span>
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    {c.post.hidden ? (
                      <span className="text-xs text-gray-400">
                        Publication parente masquée — restaurez-la d&apos;abord.
                      </span>
                    ) : (
                      <form action={restoreComment}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-xs font-medium text-green-700 hover:underline">
                          Restaurer
                        </button>
                      </form>
                    )}
                    <DeleteButton
                      action={purgeComment}
                      id={c.id}
                      label="Supprimer définitivement"
                      confirm="Supprimer définitivement ce commentaire ? Cette action est irréversible."
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
