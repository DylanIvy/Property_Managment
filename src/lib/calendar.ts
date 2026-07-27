// "Today" must reflect the viewer's local calendar day, not UTC — using UTC
// here would roll over to the next day for anyone west of Greenwich in the
// evening (e.g. flips at 4pm PT).
function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface CalendarDay {
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  inCurrentMonth: boolean;
  isToday: boolean;
}

// Always returns 42 days (6 full weeks, Sun-Sat) so the grid covers any month.
export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(gridStart.getUTCDate() - firstOfMonth.getUTCDay());

  const todayKey = localDateKey(new Date());
  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + i);
    const dateKey = date.toISOString().slice(0, 10);
    days.push({
      date,
      dateKey,
      inCurrentMonth: date.getUTCMonth() === month,
      isToday: dateKey === todayKey,
    });
  }

  return days;
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function monthParam(year: number, month: number): string {
  const normalized = new Date(Date.UTC(year, month, 1));
  return `${normalized.getUTCFullYear()}-${String(normalized.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthParam(param?: string): { year: number; month: number } {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number);
    return { year, month: month - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}
