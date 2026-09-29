"use server";

import { cookies } from "next/headers";
import { isLocale } from "./portal";
import { LOCALE_COOKIE } from "./locale";

/**
 * Store the reader's language choice.
 *
 * A year, because a language preference is not a session: someone who picked
 * Dutch in March should still get Dutch in November. httpOnly is deliberately
 * false — nothing here is a secret, and leaving it readable lets client code
 * format dates in the same locale without a second source of truth.
 *
 * `sameSite: lax` rather than strict: the portal is reached by following a
 * link from cddpaysbas.nl, and strict would drop the cookie on exactly that
 * navigation.
 */
export async function setLocale(formData: FormData) {
  const next = formData.get("locale");
  if (!isLocale(next)) return;

  cookies().set(LOCALE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
}
