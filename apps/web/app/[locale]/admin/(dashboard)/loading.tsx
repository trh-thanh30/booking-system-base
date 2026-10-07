import { Card, CardContent, CardHeader, Skeleton } from "@repo/ui";
import {
  AdminPage,
  AdminStatsGrid,
} from "@/src/components/common/admin/admin-page";

export default function DashboardLoading() {
  return (
    <AdminPage aria-busy="true" role="status">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <AdminStatsGrid>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </AdminStatsGrid>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-11 w-full" key={index} />
          ))}
        </CardContent>
      </Card>
    </AdminPage>
  );
}
