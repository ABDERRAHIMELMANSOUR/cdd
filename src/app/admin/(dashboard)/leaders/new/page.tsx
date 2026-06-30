import { AdminHeader } from "@/components/admin/ui";
import LeaderForm from "../LeaderForm";
import { createLeader } from "../actions";

export default function NewLeader() {
  return (
    <>
      <AdminHeader title="Nouveau membre de direction" />
      <LeaderForm action={createLeader} />
    </>
  );
}
