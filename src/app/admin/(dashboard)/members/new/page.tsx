import { requireRole } from "@/lib/session";
import { AdminHeader, Panel } from "@/components/admin/ui";
import MemberForm from "../MemberForm";
import { createMember } from "../actions";

export default async function NewMember() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  return (
    <>
      <AdminHeader
        title="Nouveau supporter"
        subtitle="Créez un accès à la plateforme communautaire et transmettez le mot de passe provisoire à l'intéressé."
      />
      <Panel className="p-6">
        <MemberForm action={createMember} />
      </Panel>
    </>
  );
}
