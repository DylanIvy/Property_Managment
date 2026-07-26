"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/dal";

const PropertySchema = z.object({
  name: z.string().min(1, { error: "Name is required." }).trim(),
  address: z.string().trim().optional(),
});

export type PropertyFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export async function createProperty(
  _prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const owner = await requireRole("owner");

  const validated = PropertySchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({
      owner_id: owner.id,
      name: validated.data.name,
      address: validated.data.address || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { message: error?.message ?? "Failed to create property." };
  }

  revalidatePath("/owner/properties");
  redirect(`/owner/properties/${data.id}`);
}

const AddStaffSchema = z.object({
  email: z.email({ error: "Enter a valid email." }).trim(),
  service_type: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type AddStaffState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export async function addStaffToProperty(
  propertyId: string,
  _prevState: AddStaffState,
  formData: FormData,
): Promise<AddStaffState> {
  await requireRole("owner");

  const validated = AddStaffSchema.safeParse({
    email: formData.get("email"),
    service_type: formData.get("service_type"),
    notes: formData.get("notes"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { data: staffProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", validated.data.email)
    .single();

  if (!staffProfile) {
    return {
      message:
        "No staff account found with that email yet. They need to sign up with the Staff role first (invite-by-email is coming in a later session).",
    };
  }

  if (staffProfile.role !== "staff") {
    return { message: "That email belongs to an owner account, not a staff account." };
  }

  const { error } = await supabase.from("property_staff").insert({
    property_id: propertyId,
    staff_id: staffProfile.id,
    service_type: validated.data.service_type || null,
    notes: validated.data.notes || null,
  });

  if (error) {
    return {
      message: error.code === "23505" ? "That staff member is already on this property." : error.message,
    };
  }

  revalidatePath(`/owner/properties/${propertyId}`);
  return { message: "Staff member added." };
}
