import Link from "next/link";

export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-primary">
          + {action.label}
        </Link>
      )}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}>{children}</div>
  );
}

export function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-brand">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Badge({ active, labels }: { active: boolean; labels?: [string, string] }) {
  const [on, off] = labels ?? ["Actif", "Masqué"];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? on : off}
    </span>
  );
}

export function EmptyRow({ message }: { message: string }) {
  return <div className="p-10 text-center text-sm text-gray-400">{message}</div>;
}
