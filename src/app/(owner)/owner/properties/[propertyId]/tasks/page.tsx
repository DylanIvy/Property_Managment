import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskForm } from "../create-task-form";

export default async function OwnerPropertyTasksPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, status, due_date, assigned_staff_id, profiles(name, email)")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  const { data: staff } = await supabase
    .from("property_staff")
    .select("staff_id, profiles(name, email)")
    .eq("property_id", propertyId);

  const staffOptions = (staff ?? []).map((s) => ({
    staff_id: s.staff_id,
    profiles: Array.isArray(s.profiles) ? s.profiles[0] ?? null : s.profiles,
  }));

  return (
    <section className="flex flex-col gap-3">
      {!tasks?.length && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No tasks yet.</p>
      )}
      <div className="flex flex-col gap-2">
        {tasks?.map((t) => {
          const p = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
          return (
            <Card key={t.id} className="p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{t.title}</span>
                <Badge tone={t.status === "done" ? "done" : "open"}>{t.status}</Badge>
              </div>
              {t.description && (
                <p className="text-zinc-500 dark:text-zinc-400">{t.description}</p>
              )}
              <p className="text-zinc-500 dark:text-zinc-400">
                Assigned to: {p?.name ?? p?.email ?? "Unassigned"}
                {t.due_date && ` · Due ${t.due_date}`}
              </p>
            </Card>
          );
        })}
      </div>
      <CreateTaskForm propertyId={propertyId} staffOptions={staffOptions} />
    </section>
  );
}
