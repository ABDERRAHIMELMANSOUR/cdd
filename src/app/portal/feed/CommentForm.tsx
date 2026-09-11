"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addComment, type FeedState } from "./actions";
import Avatar from "@/components/portal/Avatar";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "…" : "Envoyer"}
    </button>
  );
}

export default function CommentForm({
  postId,
  name,
  image,
}: {
  postId: string;
  name: string;
  image: string | null;
}) {
  const [state, action] = useFormState<FeedState, FormData>(addComment, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="mt-3 flex items-start gap-2">
      <input type="hidden" name="postId" value={postId} />
      <Avatar name={name} src={image} size={32} />
      <div className="min-w-0 flex-1">
        <label htmlFor={`comment-${postId}`} className="sr-only">
          Votre commentaire
        </label>
        <div className="flex gap-2">
          <input
            id={`comment-${postId}`}
            name="content"
            required
            maxLength={2000}
            placeholder="Écrire un commentaire…"
            className="input !mt-0"
          />
          <Submit />
        </div>
        {state.error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
