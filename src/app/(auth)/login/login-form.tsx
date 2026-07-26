"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/field";

export function LoginForm({ justSignedUp }: { justSignedUp: boolean }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <AuthCard title="Log in">
      {justSignedUp && (
        <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          Account created. Check your email to confirm, then log in below.
        </p>
      )}

      <form action={action} className="flex flex-col gap-4">
        <FieldGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
          <FieldError>{state?.errors?.email}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" />
          <FieldError>{state?.errors?.password}</FieldError>
        </FieldGroup>

        <FieldError>{state?.message}</FieldError>

        <Button disabled={pending} type="submit" className="mt-2 w-full">
          {pending ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Need an account?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
