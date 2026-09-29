"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { repost, type FeedState } from "./actions";
import type { Dictionary } from "@/i18n/portal";

function Submit({ t }: { t: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "…" : t.feed.shareSubmit}
    </button>
  );
}

/**
 * Share a post, optionally with a remark.
 *
 * Collapsed to a single button until used. Opening a permanent textarea under
 * every card would make the feed mostly composer — most posts are read and
 * scrolled past, and the few that are shared can afford one extra click.
 */
export default function RepostButton({
  postId,
  count,
  mine,
  t,
}: {
  postId: string;
  count: number;
  t: Dictionary;
  /** Own posts cannot be shared by their author; the button says why. */
  mine: boolean;
}) {
  const [state, action] = useFormState<FeedState, FormData>(repost, {});
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      setOpen(false);
    }
  }, [state.ok]);

  if (mine) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-400">
        <span aria-hidden="true">⇄</span>
        {count > 0 && <span className="text-xs">{count}</span>}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-brand"
      >
        <span aria-hidden="true">⇄</span>
        {t.feed.share}
        {count > 0 && <span className="text-xs text-gray-400">({count})</span>}
      </button>

      {open && (
        <form ref={ref} action={action} className="mt-2 space-y-2">
          <input type="hidden" name="postId" value={postId} />
          <label htmlFor={`repost-${postId}`} className="sr-only">
            {t.feed.shareRemarkLabel}
          </label>
          <textarea
            id={`repost-${postId}`}
            name="content"
            rows={2}
            maxLength={2000}
            placeholder={t.feed.sharePlaceholder}
            className="input"
          />
          <div className="flex items-center gap-2">
            <Submit t={t} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800"
            >
              {t.feed.shareCancel}
            </button>
          </div>
          {state.error && (
            <p role="alert" className="text-xs text-red-600">
              {state.error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
