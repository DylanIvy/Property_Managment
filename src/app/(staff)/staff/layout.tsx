import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("staff");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/staff/properties" className="font-semibold">
          My Properties
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span>{profile.name ?? profile.email}</span>
          <form action={logout}>
            <button type="submit" className="underline">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
