"use client";

import { useActionState } from "react";
import { addStaffToProperty } from "@/lib/actions/properties";

export function AddStaffForm({ propertyId }: { propertyId: string }) {
  const [state, action, pending] = useActionState(
    addStaffToProperty.bind(null, propertyId),
    undefined,
  );

  return (
    <form action={action} className="flex flex-wrap items-end gap-3 rounded border p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Staff email</label>
        <input id="email" name="email" type="email" className="border rounded px-2 py-1" />
        {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="service_type">Service type</label>
        <input
          id="service_type"
          name="service_type"
          placeholder="e.g. landscaper"
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="notes">Notes</label>
        <input id="notes" name="notes" className="border rounded px-2 py-1" />
      </div>
      <button
        disabled={pending}
        type="submit"
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add staff"}
      </button>
      {state?.message && <p className="w-full text-sm text-gray-700">{state.message}</p>}
    </form>
  );
}
