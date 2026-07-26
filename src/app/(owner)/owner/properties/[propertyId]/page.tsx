import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { AddStaffForm } from "./add-staff-form";
import { CreateTaskForm } from "./create-task-form";

export default async function OwnerPropertyDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const supabase = await createClient();

  // RLS (properties_select) returns this row only if the signed-in user owns it.
  const { data: property } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("id", propertyId)
    .single();

  if (!property) notFound();

  const { data: staff } = await supabase
    .from("property_staff")
    .select("id, staff_id, service_type, notes, profiles(name, email)")
    .eq("property_id", propertyId);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, status, due_date, assigned_staff_id, profiles(name, email)")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  const staffOptions = (staff ?? []).map((s) => ({
    staff_id: s.staff_id,
    profiles: Array.isArray(s.profiles) ? s.profiles[0] ?? null : s.profiles,
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={property.name} subtitle={property.address} />

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Staff directory</h2>
        {!staff?.length && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No staff linked yet.</p>
        )}
        <div className="flex flex-col gap-2">
          {staff?.map((s) => {
            const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
            return (
              <Card key={s.id} className="p-3 text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {p?.name ?? p?.email}
                </span>
                {s.service_type && (
                  <span className="text-zinc-500 dark:text-zinc-400"> — {s.service_type}</span>
                )}
                {s.notes && <p className="text-zinc-500 dark:text-zinc-400">{s.notes}</p>}
              </Card>
            );
          })}
        </div>
        <AddStaffForm propertyId={propertyId} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Tasks</h2>
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
    </div>
  );
}
