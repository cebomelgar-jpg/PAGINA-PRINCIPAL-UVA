import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();
  return (
    <AppShell profile={profile} mode="admin">
      {children}
    </AppShell>
  );
}
