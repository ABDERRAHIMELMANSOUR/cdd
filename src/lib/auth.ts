import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/**
 * The signing secret, under either name.
 *
 * next-auth v4 reads `NEXTAUTH_SECRET` and ONLY that name — `AUTH_SECRET` is
 * the Auth.js v5 spelling and appears nowhere in v4's source. Setting the v5
 * name on a v4 app therefore looks exactly like setting nothing: every auth
 * endpoint answers 500 with MissingSecretError / NO_SECRET, which is a
 * miserable thing to debug when the variable is plainly there in the
 * dashboard.
 *
 * Accepting both removes that trap. `.trim()` and the emptiness check matter
 * too: a variable pasted with a trailing newline, or created and left blank,
 * is present but useless, and `process.env.X` being "" is falsy in a way that
 * silently reproduces the same failure.
 */
const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim() || undefined;

/**
 * Say which of the four failures happened — but only when asked.
 *
 * authorize() returns null for four different reasons and the sign-in page
 * shows one message for all of them, deliberately: telling a stranger which
 * addresses exist is how an attacker enumerates the membership. That privacy
 * is correct and stays. It is also why a genuine misconfiguration is so hard
 * to diagnose — "no such user", "account deactivated", "wrong password" and
 * "the database is unreachable" are indistinguishable from the outside.
 *
 * Setting AUTH_DEBUG=1 writes the distinction to the SERVER log, where only
 * someone with access to the Vercel runtime logs can read it. Remove the
 * variable once the question is answered; there is no reason to keep a record
 * of which addresses tried to sign in.
 *
 * The password is never logged. The stored hash is truncated to its prefix —
 * `$2a$06$` says which algorithm and cost produced it, which is the diagnostic
 * value, while the remainder stays out of the log.
 */
function debug(email: string, message: string) {
  if (process.env.AUTH_DEBUG !== "1") return;
  console.warn(`[auth:debug] ${email.toLowerCase()} — ${message}`);
}

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

        if (!user) {
          debug(credentials.email, "NO SUCH USER — nothing in the table matches this address (lowercased).");
          return null;
        }
        if (!user.active) {
          debug(credentials.email, "FOUND but active=false — refused before the password is checked.");
          return null;
        }

        try {
          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) {
            debug(
              credentials.email,
              `FOUND, active, but the password does not match the stored hash ` +
                `(${user.password.slice(0, 7)}…, role=${user.role}, status=${user.status}).`
            );
            return null;
          }
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
  secret: AUTH_SECRET,
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
if (!AUTH_SECRET) {
  console.error(
    "[auth] NO SIGNING SECRET. Neither NEXTAUTH_SECRET nor AUTH_SECRET is " +
      "set (or one is set but empty). Every auth endpoint will answer 500 " +
      "with MissingSecretError, /portal will refuse to render, and sign-in " +
      "cannot work. Fix: generate one with `openssl rand -base64 32` and add " +
      "it as NEXTAUTH_SECRET to the Vercel project environment variables for " +
      "Production, Preview and Development, then REDEPLOY — environment " +
      "variables are read at deploy time, so saving one changes nothing until " +
      "a new deployment is built."
  );
}
