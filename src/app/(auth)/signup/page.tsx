"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-xl font-semibold">Sign up</h1>

      <form action={action} className="flex flex-col gap-4">
        <fieldset className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="owner" defaultChecked />
            Owner
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="staff" />
            Staff
          </label>
        </fieldset>
        {state?.errors?.role && <p className="text-sm text-red-600">{state.errors.role}</p>}

        <div className="flex flex-col gap-1">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" className="border rounded px-2 py-1" />
          {state?.errors?.name && <p className="text-sm text-red-600">{state.errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="border rounded px-2 py-1" />
          {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone">Phone (optional)</label>
          <input id="phone" name="phone" className="border rounded px-2 py-1" />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="border rounded px-2 py-1" />
          {state?.errors?.password && (
            <ul className="text-sm text-red-600">
              {state.errors.password.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
        </div>

        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

        <button
          disabled={pending}
          type="submit"
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </div>
  );
}
