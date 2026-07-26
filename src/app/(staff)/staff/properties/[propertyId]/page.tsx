import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/dal";
import { markTaskDone } from "@/lib/actions/tasks";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function StaffPropertyDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
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

  // RLS (tasks_select) further scopes this to tasks assigned to this staff
  // member on this specific property — no cross-property leakage.
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, status, due_date")
    .eq("property_id", propertyId)
    .eq("assigned_staff_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={property.name} subtitle={property.address} />

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Your tasks</h2>
        {!tasks?.length && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No tasks assigned to you here.</p>
        )}
        <div className="flex flex-col gap-2">
          {tasks?.map((t) => (
            <Card key={t.id} className="p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{t.title}</span>
                <Badge tone={t.status === "done" ? "done" : "open"}>{t.status}</Badge>
              </div>
              {t.description && (
                <p className="text-zinc-500 dark:text-zinc-400">{t.description}</p>
              )}
              {t.due_date && (
                <p className="text-zinc-500 dark:text-zinc-400">Due {t.due_date}</p>
              )}
              {t.status !== "done" && (
                <form action={markTaskDone.bind(null, t.id, propertyId)} className="mt-2">
                  <Button type="submit" variant="secondary" className="px-3 py-1 text-xs">
                    Mark done
                  </Button>
                </form>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
