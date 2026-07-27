import Link from "next/link";
import { cn } from "@/lib/cn";

export function ViewToggle({ view, basePath }: { view: "list" | "calendar"; basePath: string }) {
  const activeClasses = "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
  const inactiveClasses = "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800";

  return (
    <div className="inline-flex self-start rounded-md border border-zinc-300 text-sm dark:border-zinc-700">
      <Link
        href={basePath}
        className={cn("rounded-l-md px-3 py-1", view === "list" ? activeClasses : inactiveClasses)}
      >
        List
      </Link>
      <Link
        href={`${basePath}?view=calendar`}
        className={cn(
          "rounded-r-md border-l border-zinc-300 px-3 py-1 dark:border-zinc-700",
          view === "calendar" ? activeClasses : inactiveClasses,
        )}
      >
        Calendar
      </Link>
    </div>
  );
}
