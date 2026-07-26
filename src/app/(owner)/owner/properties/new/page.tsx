"use client";

import { useActionState } from "react";
import { createProperty } from "@/lib/actions/properties";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/field";

export default function NewPropertyPage() {
  const [state, action, pending] = useActionState(createProperty, undefined);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">New property</h1>

      <Card className="max-w-md">
        <form action={action} className="flex flex-col gap-4">
          <FieldGroup>
            <Label htmlFor="name">Name / nickname</Label>
            <Input id="name" name="name" />
            <FieldError>{state?.errors?.name}</FieldError>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" />
          </FieldGroup>

          <FieldError>{state?.message}</FieldError>

          <Button disabled={pending} type="submit" className="w-full">
            {pending ? "Creating..." : "Create property"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
