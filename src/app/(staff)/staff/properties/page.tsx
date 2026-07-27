import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/dal";
import { PageHeader } from "@/components/ui/page-header";
import { PropertyCard } from "./property-card";

export default async function StaffPropertiesPage() {
  const profile = await requireRole("staff");
  const supabase = await createClient();

  // RLS (property_staff_select) returns every link this staff member has,
  // regardless of which owner added them.
  const { data: links } = await supabase
    .from("property_staff")
    .select("staff_nickname, properties(id, name, address)")
    .eq("staff_id", profile.id)
    .order("created_at", { ascending: false });

  const properties = (links ?? [])
    .map((l) => {
      const property = Array.isArray(l.properties) ? l.properties[0] : l.properties;
      return property ? { ...property, nickname: l.staff_nickname } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My properties" />

      {!properties.length && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You haven&apos;t been added to any properties yet.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            propertyId={property.id}
            name={property.name}
            nickname={property.nickname}
            address={property.address}
          />
        ))}
      </div>
    </div>
  );
}
