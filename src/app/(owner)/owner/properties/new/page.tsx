"use client";

import { useActionState } from "react";
import { createProperty } from "@/lib/actions/properties";

export default function NewPropertyPage() {
  const [state, action, pending] = useActionState(createProperty, undefined);

  return (
    <div className="flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">New property</h1>

      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Name / nickname</label>
          <input id="name" name="name" className="border rounded px-2 py-1" />
          {state?.errors?.name && <p className="text-sm text-red-600">{state.errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" className="border rounded px-2 py-1" />
        </div>

        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

        <button
          disabled={pending}
          type="submit"
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create property"}
        </button>
      </form>
    </div>
  );
}
