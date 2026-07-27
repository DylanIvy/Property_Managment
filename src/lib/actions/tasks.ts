"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/dal";
import { nextDueDate } from "@/lib/recurrence";

const TaskSchema = z
  .object({
    title: z.string().min(1, { error: "Title is required." }).trim(),
    description: z.string().trim().optional(),
    assigned_staff_id: z.string().trim().optional(),
    due_date: z.string().trim().optional(),
    recurring: z.string().nullish(),
    recurrence_interval: z.enum(["daily", "weekly", "biweekly", "monthly"]).nullish(),
  })
  .refine((data) => data.recurring !== "on" || !!data.recurrence_interval, {
    error: "Choose how often this task repeats.",
    path: ["recurrence_interval"],
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
    recurrence_interval: formData.get("recurrence_interval"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors as Record<string, string[]> };
  }

  const isRecurring = validated.data.recurring === "on";
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    property_id: propertyId,
    title: validated.data.title,
    description: validated.data.description || null,
    assigned_staff_id: validated.data.assigned_staff_id || null,
    due_date: validated.data.due_date || null,
    recurring: isRecurring,
    recurrence_interval: isRecurring ? validated.data.recurrence_interval : null,
  });

  if (error) {
    return { message: error.message };
  }

  revalidatePath(`/owner/properties/${propertyId}/tasks`);
}

export async function markTaskDone(taskId: string, propertyId: string) {
  await requireRole("staff");

  const supabase = await createClient();
  const { data: task, error } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId)
    .select("property_id, title, description, assigned_staff_id, recurring, recurrence_interval, due_date")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/staff/properties/${propertyId}`);

  // Recurring tasks spawn their next occurrence as soon as the current one is
  // completed. Requires a due date to know when the next one falls. The
  // completing user is staff, who aren't allowed to insert tasks under RLS
  // (tasks_insert_owner_only) — use the admin client for this one system
  // write, since every field it inserts is copied from a row we just
  // confirmed (via the RLS-scoped update above) the caller was authorized
  // to complete.
  if (task?.recurring && task.recurrence_interval && task.due_date) {
    const admin = createAdminClient();
    const nextDate = nextDueDate(task.due_date, task.recurrence_interval);
    const { error: spawnError } = await admin.from("tasks").insert({
      property_id: task.property_id,
      title: task.title,
      description: task.description,
      assigned_staff_id: task.assigned_staff_id,
      recurring: true,
      recurrence_interval: task.recurrence_interval,
      due_date: nextDate,
    });

    if (spawnError) {
      throw new Error(spawnError.message);
    }

    // A same-titled task now also sits in Active — without this, completing
    // a recurring task can read as "nothing happened" since an item with the
    // same name is still there. Spell out that it's the next occurrence.
    redirect(`/staff/properties/${propertyId}?completedNext=${nextDate}`);
  }

  redirect(`/staff/properties/${propertyId}?completed=1`);
}
