import { requireMember } from "@/lib/session";
import { isStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import PortalNav from "@/components/portal/PortalNav";

// Every portal page reads the signed-in user, so none of it can be static.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Espace donateurs",
  // The portal is private; keeping it out of search results is the least that
  // should be true of it.
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMember();

  // Cheap presence signal for the directory. Fire-and-forget: a failed write
  // here must never block the page, because nothing depends on it being exact.
  prisma.user
    .update({ where: { id: user.id }, data: { lastSeenAt: new Date() } })
    .catch(() => {});

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav name={user.name || user.email || ""} isStaff={isStaff(user.role)} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">{children}</main>
    </div>
  );
}
