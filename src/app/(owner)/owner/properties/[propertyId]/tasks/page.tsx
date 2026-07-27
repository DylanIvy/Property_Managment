import { createClient } from "@/lib/supabase/server";
import { TaskCard } from "@/components/task-card";
import { CreateTaskForm } from "../create-task-form";
import { ViewToggle } from "@/components/view-toggle";
import { MonthCalendar, type CalendarEvent } from "@/components/month-calendar";
import { parseMonthParam } from "@/lib/calendar";

export default async function OwnerPropertyTasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ view?: string; month?: string }>;
}) {
  const { propertyId } = await params;
  const { view, month } = await searchParams;
  const basePath = `/owner/properties/${propertyId}/tasks`;

  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "id, title, description, status, due_date, completed_at, recurring, recurrence_interval, assigned_staff_id, profiles(name, email)",
    )
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

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
      <section className="flex flex-col gap-6">
        <ViewToggle view="calendar" basePath={basePath} />
        <MonthCalendar
          year={year}
          month={monthIndex}
          events={events}
          basePath={basePath}
          extraParams={{ view: "calendar" }}
        />
      </section>
    );
  }

  const { data: staff } = await supabase
    .from("property_staff")
    .select("staff_id, profiles(name, email)")
    .eq("property_id", propertyId);

  const staffOptions = (staff ?? []).map((s) => ({
    staff_id: s.staff_id,
    profiles: Array.isArray(s.profiles) ? s.profiles[0] ?? null : s.profiles,
  }));

  const activeTasks = (tasks ?? []).filter((t) => t.status !== "done");
  const completedTasks = (tasks ?? []).filter((t) => t.status === "done");

  const assigneeLabel = (t: (typeof activeTasks)[number]) => {
    const p = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
    return `Assigned to: ${p?.name ?? p?.email ?? "Unassigned"}`;
  };

  return (
    <section className="flex flex-col gap-6">
      <ViewToggle view="list" basePath={basePath} />

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Active ({activeTasks.length})
        </h2>
        {!activeTasks.length && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No active tasks.</p>
        )}
        <div className="flex flex-col gap-2">
          {activeTasks.map((t) => (
            <TaskCard
              key={t.id}
              title={t.title}
              description={t.description}
              status={t.status}
              meta={`${assigneeLabel(t)}${t.due_date ? ` · Due ${t.due_date}` : ""}`}
              recurrenceInterval={t.recurrence_interval}
            />
          ))}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-2">
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
                meta={assigneeLabel(t)}
                completedAt={t.completed_at}
              />
            ))}
          </div>
        </div>
      )}

      <CreateTaskForm propertyId={propertyId} staffOptions={staffOptions} />
    </section>
  );
}
