"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole, getSession } from "@/lib/session";
import { str, optStr, bool } from "@/lib/form-utils";
import type { Role } from "@prisma/client";

const MANAGERS: Role[] = ["SUPER_ADMIN", "ADMIN"];

export async function createUser(fd: FormData) {
  await requireRole(MANAGERS);
  const password = str(fd, "password");
  if (!password) throw new Error("Password required");
  await prisma.user.create({
    data: {
      name: str(fd, "name"),
      email: str(fd, "email").toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: (str(fd, "role") || "EDITOR") as Role,
      active: bool(fd, "active"),
    },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(fd: FormData) {
  await requireRole(MANAGERS);
  const id = str(fd, "id");
  const password = optStr(fd, "password");
  const data: any = {
    name: str(fd, "name"),
    email: str(fd, "email").toLowerCase(),
    role: (str(fd, "role") || "EDITOR") as Role,
    active: bool(fd, "active"),
  };
  if (password) data.password = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(fd: FormData) {
  const session = await requireRole(MANAGERS);
  const id = str(fd, "id");
  // Prevent deleting yourself.
  if (session.id === id) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
