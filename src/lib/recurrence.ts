import type { RecurrenceInterval } from "@/types/database.types";

export const RECURRENCE_LABELS: Record<RecurrenceInterval, string> = {
  daily: "Repeats daily",
  weekly: "Repeats weekly",
  biweekly: "Repeats every 2 weeks",
  monthly: "Repeats monthly",
};

// dueDate is a plain "YYYY-MM-DD" date string (Postgres `date` column).
export function nextDueDate(dueDate: string, interval: RecurrenceInterval): string {
  const [year, month, day] = dueDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  switch (interval) {
    case "daily":
      date.setUTCDate(date.getUTCDate() + 1);
      break;
    case "weekly":
      date.setUTCDate(date.getUTCDate() + 7);
      break;
    case "biweekly":
      date.setUTCDate(date.getUTCDate() + 14);
      break;
    case "monthly":
      date.setUTCMonth(date.getUTCMonth() + 1);
      break;
  }

  return date.toISOString().slice(0, 10);
}
