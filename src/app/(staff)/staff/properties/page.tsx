import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function StaffPropertiesPage() {
  const supabase = await createClient();
  // RLS (properties_select) returns every property this staff member is linked
  // to via property_staff, regardless of which owner added them.
  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, address")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">My properties</h1>

      {!properties?.length && (
        <p className="text-sm text-gray-500">
          You haven&apos;t been added to any properties yet.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {properties?.map((property) => (
          <li key={property.id} className="rounded border p-4">
            <Link href={`/staff/properties/${property.id}`} className="font-medium underline">
              {property.name}
            </Link>
            {property.address && <p className="text-sm text-gray-500">{property.address}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
