"use client";

import { useActionState } from "react";
import { createTask } from "@/lib/actions/tasks";

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

  return (
    <form action={action} className="flex flex-col gap-3 rounded border p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" className="border rounded px-2 py-1" />
        {state?.errors?.title && <p className="text-sm text-red-600">{state.errors.title}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" className="border rounded px-2 py-1" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="assigned_staff_id">Assign to</label>
        <select id="assigned_staff_id" name="assigned_staff_id" className="border rounded px-2 py-1">
          <option value="">Unassigned</option>
          {staffOptions.map((s) => (
            <option key={s.staff_id} value={s.staff_id}>
              {s.profiles?.name ?? s.profiles?.email ?? s.staff_id}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="due_date">Due date</label>
          <input id="due_date" name="due_date" type="date" className="border rounded px-2 py-1" />
        </div>
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" name="recurring" />
          Recurring
        </label>
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        disabled={pending}
        type="submit"
        className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create task"}
      </button>
    </form>
  );
}
