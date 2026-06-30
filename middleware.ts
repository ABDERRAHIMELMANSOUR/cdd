import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protects every /admin route except the login page.
// Role checks for sensitive actions (e.g. user management) are enforced
// server-side in the relevant route handlers / server actions.
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: { signIn: "/admin/login" },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Run on all /admin paths except the login page and NextAuth API.
  matcher: ["/admin/((?!login).*)"],
};
