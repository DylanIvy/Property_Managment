"use client";

import { useActionState, useState } from "react";
import { createTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldGroup, FieldError } from "@/components/ui/field";

type StaffOption = { staff_id: string; profiles: { name: string | null; email: string | null } | null };

export function CreateTaskForm({
  propertyId,
  staffOptions,
}: {
  propertyId: string;
  staffOptions: StaffOption[];
}) {
  const [state, action, pending] = useActionState(
    createTask.bind(null, propertyId),
    undefined,
  );
  const [recurring, setRecurring] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
      <FieldGroup>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" />
        <FieldError>{state?.errors?.title}</FieldError>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="assigned_staff_id">Assign to</Label>
          <Select id="assigned_staff_id" name="assigned_staff_id">
            <option value="">Unassigned</option>
            {staffOptions.map((s) => (
              <option key={s.staff_id} value={s.staff_id}>
                {s.profiles?.name ?? s.profiles?.email ?? s.staff_id}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="due_date">Due date</Label>
          <Input id="due_date" name="due_date" type="date" />
        </FieldGroup>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="recurring"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
          />
          Recurring
        </label>

        {recurring && (
          <FieldGroup>
            <Label htmlFor="recurrence_interval">Repeats</Label>
            <Select id="recurrence_interval" name="recurrence_interval" defaultValue="weekly" className="sm:w-40">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly</option>
            </Select>
            <FieldError>{state?.errors?.recurrence_interval}</FieldError>
          </FieldGroup>
        )}
      </div>

      <FieldError>{state?.message}</FieldError>

      <Button disabled={pending} type="submit" variant="secondary" className="self-start">
        {pending ? "Creating..." : "Create task"}
      </Button>
    </form>
  );
}
