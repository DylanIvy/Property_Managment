import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { PropertyTabs } from "./property-tabs";

export default async function OwnerPropertyLayout({
  params,
  children,
}: {
  params: Promise<{ propertyId: string }>;
  children: React.ReactNode;
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={property.name} subtitle={property.address} />
      <PropertyTabs propertyId={propertyId} />
      {children}
    </div>
  );
}
