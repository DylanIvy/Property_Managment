import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
      <div>
        <h1 className="text-xl font-semibold">{property.name}</h1>
        {property.address && <p className="text-sm text-gray-500">{property.address}</p>}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Staff directory</h2>
        {!staff?.length && <p className="text-sm text-gray-500">No staff linked yet.</p>}
        <ul className="flex flex-col gap-2">
          {staff?.map((s) => {
            const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
            return (
              <li key={s.id} className="rounded border p-3 text-sm">
                <span className="font-medium">{p?.name ?? p?.email}</span>
                {s.service_type && <span className="text-gray-500"> — {s.service_type}</span>}
                {s.notes && <p className="text-gray-500">{s.notes}</p>}
              </li>
            );
          })}
        </ul>
        <AddStaffForm propertyId={propertyId} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Tasks</h2>
        {!tasks?.length && <p className="text-sm text-gray-500">No tasks yet.</p>}
        <ul className="flex flex-col gap-2">
          {tasks?.map((t) => {
            const p = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
            return (
              <li key={t.id} className="rounded border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.title}</span>
                  <span className={t.status === "done" ? "text-green-700" : "text-amber-700"}>
                    {t.status}
                  </span>
                </div>
                {t.description && <p className="text-gray-500">{t.description}</p>}
                <p className="text-gray-500">
                  Assigned to: {p?.name ?? p?.email ?? "Unassigned"}
                  {t.due_date && ` · Due ${t.due_date}`}
                </p>
              </li>
            );
          })}
        </ul>
        <CreateTaskForm propertyId={propertyId} staffOptions={staffOptions} />
      </section>
    </div>
  );
}
