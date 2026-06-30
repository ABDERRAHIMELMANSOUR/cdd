import { requireUser } from "@/lib/session";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar name={user.name || user.email || "Admin"} role={user.role} />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-8 pt-16 lg:pt-8">{children}</div>
      </div>
    </div>
  );
}
