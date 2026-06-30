import { AdminHeader } from "@/components/admin/ui";
import PackageForm from "../PackageForm";
import { createPackage } from "../actions";

export default function NewPackage() {
  return (
    <>
      <AdminHeader title="Nouveau package" />
      <PackageForm action={createPackage} />
    </>
  );
}
