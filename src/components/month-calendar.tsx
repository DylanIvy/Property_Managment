import Link from "next/link";
import { getMonthGrid, formatMonthLabel, monthParam } from "@/lib/calendar";
import { cn } from "@/lib/cn";

export type CalendarEvent = {
  id: string;
  label: string;
  href: string;
  done: boolean;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({
  year,
  month,
  events,
  basePath,
  extraParams = {},
}: {
  year: number;
  month: number;
  events: Record<string, CalendarEvent[]>;
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  const days = getMonthGrid(year, month);
  const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };

  const hrefFor = (params: Record<string, string>) => {
    const search = new URLSearchParams({ ...extraParams, ...params }).toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {formatMonthLabel(year, month)}
        </h2>
        <div className="flex gap-2 text-sm">
          <Link
            href={hrefFor({ month: monthParam(prev.year, prev.month) })}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          >
            ←
          </Link>
          <Link href={hrefFor({})} className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700">
            Today
          </Link>
          <Link
            href={hrefFor({ month: monthParam(next.year, next.month) })}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          >
            →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 text-xs dark:border-zinc-800 dark:bg-zinc-800">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-zinc-50 p-2 text-center font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
          >
            {label}
          </div>
        ))}
        {days.map((day) => {
          const dayEvents = events[day.dateKey] ?? [];
          return (
            <div
              key={day.dateKey}
              className={cn(
                "min-h-24 bg-white p-1.5 dark:bg-zinc-950",
                !day.inCurrentMonth && "bg-zinc-50 dark:bg-zinc-900/50",
              )}
            >
              <div
                className={cn(
                  "mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full",
                  day.isToday
                    ? "bg-blue-600 font-semibold text-white"
                    : day.inCurrentMonth
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-400 dark:text-zinc-600",
                )}
              >
                {day.date.getUTCDate()}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={event.href}
                    title={event.label}
                    className={cn(
                      "block truncate rounded px-1 py-0.5",
                      event.done
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
                    )}
                  >
                    {event.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
