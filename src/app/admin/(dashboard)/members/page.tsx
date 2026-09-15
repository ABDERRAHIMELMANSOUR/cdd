import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { requireRole } from "@/lib/session";
import { AdminHeader, Panel, EmptyRow } from "@/components/admin/ui";
import { commissionLabel } from "@/lib/portal";
import DeleteButton from "@/components/admin/DeleteButton";
import { setMemberStatus, deleteMember } from "./actions";
import type { MemberStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<MemberStatus, string> = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
};

const STATUS_STYLES: Record<MemberStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "PENDING", label: "En attente" },
  { value: "ACTIVE", label: "Actifs" },
  { value: "SUSPENDED", label: "Suspendus" },
];

/** A single-purpose submit button wrapping one server action. */
function StatusAction({
  id,
  status,
  label,
  tone,
}: {
  id: string;
  status: MemberStatus;
  label: string;
  tone: "approve" | "suspend" | "restore";
}) {
  const colour =
    tone === "suspend" ? "text-red-600" : tone === "approve" ? "text-green-700" : "text-brand";
  return (
    <form action={setMemberStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`text-xs font-medium hover:underline ${colour}`}>
        {label}
      </button>
    </form>
  );
}

export default async function MembersAdmin({
  searchParams,
}: {
  searchParams?: { status?: string; q?: string };
}) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const status = searchParams?.status ?? "";
  const q = (searchParams?.q ?? "").trim();

  const members = await safe(
    () =>
      prisma.user.findMany({
        where: {
          // Supporters only. Staff accounts are managed in /admin/users, and a
          // list that mixed the two would offer "suspend" on the super admin.
          role: "MEMBER",
          ...(status ? { status: status as MemberStatus } : {}),
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" as const } },
                  { email: { contains: q, mode: "insensitive" as const } },
                  { company: { contains: q, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          company: true,
          commission: true,
          createdAt: true,
          lastSeenAt: true,
        },
        // Pending first: this list is a queue before it is a directory, and the
        // sign-ups waiting on someone are the reason to open the page at all.
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 200,
      }),
    []
  );

  const pending = await safe(
    () => prisma.user.count({ where: { role: "MEMBER", status: "PENDING" } }),
    0
  );

  return (
    <>
      <AdminHeader
        title="Supporters"
        subtitle={
          pending > 0
            ? `${pending} inscription${pending > 1 ? "s" : ""} en attente d'approbation.`
            : "Comptes et accès de la plateforme communautaire."
        }
        action={{ href: "/admin/members/new", label: "Supporter" }}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = status === f.value;
            const href = f.value
              ? `/admin/members?status=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`
              : `/admin/members${q ? `?q=${encodeURIComponent(q)}` : ""}`;
            return (
              <Link
                key={f.label}
                href={href}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* GET so the filter lives in the URL and a filtered list is shareable. */}
        <form method="get" className="ml-auto flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nom, email, organisation…"
            aria-label="Rechercher un supporter"
            className="input !mt-0 w-56"
          />
          <button type="submit" className="rounded-md bg-gray-100 px-3 text-sm hover:bg-gray-200">
            Chercher
          </button>
        </form>
      </div>

      <Panel>
        {members.length === 0 ? (
          <EmptyRow message={q || status ? "Aucun supporter ne correspond." : "Aucun supporter inscrit."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                  <th className="p-4">Nom</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Organisation</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0">
                    <td className="p-4 font-medium text-gray-900">{m.name}</td>
                    <td className="p-4 text-gray-600">{m.email}</td>
                    <td className="p-4 text-gray-600">{m.company ?? "—"}</td>
                    <td className="p-4 text-gray-600">{commissionLabel(m.commission) ?? "—"}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[m.status]}`}
                      >
                        {STATUS_LABELS[m.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        {m.status === "PENDING" && (
                          <StatusAction id={m.id} status="ACTIVE" label="Approuver" tone="approve" />
                        )}
                        {m.status === "ACTIVE" && (
                          <StatusAction id={m.id} status="SUSPENDED" label="Suspendre" tone="suspend" />
                        )}
                        {m.status === "SUSPENDED" && (
                          <StatusAction id={m.id} status="ACTIVE" label="Réactiver" tone="restore" />
                        )}
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="text-xs font-medium text-brand hover:underline"
                        >
                          Éditer
                        </Link>
                        <DeleteButton action={deleteMember} id={m.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
