import Link from "next/link";
import { logout } from "@/lib/actions/auth";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppShell({
  homeHref,
  profileName,
  children,
}: {
  homeHref: string;
  profileName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href={homeHref}
            className="font-semibold text-zinc-900 dark:text-zinc-50"
          >
            My Properties
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                {initials(profileName)}
              </span>
              <span className="hidden sm:inline">{profileName}</span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
