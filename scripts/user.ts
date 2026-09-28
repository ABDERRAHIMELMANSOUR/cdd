/**
 * Diagnose the database and create or repair a login.
 *
 * ── WHY THIS EXISTS SEPARATELY FROM prisma/seed.ts ───────────────────────────
 * The seed creates ONE account, from ADMIN_EMAIL, and its upsert passes
 * `update: {}` — so running it again against a database that already has that
 * account changes nothing. It cannot create a second person and it cannot
 * reset a forgotten password. Both are ordinary operations for a foundation
 * whose board changes, so they get a tool rather than a schema edit.
 *
 * It also answers the question that comes first: is the database reachable at
 * all, and has the schema ever been pushed? Those two failures and "wrong
 * password" are indistinguishable from the sign-in page, because the auth
 * layer deliberately refuses to tell an attacker which addresses exist.
 *
 *   npm run user -- --check
 *   npm run user -- --check --email abdo@cdd.nl
 *   npm run user -- --email abdo@cdd.nl --password '…' --role SUPER_ADMIN
 *   npm run user -- --email someone@example.org --password '…'   (a supporter)
 *
 * Run it from a machine that can reach the database, with DATABASE_URL set —
 * the same value Vercel uses. It never prints the password.
 */
import { PrismaClient, Role, MemberStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── argument parsing ─────────────────────────────────────────────────────────
// Hand-rolled rather than a dependency: this takes five flags and adding a CLI
// library to a production install to parse them is a poor trade.
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  const inline = process.argv.find((a) => a.startsWith(`--${name}=`));
  return inline?.slice(name.length + 3);
}
const has = (name: string) => process.argv.includes(`--${name}`);

const ROLES = Object.values(Role) as string[];

function fail(message: string, hint?: string): never {
  console.error(`\n✗ ${message}`);
  if (hint) console.error(`\n  ${hint}`);
  console.error("");
  process.exit(1);
}

/**
 * Turn Prisma's error codes into the sentence that actually helps.
 *
 * P1001 and P2021 are the two that matter here and they mean opposite things:
 * one is "I cannot reach the server", the other is "I reached it and the
 * tables are not there". Conflating them sends people to re-check a
 * connection string that was correct all along.
 */
function explain(error: unknown): never {
  const code = (error as { code?: string })?.code;
  const message = (error as { message?: string })?.message ?? String(error);

  if (code === "P1001") {
    fail(
      "Cannot reach the database server (P1001).",
      "Check DATABASE_URL. On Supabase use the pooler host from Project\n" +
        "  Settings → Database → Connection pooling, and note the username is\n" +
        "  postgres.<project-ref>, not postgres. A password containing @ : / ? # &\n" +
        "  must be percent-encoded."
    );
  }
  if (code === "P2021" || /does not exist in the current database/i.test(message)) {
    fail(
      "Connected, but the tables do not exist (P2021).",
      "The schema has never been pushed to this database. Run:\n\n" +
        "      npx prisma db push\n\n" +
        "  then run this script again."
    );
  }
  if (code === "P1000") {
    fail(
      "Authentication against the database failed (P1000).",
      "The host is right but the credentials are not. On Supabase the username\n" +
        "  is postgres.<project-ref>; a plain `postgres` fails with a password that\n" +
        "  is otherwise correct."
    );
  }
  fail(`Database error${code ? ` (${code})` : ""}: ${message}`);
}

