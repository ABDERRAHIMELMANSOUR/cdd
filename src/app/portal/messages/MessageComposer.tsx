"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { sendMessage, type MessageState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 self-end rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "…" : "Envoyer"}
    </button>
  );
}

export default function MessageComposer({ to, name }: { to: string; name: string }) {
  const [state, action] = useFormState<MessageState, FormData>(sendMessage, {});
  const ref = useRef<HTMLFormElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      box.current?.focus();
    }
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="border-t border-gray-100 p-3 sm:p-4">
      <input type="hidden" name="to" value={to} />
      <div className="flex gap-2">
        <label htmlFor="message-content" className="sr-only">
          Message à {name}
        </label>
        <textarea
          id="message-content"
          ref={box}
          name="content"
          required
          rows={2}
          maxLength={5000}
          placeholder={`Écrire à ${name.split(" ")[0] ?? ""}…`}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter breaks the line — the convention every
            // chat window in the world uses. The form still submits normally
            // for anyone who tabs to the button instead.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="input !mt-0 resize-y"
        />
        <Submit />
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
