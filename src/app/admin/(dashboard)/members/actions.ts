"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { str, optStr } from "@/lib/form-utils";
import type { MemberStatus } from "@prisma/client";

/**
 * Supporter account administration.
 *
 * ── WHY EVERY ACTION RE-CHECKS THE ROLE ──────────────────────────────────────
 * The middleware already keeps supporters out of /admin, but middleware guards
 * *navigation*, not *invocation*. A server action is a POST endpoint with a
 * stable id; anything that can make an HTTP request can call one directly,
 * without ever loading the page the middleware protects. So the check that
 * actually decides whether someone may suspend an account has to live here.
 *
 * ── WHY THIS IS SEPARATE FROM /admin/users ───────────────────────────────────
 * /admin/users manages staff logins for the CMS. These are supporters of the
 * foundation, in the hundreds rather than the handful, with a lifecycle staff
 * accounts do not have (pending → active → suspended). Mixing them puts a
 * "delete" button for a supporter next to the one for the super admin, and
 * makes the staff list unusable the moment the portal has real sign-ups.
 */

const MANAGERS = ["SUPER_ADMIN", "ADMIN"] as const;

const STATUSES: MemberStatus[] = ["PENDING", "ACTIVE", "SUSPENDED"];

function statusFrom(fd: FormData, key = "status"): MemberStatus {
  const value = str(fd, key) as MemberStatus;
  return STATUSES.includes(value) ? value : "PENDING";
}

/**
 * Role is deliberately NOT read from the form in any of these actions.
 *
 * This screen creates and edits supporters; it writes MEMBER and nothing else.
 * Accepting a role from the request would turn a form field into a privilege
 * escalation — an edited POST to this action promoting the sender to ADMIN.
 * Staff roles are granted in /admin/users, by someone who went there on
 * purpose.
 */
export async function createMember(fd: FormData) {
  await requireRole([...MANAGERS]);

  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (!email) throw new Error("Email requis.");
  if (password.length < 10) {
    throw new Error("Le mot de passe provisoire doit faire au moins 10 caractères.");
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new Error("Un compte existe déjà avec cette adresse.");

  await prisma.user.create({
    data: {
      name: str(fd, "name"),
      email,
      password: await bcrypt.hash(password, 10),
      role: "MEMBER",
      active: true,
      status: statusFrom(fd),
      position: optStr(fd, "position"),
      company: optStr(fd, "company"),
      commission: optStr(fd, "commission"),
    },
  });

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function updateMember(fd: FormData) {
  await requireRole([...MANAGERS]);

  const id = str(fd, "id");
  const password = optStr(fd, "password");

  // `select` rather than a bare update: this screen must not be able to reach
  // a staff account by id, whatever id arrives in the form.
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target || target.role !== "MEMBER") throw new Error("Compte introuvable.");

  const data: {
    name: string;
    email: string;
    status: MemberStatus;
    position: string | null;
    company: string | null;
    commission: string | null;
    password?: string;
  } = {
    name: str(fd, "name"),
    email: str(fd, "email").toLowerCase(),
    status: statusFrom(fd),
    position: optStr(fd, "position"),
    company: optStr(fd, "company"),
    commission: optStr(fd, "commission"),
  };

  if (password) {
    if (password.length < 10) {
      throw new Error("Le mot de passe doit faire au moins 10 caractères.");
    }
    data.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

/**
 * One-click status change from the list, so approving a queue of sign-ups does
 * not mean opening and saving a form for each of them.
 */
export async function setMemberStatus(fd: FormData) {
  await requireRole([...MANAGERS]);
  const id = str(fd, "id");
  const status = statusFrom(fd);

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target || target.role !== "MEMBER") return;

  await prisma.user.update({ where: { id }, data: { status } });
  revalidatePath("/admin/members");
}

/**
 * Deleting a supporter destroys their posts, comments and likes by cascade.
 * Suspension is the reversible action and is what the list offers first;
 * deletion stays available for a sign-up that should never have existed (a
 * duplicate, a test account, an AVG erasure request).
 */
export async function deleteMember(fd: FormData) {
  await requireRole([...MANAGERS]);
  const id = str(fd, "id");

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target || target.role !== "MEMBER") return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/members");
}
