import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Route protection for the two private areas.
 *
 *   /admin/*   CMS and member administration — staff only
 *   /portal/*  community portal — supporters, and staff who want to look
 *
 * ── WHY THIS IS NOW ROLE-AWARE ──────────────────────────────────────────────
 * It used to authorise on `!!token`: any signed-in user reached any /admin
 * page. That was safe only because every account in the database was staff.
 * The moment the MEMBER role exists, that same rule hands every supporter the
 * CMS — they sign in to the portal and walk into /admin/users carrying a token
 * that is, as far as that check is concerned, perfectly valid.
 *
 * So the gate reads the role, not merely the presence of a session.
 *
 * ── WHY `authorized` ALWAYS RETURNS TRUE ────────────────────────────────────
 * Not a weakening. `withAuth` takes a single `signIn` page, but this app has
 * two: staff sign in at /admin/login, supporters at /login. Sending a
 * supporter to the staff login — or a staff member to the supporter one — is
 * a dead end in both directions. Letting the middleware body run for every
 * request lets it decide WHERE to send an unauthenticated visitor. The
 * redirect below is the authentication check; it simply happens one function
 * later than the default.
 *
 * Role checks for individual destructive actions still belong server-side in
 * the route handlers and server actions. Middleware decides who may see a
 * section; it is not a substitute for checking who may delete a row.
 */

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

export default withAuth(
  function middleware(request) {
    const { pathname, search } = request.nextUrl;
    const token = request.nextauth.token;
    const isAdminArea = pathname.startsWith("/admin");

    if (!token) {
      const loginPath = isAdminArea ? "/admin/login" : "/login";
      const url = new URL(loginPath, request.url);
      // So the visitor lands where they were going rather than on a generic
      // dashboard, having forgotten why they clicked.
      url.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }

    // A supporter who lands on the CMS goes to the portal, not to a 403 they
    // can do nothing about.
    if (isAdminArea && !STAFF_ROLES.includes(token.role as string)) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // See the note above: the middleware body performs this check itself so
      // it can choose between two sign-in pages.
      authorized: () => true,
    },
  }
);

export const config = {
  /*
   * Both private areas, minus their own sign-in pages — matching those would
   * redirect an unauthenticated visitor to a login page that itself requires a
   * login.
   */
  matcher: ["/admin/((?!login).*)", "/portal/:path*"],
};
