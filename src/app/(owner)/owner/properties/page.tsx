import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function OwnerPropertiesPage() {
  const supabase = await createClient();
  // RLS (properties_select) already scopes this to the signed-in owner's rows.
  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, address")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Properties</h1>
        <Link href="/owner/properties/new" className="rounded bg-black px-4 py-2 text-sm text-white">
          + New property
        </Link>
      </div>

      {!properties?.length && <p className="text-sm text-gray-500">No properties yet.</p>}

      <ul className="flex flex-col gap-2">
        {properties?.map((property) => (
          <li key={property.id} className="rounded border p-4">
            <Link href={`/owner/properties/${property.id}`} className="font-medium underline">
              {property.name}
            </Link>
            {property.address && <p className="text-sm text-gray-500">{property.address}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
