import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  /*
   * `error` keeps NextAuth's own failures on a real page. Unset, it renders
   * /api/auth/error — an unstyled "There is a problem with the server
   * configuration" screen with no navigation, which is what supporters were
   * shown. /login accepts an ?error= code and explains itself.
   */
  pages: { signIn: "/admin/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        /*
         * The database lookup is guarded because of how NextAuth treats a
         * THROWN error here, which is nothing like how it treats a returned
         * null.
         *
         * Returning null is an ordinary failed sign-in: the client gets
         * CredentialsSignin and the page says the credentials are wrong.
         * Throwing is treated as the configuration being broken — NextAuth
         * sends the visitor to /api/auth/error and shows "There is a problem
         * with the server configuration", a page with no way back.
         *
         * Prisma throws for reasons that have nothing to do with the
         * configuration: the database is unreachable (P1001), or the tables do
         * not exist yet because no migration has run (P2021). Unguarded, a
         * database that is merely asleep presents itself to every supporter as
         * a broken application.
         *
         * So the error is logged in full server-side — where the board can
         * find it in the Vercel runtime logs — and the sign-in fails the
         * ordinary way. The tradeoff is real and deliberate: during a database
         * outage everyone is told their credentials are wrong, which is
         * misleading. It is still better than the alternative, and the log
         * line below is what distinguishes the two cases.
         */
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
        } catch (error) {
          console.error(
            "[auth] database lookup failed during authorize — this is an " +
              "infrastructure fault, not a bad password. Check DATABASE_URL " +
              "and whether the schema has been pushed.",
            error
          );
          return null;
        }

        if (!user || !user.active) return null;

        try {
          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) return null;
        } catch (error) {
          // A malformed or empty hash in the row makes bcrypt throw rather
          // than return false; same reasoning as above.
          console.error("[auth] password comparison failed", error);
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  /*
   * Explicit, and checked above rather than left to fail silently.
   *
   * NEXTAUTH_SECRET missing in production is the OTHER cause of the same
   * "problem with the server configuration" page, and it is indistinguishable
   * from a database fault by looking at the browser. The check below says
   * which one it is, in the logs, at startup instead of at first sign-in.
   */
  secret: process.env.NEXTAUTH_SECRET,
};

/*
 * ── A NOTE ON PROXIED ORIGINS, next-auth v4 AND VERCEL ───────────────────────
 *
 * There is no `trustHost` option in next-auth v4, and setting AUTH_TRUST_HOST
 * on Vercel changes nothing: v4 resolves the origin as
 *
 *     if (process.env.VERCEL ?? process.env.AUTH_TRUST_HOST)
 *         return `${proto}://${forwardedHost}`;
 *     return process.env.NEXTAUTH_URL;
 *
 * (node_modules/next-auth/utils/detect-origin.js). VERCEL is always set on a
 * Vercel deployment, so that first branch always wins and NEXTAUTH_URL is not
 * consulted at all. The origin therefore comes from the forwarded host — which,
 * for a request the public site proxies in, is this deployment's own hostname.
 *
 * That is harmless for the current sign-in, which calls signIn({redirect:
 * false}) and never follows a NextAuth-generated absolute URL, and for the
 * middleware, which redirects to relative paths. It would stop being harmless
 * for any flow that relies on NextAuth building an absolute callback URL. If
 * one is ever added, the fix is to give the upstream the public host, not to
 * set AUTH_TRUST_HOST.
 */
if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    "[auth] NEXTAUTH_SECRET is not set. NextAuth cannot sign session tokens " +
      "and every sign-in will fail with a configuration error. Set it in the " +
      "Vercel project environment variables."
  );
}
