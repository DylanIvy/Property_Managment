import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/dal";
import { markTaskDone } from "@/lib/actions/tasks";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/task-card";
import { ViewToggle } from "@/components/view-toggle";
import { MonthCalendar, type CalendarEvent } from "@/components/month-calendar";
import { parseMonthParam } from "@/lib/calendar";

export default async function StaffPropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ view?: string; month?: string; completed?: string; completedNext?: string }>;
}) {
  const { propertyId } = await params;
  const { view, month, completed, completedNext } = await searchParams;
  const profile = await requireRole("staff");
  const supabase = await createClient();

  // RLS (properties_select) returns this row only if the signed-in staff
  // member is linked to it via property_staff.
  const { data: property } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("id", propertyId)
    .single();

  if (!property) notFound();

  const { data: link } = await supabase
    .from("property_staff")
    .select("staff_nickname")
    .eq("property_id", propertyId)
    .eq("staff_id", profile.id)
    .maybeSingle();

  const displayName = link?.staff_nickname || property.name;

  // RLS (tasks_select) further scopes this to tasks assigned to this staff
  // member on this specific property — no cross-property leakage.
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, status, due_date, completed_at, recurring, recurrence_interval")
    .eq("property_id", propertyId)
    .eq("assigned_staff_id", profile.id)
    .order("created_at", { ascending: false });

  const basePath = `/staff/properties/${propertyId}`;

  if (view === "calendar") {
    const { year, month: monthIndex } = parseMonthParam(month);
    const events: Record<string, CalendarEvent[]> = {};
    for (const t of tasks ?? []) {
      if (!t.due_date) continue;
      (events[t.due_date] ??= []).push({
        id: t.id,
        label: t.title,
        href: basePath,
        done: t.status === "done",
      });
    }

    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={displayName} subtitle={property.address} />
        <ViewToggle view="calendar" basePath={basePath} />
        <MonthCalendar
          year={year}
          month={monthIndex}
          events={events}
          basePath={basePath}
          extraParams={{ view: "calendar" }}
        />
      </div>
    );
  }

  const openTasks = (tasks ?? []).filter((t) => t.status !== "done");
  const activeTasks = openTasks.filter((t) => !t.recurring);
  const recurringTasks = openTasks.filter((t) => t.recurring);
  const completedTasks = (tasks ?? []).filter((t) => t.status === "done");

  const markDoneButton = (taskId: string) => (
    <form action={markTaskDone.bind(null, taskId, propertyId)}>
      <Button type="submit" variant="secondary" className="px-3 py-1 text-xs">
        Mark done
      </Button>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={displayName} subtitle={property.address} />
      <ViewToggle view="list" basePath={basePath} />

      {completedNext && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          Task completed. Since it repeats, the next occurrence (due {completedNext}) was added under Recurring.
        </p>
      )}
      {completed && !completedNext && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          Task completed.
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Active ({activeTasks.length})
        </h2>
        {!activeTasks.length && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No one-off tasks assigned to you here.</p>
        )}
        <div className="flex flex-col gap-2">
          {activeTasks.map((t) => (
            <TaskCard
              key={t.id}
              title={t.title}
              description={t.description}
              status={t.status}
              meta={t.due_date ? `Due ${t.due_date}` : null}
              action={markDoneButton(t.id)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Recurring ({recurringTasks.length})
        </h2>
        {!recurringTasks.length && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No recurring tasks assigned to you here.</p>
        )}
        <div className="flex flex-col gap-2">
          {recurringTasks.map((t) => (
            <TaskCard
              key={t.id}
              title={t.title}
              description={t.description}
              status={t.status}
              meta={t.due_date ? `Next due ${t.due_date}` : null}
              recurrenceInterval={t.recurrence_interval}
              action={markDoneButton(t.id)}
            />
          ))}
        </div>
      </section>

      {completedTasks.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Completed ({completedTasks.length})
          </h2>
          <div className="flex flex-col gap-2">
            {completedTasks.map((t) => (
              <TaskCard
                key={t.id}
                title={t.title}
                description={t.description}
                status={t.status}
                meta={t.due_date ? `Due ${t.due_date}` : null}
                completedAt={t.completed_at}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
