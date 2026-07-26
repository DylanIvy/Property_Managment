import { requireRole } from "@/lib/dal";
import { AppShell } from "@/components/app-shell";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("staff");

  return (
    <AppShell homeHref="/staff/properties" profileName={profile.name ?? profile.email ?? "Staff"}>
      {children}
    </AppShell>
  );
}
