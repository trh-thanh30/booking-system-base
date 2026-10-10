import { Skeleton } from "@repo/ui";

export function OnboardingLoadingSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="space-y-5">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-5">
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted p-3">
          <Skeleton className="size-10 shrink-0 rounded-full motion-reduce:animate-none" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36 max-w-full bg-background motion-reduce:animate-none" />
            <Skeleton className="h-3 w-28 bg-background motion-reduce:animate-none" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 motion-reduce:animate-none" />
          <Skeleton className="h-13 w-full motion-reduce:animate-none" />
        </div>
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-40 max-w-full motion-reduce:animate-none" />
          <Skeleton className="h-4 w-16 motion-reduce:animate-none" />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <Skeleton className="h-1 motion-reduce:animate-none" />
          <Skeleton className="h-1 motion-reduce:animate-none" />
        </div>
        {Array.from({ length: 6 }, (_, field) => (
          <div key={field} className="space-y-2">
            <Skeleton className="h-4 w-36 motion-reduce:animate-none" />
            <Skeleton className="h-13 w-full motion-reduce:animate-none" />
          </div>
        ))}
        <Skeleton className="h-13 w-full rounded-full motion-reduce:animate-none" />
      </div>
    </div>
  );
}
