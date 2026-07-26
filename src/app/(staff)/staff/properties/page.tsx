import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default async function StaffPropertiesPage() {
  const supabase = await createClient();
  // RLS (properties_select) returns every property this staff member is linked
  // to via property_staff, regardless of which owner added them.
  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, address")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My properties" />

      {!properties?.length && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You haven&apos;t been added to any properties yet.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {properties?.map((property) => (
          <Link key={property.id} href={`/staff/properties/${property.id}`}>
            <Card className="h-full transition-colors hover:border-blue-400 dark:hover:border-blue-600">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{property.name}</p>
              {property.address && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{property.address}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
