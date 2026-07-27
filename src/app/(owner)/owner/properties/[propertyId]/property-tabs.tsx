"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function PropertyTabs({ propertyId }: { propertyId: string }) {
  const pathname = usePathname();
  const base = `/owner/properties/${propertyId}`;
  const tabs = [
    { label: "Staff directory", href: base },
    { label: "Tasks", href: `${base}/tasks` },
    { label: "Messages", href: `${base}/messages` },
  ];

  return (
    <nav className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
              active
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
