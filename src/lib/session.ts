import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  return getServerSession(authOptions);
}

/** Require a logged-in admin user; redirect to login otherwise. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");
  return session.user;
}

/** Require one of the given roles; redirect to dashboard if not allowed. */
export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/admin");
  return user;
}

// ─── Community portal ────────────────────────────────────────────────────────

/** Roles that belong to CDD staff rather than to a supporter. */
export const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

export function isStaff(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

/**
 * Require a signed-in user who may use the community portal.
 *
 * Middleware has already established that there IS a session — this re-reads
 * it server-side because middleware runs on a token, not on the database. A
 * token issued before the board suspended someone stays valid until it
 * expires, so a check that only trusts the JWT keeps a suspended supporter
 * inside the portal for the life of their session. This asks the database.
 *
 * Staff are admitted deliberately: the board needs to see what supporters see,
 * and a moderator who cannot open the feed cannot moderate it.
 */
export async function requireMember() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      active: true,
      status: true,
    },
  });

  if (!user || !user.active) redirect("/login?error=inactive");

  // Staff bypass the supporter approval flow; they were never in it.
  if (!isStaff(user.role) && user.status !== "ACTIVE") {
    redirect(user.status === "SUSPENDED" ? "/login?error=suspended" : "/portal/pending");
  }

  return user;
}
