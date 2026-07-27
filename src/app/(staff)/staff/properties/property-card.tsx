"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { setPropertyNickname } from "@/lib/actions/properties";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";

export function PropertyCard({
  propertyId,
  name,
  nickname,
  address,
}: {
  propertyId: string;
  name: string;
  nickname: string | null;
  address: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    setPropertyNickname.bind(null, propertyId),
    undefined,
  );

  // Exit edit mode once the save completes — adjusting state during render
  // (not in an effect) in response to the action's result changing.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.message === "Nickname saved." && editing) {
      setEditing(false);
    }
  }

  const displayName = nickname || name;

  return (
    <Card className="relative h-full transition-colors hover:border-blue-400 dark:hover:border-blue-600">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="absolute right-1 top-1 rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        aria-label="Property options"
      >
        ⋮
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-1 top-8 z-20 w-32 rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              className="block w-full px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Rename
            </button>
          </div>
        </>
      )}

      {editing ? (
        <form action={action} className="flex flex-col gap-2 pr-6">
          <Input
            name="nickname"
            defaultValue={nickname ?? ""}
            placeholder={name}
            autoFocus
            className="text-sm"
          />
          <div className="flex gap-3 text-xs">
            <button
              type="submit"
              disabled={pending}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-zinc-500 hover:underline dark:text-zinc-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <Link href={`/staff/properties/${propertyId}`} className="block pr-6">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{displayName}</p>
          {nickname && <p className="text-xs text-zinc-400 dark:text-zinc-500">{name}</p>}
          {address && <p className="text-sm text-zinc-500 dark:text-zinc-400">{address}</p>}
        </Link>
      )}
    </Card>
  );
}
