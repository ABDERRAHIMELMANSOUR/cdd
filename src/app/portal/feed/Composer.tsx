"use client";

import { useRef, useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createPost, type FeedState } from "./actions";
import Avatar from "@/components/portal/Avatar";

const MAX = 5000;

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className="btn-primary disabled:opacity-50">
      {pending ? "Publication…" : "Publier"}
    </button>
  );
}

/**
 * Post composer.
 *
 * Collapsed to a single line until focused. The feed is the page; a permanent
 * four-row textarea and a link field push the first actual post below the fold
 * on a phone, which is the wrong thing to optimise for — most visits read
 * rather than write.
 */
export default function Composer({
  name,
  image,
}: {
  name: string;
  image: string | null;
}) {
  const [state, action] = useFormState<FeedState, FormData>(createPost, {});
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the box once the post is actually in the database, not merely when
  // the form was submitted — an optimistic reset loses the text on failure and
  // the supporter has to retype it.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setText("");
      setOpen(false);
    }
  }, [state.ok]);

  const over = text.length > MAX;

  return (
    <form ref={formRef} action={action} className="card p-4 sm:p-5">
      <div className="flex gap-3">
        <Avatar name={name} src={image} size={44} />
        <div className="min-w-0 flex-1">
          <label htmlFor="content" className="sr-only">
            Votre publication
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={open ? 4 : 1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={`Partagez une actualité, ${name.split(" ")[0] ?? ""}…`}
            className="input resize-y"
          />

          {open && (
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="mediaUrl" className="label">
                  Lien ou média (facultatif)
                </label>
                <input
                  id="mediaUrl"
                  name="mediaUrl"
                  type="url"
                  placeholder="https://…"
                  className="input"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`text-xs ${over ? "text-red-600" : "text-gray-400"}`}>
                  {text.length} / {MAX}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      formRef.current?.reset();
                      setText("");
                      setOpen(false);
                    }}
                    className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-800"
                  >
                    Annuler
                  </button>
                  <SubmitButton disabled={over || text.trim().length === 0} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
