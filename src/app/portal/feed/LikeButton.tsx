"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleLike } from "./actions";
import type { Dictionary } from "@/i18n/portal";

/**
 * Like, with the state changing on the click rather than on the round trip.
 *
 * ── WHY THIS IS NOT A PLAIN FORM ─────────────────────────────────────────────
 * It was one, and every click cost a POST, a database write, a revalidatePath
 * of the whole feed and a re-render before the heart filled in. On a good
 * connection that is a visible pause on the most-clicked control in the
 * product; on a phone on mobile data it is long enough to click again, which
 * toggled the like straight back off.
 *
 * So the button owns its appearance. The click updates local state
 * immediately, the server action runs inside a transition, and the server's
 * answer arrives later to correct it if it disagreed.
 *
 * `useOptimistic` would express this more directly, but it is not in the React
 * build this app ships (18.3.1 exports no such hook — checked, not assumed).
 * useState plus useTransition is the same idea in hooks that certainly exist.
 *
 * ── WHY IT SYNCS BACK FROM PROPS ─────────────────────────────────────────────
 * The effect below is not redundant. When the server revalidates, this
 * component re-renders with fresh props but keeps its state — so without it, a
 * like that the server rejected, or one made in another tab, would leave the
 * button showing a state the database does not hold. The props are the truth;
 * local state is a short-lived guess.
 */
export default function LikeButton({
  postId,
  liked,
  count,
  t,
}: {
  postId: string;
  liked: boolean;
  count: number;
  t: Dictionary;
}) {
  const [optimistic, setOptimistic] = useState({ liked, count });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setOptimistic({ liked, count });
  }, [liked, count]);

  function click() {
    const next = {
      liked: !optimistic.liked,
      // Never below zero: a stale count plus an unlike would otherwise show -1
      // for the moment before the server answers.
      count: Math.max(0, optimistic.count + (optimistic.liked ? -1 : 1)),
    };
    setOptimistic(next);

    const data = new FormData();
    data.set("postId", postId);
    startTransition(async () => {
      await toggleLike(data);
    });
  }

  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={optimistic.liked}
      // Not disabled while pending: disabling the control someone just pressed
      // reads as a fault. A second click simply queues the opposite state.
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
        optimistic.liked ? "text-brand" : "text-gray-500 hover:text-brand"
      } ${pending ? "opacity-80" : ""}`}
    >
      <span aria-hidden="true">{optimistic.liked ? "♥" : "♡"}</span>
      {t.feed.like}
      {optimistic.count > 0 && (
        <span className="text-xs text-gray-400">({optimistic.count})</span>
      )}
    </button>
  );
}