async function diagnose(email?: string) {
  console.log("\n── Database ──────────────────────────────────────────────────");

  const target = process.env.DATABASE_URL;
  if (!target) fail("DATABASE_URL is not set.", "Copy .env.example to .env and fill it in.");
  // Host only. The password is in this string and must not reach a terminal
  // log, a screenshot, or a pasted support thread.
  console.log(`  host        ${target.replace(/\/\/[^@]*@/, "//***@").split("?")[0]}`);

  let count: number;
  try {
    count = await prisma.user.count();
  } catch (error) {
    explain(error);
  }

  console.log(`  schema      present`);
  console.log(`  users       ${count}`);

  if (count === 0) {
    console.log(
      "\n  The schema is there but no account exists, so every sign-in will\n" +
        "  fail. Create one with:\n\n" +
        "      npm run user -- --email you@example.org --password '…' --role SUPER_ADMIN"
    );
  }

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        email: true,
        name: true,
        role: true,
        active: true,
        status: true,
        password: true,
        createdAt: true,
      },
    });

    console.log(`\n── ${email.toLowerCase()} ─────────────────────────────`);
    if (!user) {
      console.log("  NOT FOUND — this is why sign-in says the credentials are invalid.");
      console.log(
        "\n  Create it:\n\n" +
          `      npm run user -- --email ${email.toLowerCase()} --password '…' --role SUPER_ADMIN`
      );
    } else {
      // A hash that is not a bcrypt hash means the row was written by
      // something that stored the password in the clear, or truncated it.
      const looksHashed = /^\$2[aby]\$\d{2}\$/.test(user.password);
      console.log(`  name        ${user.name}`);
      console.log(`  role        ${user.role}`);
      console.log(`  active      ${user.active}`);
      console.log(`  status      ${user.status}`);
      console.log(`  password    ${looksHashed ? "bcrypt hash ✓" : "NOT A BCRYPT HASH ✗"}`);
      console.log(`  created     ${user.createdAt.toISOString()}`);

      if (!user.active) {
        console.log("\n  active=false — authorize() refuses this account before checking the password.");
      }
      if (user.role === "MEMBER" && user.status !== "ACTIVE") {
        console.log(
          `\n  role=MEMBER with status=${user.status} — sign-in succeeds, then the portal\n` +
            "  redirects to /portal/pending. Set --status ACTIVE to fix."
        );
      }
      if (!looksHashed) {
        console.log("\n  Re-set the password with this script to store a proper hash.");
      }
    }
  }
  console.log("");
}

async function upsertUser() {
  const email = arg("email")?.toLowerCase();
  const password = arg("password");
  const name = arg("name");
  const roleArg = arg("role") ?? "MEMBER";
  const statusArg = arg("status") ?? "ACTIVE";

  if (!email) fail("--email is required.");
  if (!password) fail("--password is required.");
  if (password.length < 10) {
    fail("The password must be at least 10 characters.", "Match what the admin UI enforces.");
  }
  if (!ROLES.includes(roleArg)) {
    fail(`--role must be one of: ${ROLES.join(", ")}`);
  }
  if (!Object.values(MemberStatus).includes(statusArg as MemberStatus)) {
    fail(`--status must be one of: ${Object.values(MemberStatus).join(", ")}`);
  }

  const role = roleArg as Role;
  /*
   * status defaults to ACTIVE here, not to the schema default of PENDING.
   * Somebody running a command-line tool to mint an account intends it to be
   * usable; leaving it PENDING produces an account that signs in successfully
   * and then lands on the "awaiting approval" page, which reads as a bug.
   * PENDING is the right default for a self-service sign-up, not for this.
   */
  const status = statusArg as MemberStatus;

  const hashed = await bcrypt.hash(password, 10);

  // Verified rather than assumed: if the hash cannot be compared back, the
  // account would be created and nobody could ever sign in with it, and the
  // failure would surface days later as "the password does not work".
  if (!(await bcrypt.compare(password, hashed))) {
    fail("The bcrypt hash did not verify against its own input — refusing to write it.");
  }

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  } catch (error) {
    explain(error);
  }

  const user = await prisma.user.upsert({
    where: { email },
    // An existing account keeps its name unless one is given: this doubles as
    // a password reset, and a reset should not quietly rename anybody.
    update: { password: hashed, role, status, active: true, ...(name ? { name } : {}) },
    create: { email, name: name ?? email.split("@")[0], password: hashed, role, status, active: true },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  console.log(`\n✓ ${existing ? "Updated" : "Created"} ${user.email}`);
  console.log(`  name    ${user.name}`);
  console.log(`  role    ${user.role}`);
  console.log(`  status  ${user.status}`);
  console.log(
    `\n  Sign in at /login${
      user.role === "MEMBER" ? "" : " — staff may also use /admin/login"
    }.\n  The password was not printed. If it is lost, run this again to set a new one.\n`
  );
}

async function main() {
  if (has("check") || process.argv.length <= 2) {
    await diagnose(arg("email"));
    return;
  }
  await upsertUser();
}

main()
  .catch((error) => explain(error))
  .finally(async () => {
    await prisma.$disconnect();
  });
