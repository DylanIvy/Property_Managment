import { requireRole } from "@/lib/dal";
import { AppShell } from "@/components/app-shell";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("owner");

  return (
    <AppShell homeHref="/owner/properties" profileName={profile.name ?? profile.email ?? "Owner"}>
      {children}
    </AppShell>
  );
}
