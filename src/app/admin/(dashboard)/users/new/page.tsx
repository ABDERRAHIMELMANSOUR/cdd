import { requireRole } from "@/lib/session";
import { AdminHeader } from "@/components/admin/ui";
import UserForm from "../UserForm";
import { createUser } from "../actions";

export default async function NewUser() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  return (
    <>
      <AdminHeader title="Nouvel utilisateur" />
      <UserForm action={createUser} />
    </>
  );
}
