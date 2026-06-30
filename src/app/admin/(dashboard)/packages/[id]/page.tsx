import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/ui";
import PackageForm from "../PackageForm";
import { updatePackage } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPackage({ params }: { params: { id: string } }) {
  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) notFound();
  return (
    <>
      <AdminHeader title="Éditer le package" />
      <PackageForm action={updatePackage} pkg={pkg} />
    </>
  );
}
