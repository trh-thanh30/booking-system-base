import { Card, CardContent, Skeleton } from "@repo/ui";

export function SetupResumeSkeleton({ label }: { label: string }) {
  return (
    <Card role="status" aria-busy="true">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="sr-only">{label}</span>
        <div aria-hidden="true" className="min-w-0 space-y-2">
          <Skeleton className="h-5 w-64 max-w-full motion-reduce:animate-none" />
          <Skeleton className="h-5 w-48 max-w-full motion-reduce:animate-none" />
        </div>
        <Skeleton
          aria-hidden="true"
          className="h-11 w-full shrink-0 motion-reduce:animate-none sm:w-44"
        />
      </CardContent>
    </Card>
  );
}
