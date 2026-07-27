import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AddStaffForm } from "./add-staff-form";

export default async function OwnerPropertyStaffPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("property_staff")
    .select("id, service_type, notes, profiles(name, email)")
    .eq("property_id", propertyId);

  return (
    <section className="flex flex-col gap-3">
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
  );
}
