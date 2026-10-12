"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { respondMeeting, type MeetingState } from "@/app/portal/network/actions";
import type { Dictionary } from "@/i18n/portal";

function Btn({ label, busy, value, primary }: { label: string; busy: string; value: string; primary?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button name="decision" value={value} disabled={pending} className={primary ? "btn-primary" : "btn-ghost"}>
      {pending ? busy : label}
    </button>
  );
}

/**
 * Accept (with a Google Meet link) or decline a meeting request.
 *
 * The link is created by the person accepting: "Create a Meet link" opens
 * meet.google.com/new in a new tab, they copy the room address back here, and
 * it is shared with the requester on the network page and in their messages.
 * Generating the room automatically needs Google Calendar API credentials for
 * the organisation's Google account, which the portal does not have.
 */
export default function RespondMeetingForm({ id, t }: { id: string; t: Dictionary }) {
  const [state, action] = useFormState<MeetingState, FormData>(respondMeeting, {});
  const [accepting, setAccepting] = useState(false);

  if (state.ok) return null; // the page revalidates and moves the row

  return (
    <form action={action} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={id} />

      {accepting ? (
        <>
          <div>
            <label className="label" htmlFor={`meet-${id}`}>{t.network.meetLink}</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={`meet-${id}`}
                name="meetUrl"
                type="url"
                required
                inputMode="url"
                placeholder="https://meet.google.com/abc-defg-hij"
                className="input flex-1"
              />
              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline whitespace-nowrap"
              >
                {t.network.createMeetLink}
              </a>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t.network.meetLinkHint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn value="accept" label={t.network.confirmAccept} busy={t.network.sending} primary />
            <button type="button" onClick={() => setAccepting(false)} className="btn-ghost">
              {t.common.cancel}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAccepting(true)} className="btn-primary">
            {t.network.accept}
          </button>
          <Btn value="decline" label={t.network.decline} busy={t.network.sending} />
        </div>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
