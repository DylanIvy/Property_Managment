"use client";

import { useActionState } from "react";
import { addStaffToProperty } from "@/lib/actions/properties";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/field";

export function AddStaffForm({ propertyId }: { propertyId: string }) {
  const [state, action, pending] = useActionState(
    addStaffToProperty.bind(null, propertyId),
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-3 rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700 sm:flex-row sm:flex-wrap sm:items-end">
      <FieldGroup>
        <Label htmlFor="email">Staff email</Label>
        <Input id="email" name="email" type="email" className="sm:w-56" />
        <FieldError>{state?.errors?.email}</FieldError>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="service_type">Service type</Label>
        <Input id="service_type" name="service_type" placeholder="e.g. landscaper" className="sm:w-40" />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" className="sm:w-40" />
      </FieldGroup>
      <Button disabled={pending} type="submit" variant="secondary">
        {pending ? "Adding..." : "Add staff"}
      </Button>
      {state?.message && (
        <p className="w-full text-sm text-zinc-600 dark:text-zinc-400">{state.message}</p>
      )}
    </form>
  );
}
