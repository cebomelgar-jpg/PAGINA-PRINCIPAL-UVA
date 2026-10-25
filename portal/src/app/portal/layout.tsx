import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  return (
    <AppShell profile={profile} mode="portal">
      {children}
    </AppShell>
  );
}
