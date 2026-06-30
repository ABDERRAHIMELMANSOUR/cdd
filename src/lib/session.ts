import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

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
