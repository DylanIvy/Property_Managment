import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { RECURRENCE_LABELS } from "@/lib/recurrence";
import type { RecurrenceInterval } from "@/types/database.types";

export function TaskCard({
  title,
  description,
  status,
  meta,
  completedAt,
  recurrenceInterval,
  action,
}: {
  title: string;
  description?: string | null;
  status: "open" | "done";
  meta?: string | null;
  completedAt?: string | null;
  recurrenceInterval?: RecurrenceInterval | null;
  action?: React.ReactNode;
}) {
  return (
    <Card className="p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-zinc-900 dark:text-zinc-50">{title}</span>
        <Badge tone={status === "done" ? "done" : "open"}>{status}</Badge>
      </div>
      {description && <p className="text-zinc-500 dark:text-zinc-400">{description}</p>}
      {meta && <p className="text-zinc-500 dark:text-zinc-400">{meta}</p>}
      {recurrenceInterval && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {RECURRENCE_LABELS[recurrenceInterval]}
        </p>
      )}
      {status === "done" && completedAt && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Completed {formatDateTime(completedAt)}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}
