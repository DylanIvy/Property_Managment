"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/cn";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <AuthCard title="Sign up">
      <form action={action} className="flex flex-col gap-4">
        <FieldGroup>
          <Label>I am a...</Label>
          <div className="flex gap-2">
            {(["owner", "staff"] as const).map((role, i) => (
              <label
                key={role}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium capitalize",
                  "border-zinc-300 dark:border-zinc-700 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700",
                  "dark:has-[:checked]:bg-blue-900/30 dark:has-[:checked]:text-blue-300",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                {role}
              </label>
            ))}
          </div>
          <FieldError>{state?.errors?.role}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" />
          <FieldError>{state?.errors?.name}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
          <FieldError>{state?.errors?.email}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" autoComplete="tel" />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" />
          <FieldError>{state?.errors?.password}</FieldError>
        </FieldGroup>

        <FieldError>{state?.message}</FieldError>

        <Button disabled={pending} type="submit" className="mt-2 w-full">
          {pending ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
