"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { importRoster, type RosterResult } from "@/lib/roster";

/**
 * Run the roster import from the admin screen.
 *
 * SUPER_ADMIN only — narrower than the rest of /admin on purpose. This writes
 * twenty-nine rows to the members table in one click; an EDITOR who moderates
 * the feed has no business triggering it, and the role check lives here rather
 * than in middleware because a server action is a POST endpoint that can be
 * called without ever loading the page middleware guards.
 *
 * There is no secret token and no unauthenticated route. A URL that seeds a
 * production database is a URL that gets pasted into a chat, logged by a proxy
 * and eventually crawled; the session already proves who is asking.
 */
export type RosterState = { result?: RosterResult; error?: string };

export async function runRosterImport(
  _prev: RosterState,
  formData: FormData
): Promise<RosterState> {
  await requireRole(["SUPER_ADMIN"]);

  const apply = formData.get("apply") === "true";

  try {
    const result = await importRoster({ apply });
    if (apply) {
      revalidatePath("/admin/roster");
      revalidatePath("/admin/members");
      revalidatePath("/portal/directory");
      revalidatePath("/portal");
    }
    return { result };
  } catch (error) {
    // The likely failures are infrastructural — database unreachable, schema
    // not pushed — and the message is what makes them actionable.
    return { error: (error as Error).message };
  }
}
