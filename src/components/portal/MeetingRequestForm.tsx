"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { requestMeeting, type MeetingState } from "@/app/portal/network/actions";
import { fmt, type Dictionary } from "@/i18n/portal";

function Submit({ t }: { t: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-primary">
      {pending ? t.network.sending : t.network.sendMeetingRequest}
    </button>
  );
}

/** "2026-10-12T14:30" for the datetime-local `min`, in the reader's own clock. */
function localInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Propose a 1-on-1 Google Meet to a connection.
 *
 * The picker shows the reader's local time. It is converted to an exact
 * instant HERE, in the browser that knows the reader's time zone, and sent as
 * ISO — a server on UTC handed "14:30" cannot know whose 14:30 it meant.
 */
export default function MeetingRequestForm({ to, name, t }: { to: string; name: string; t: Dictionary }) {
  const [state, action] = useFormState<MeetingState, FormData>(requestMeeting, {});
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState("");
  const [min, setMin] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Computed after mount: the server's clock and zone are not the reader's.
  useEffect(() => setMin(localInputValue(new Date(Date.now() + 30 * 60e3))), []);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setLocal("");
      setOpen(false);
    }
  }, [state]);

  const iso = local ? new Date(local).toISOString() : "";

  if (!open) {
    return (
      <div>
        <button type="button" onClick={() => setOpen(true)} className="btn-outline w-full sm:w-auto">
          {t.network.requestMeeting}
        </button>
        {state.ok && (
          <p role="status" className="mt-2 text-sm text-green-700">
            {fmt(t.network.meetingRequested, { name })}
          </p>
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-semibold text-gray-900">{fmt(t.network.meetingWith, { name })}</p>
      <input type="hidden" name="to" value={to} />
      <input type="hidden" name="startsAt" value={iso} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="meet-when">{t.network.when}</label>
          <input
            id="meet-when"
            type="datetime-local"
            required
            min={min || undefined}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500">{t.network.localTimeHint}</p>
        </div>
        <div>
          <label className="label" htmlFor="meet-duration">{t.network.duration}</label>
          <select id="meet-duration" name="duration" defaultValue="30" className="input">
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="meet-note">{t.network.note}</label>
        <textarea id="meet-note" name="note" maxLength={500} rows={2} className="input" placeholder={t.network.notePlaceholder} />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Submit t={t} />
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          {t.common.cancel}
        </button>
      </div>
    </form>
  );
}
