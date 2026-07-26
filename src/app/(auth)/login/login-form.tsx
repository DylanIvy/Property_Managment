"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";

export function LoginForm({ justSignedUp }: { justSignedUp: boolean }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-xl font-semibold">Log in</h1>

      {justSignedUp && (
        <p className="text-sm text-green-700">
          Account created. Check your email to confirm, then log in below.
        </p>
      )}

      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="border rounded px-2 py-1" />
          {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="border rounded px-2 py-1" />
          {state?.errors?.password && <p className="text-sm text-red-600">{state.errors.password}</p>}
        </div>

        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

        <button
          disabled={pending}
          type="submit"
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm">
        Need an account? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </div>
  );
}
