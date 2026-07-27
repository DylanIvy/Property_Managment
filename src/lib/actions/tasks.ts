"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/dal";

const TaskSchema = z.object({
  title: z.string().min(1, { error: "Title is required." }).trim(),
  description: z.string().trim().optional(),
  assigned_staff_id: z.string().trim().optional(),
  due_date: z.string().trim().optional(),
  recurring: z.string().nullish(),
});

export type TaskFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export async function createTask(
  propertyId: string,
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  await requireRole("owner");

  const validated = TaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    assigned_staff_id: formData.get("assigned_staff_id"),
    due_date: formData.get("due_date"),
    recurring: formData.get("recurring"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    property_id: propertyId,
    title: validated.data.title,
    description: validated.data.description || null,
    assigned_staff_id: validated.data.assigned_staff_id || null,
    due_date: validated.data.due_date || null,
    recurring: validated.data.recurring === "on",
  });

  if (error) {
    return { message: error.message };
  }

  revalidatePath(`/owner/properties/${propertyId}/tasks`);
}

export async function markTaskDone(taskId: string, propertyId: string) {
  await requireRole("staff");

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/staff/properties/${propertyId}`);
}
