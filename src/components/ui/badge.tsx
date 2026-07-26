import { cn } from "@/lib/cn";

type Tone = "open" | "done";

const tones: Record<Tone, string> = {
  open: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  done: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
