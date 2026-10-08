import { Skeleton } from "@repo/ui";
import { PlatformPage, PlatformStatsGrid } from "@/src/components/common";

export default function PlatformLoading() {
  return (
    <PlatformPage aria-busy="true" aria-label="Loading" role="status">
      <div className="space-y-3 border-b border-border pb-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <PlatformStatsGrid>
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </PlatformStatsGrid>
      <Skeleton className="h-80 w-full" />
    </PlatformPage>
  );
}
