// Root admin layout — intentionally minimal so the /admin/login page can render
// full-screen. The authenticated dashboard chrome lives in (dashboard)/layout.tsx.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
