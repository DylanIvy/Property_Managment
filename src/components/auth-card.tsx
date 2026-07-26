import { Card } from "@/components/ui/card";

export function AuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm p-6">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {children}
      </Card>
    </div>
  );
}
