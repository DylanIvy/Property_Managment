import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/dal";
import { markTaskDone } from "@/lib/actions/tasks";

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
      <div>
        <h1 className="text-xl font-semibold">{property.name}</h1>
        {property.address && <p className="text-sm text-gray-500">{property.address}</p>}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Your tasks</h2>
        {!tasks?.length && <p className="text-sm text-gray-500">No tasks assigned to you here.</p>}
        <ul className="flex flex-col gap-2">
          {tasks?.map((t) => (
            <li key={t.id} className="rounded border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.title}</span>
                <span className={t.status === "done" ? "text-green-700" : "text-amber-700"}>
                  {t.status}
                </span>
              </div>
              {t.description && <p className="text-gray-500">{t.description}</p>}
              {t.due_date && <p className="text-gray-500">Due {t.due_date}</p>}
              {t.status !== "done" && (
                <form action={markTaskDone.bind(null, t.id, propertyId)}>
                  <button type="submit" className="mt-2 rounded bg-black px-3 py-1 text-xs text-white">
                    Mark done
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
