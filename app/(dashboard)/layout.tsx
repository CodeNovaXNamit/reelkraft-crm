import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentActor } from "@/lib/auth/current-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getCurrentActor();

  return <AppShell actor={actor}>{children}</AppShell>;
}
