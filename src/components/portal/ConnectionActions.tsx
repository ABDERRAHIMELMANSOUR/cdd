import Link from "next/link";
import type { ConnectionState } from "@/lib/connections";
import { requestConnection, respondConnection, removeConnection } from "@/app/portal/network/actions";
import ConfirmSubmit from "@/app/portal/feed/ConfirmSubmit";
import type { Dictionary } from "@/i18n/portal";

/**
 * The buttons on someone's profile, by where the viewer stands with them:
 * Connect → Request sent (withdraw) → Connected (message). An incoming
 * request shows Accept / Decline instead. `contactable` is true for staff on
 * either side, who may always write.
 */
export default function ConnectionActions({
  memberId,
  state,
  contactable,
  t,
}: {
  memberId: string;
  state: ConnectionState;
  contactable: boolean;
  t: Dictionary;
}) {
  const message = (
    <Link href={`/portal/messages/${memberId}`} className="btn-primary text-center">
      {t.profile.message}
    </Link>
  );

  if (state.kind === "connected") {
    return (
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        {message}
        <span className="text-center text-xs font-medium text-green-700 sm:text-right">✓ {t.network.connected}</span>
      </div>
    );
  }

  if (state.kind === "incoming") {
    return (
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <p className="text-sm text-gray-600">{t.network.wantsToConnect}</p>
        <div className="flex gap-2">
          <form action={respondConnection}>
            <input type="hidden" name="id" value={state.id} />
            <button name="decision" value="accept" className="btn-primary">{t.network.accept}</button>
          </form>
          <form action={respondConnection}>
            <input type="hidden" name="id" value={state.id} />
            <button name="decision" value="decline" className="btn-ghost">{t.network.decline}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
      {state.kind === "outgoing" ? (
        <ConfirmSubmit action={removeConnection} confirm={t.network.confirmWithdraw}>
          <input type="hidden" name="id" value={state.id} />
          <button className="btn-outline w-full" title={t.network.withdraw}>
            {t.network.requestSent}
          </button>
        </ConfirmSubmit>
      ) : (
        <form action={requestConnection}>
          <input type="hidden" name="to" value={memberId} />
          <button className="btn-primary w-full">+ {t.network.connect}</button>
        </form>
      )}
      {/* Staff may always write; supporters only once connected. */}
      {contactable && message}
    </div>
  );
}
