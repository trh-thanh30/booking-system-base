import { Download } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { StatsCard } from "@/src/components/common/stats-card";
import {
  dashboardStats,
  dashboardTabs,
} from "@/src/views/dashboard/dashboard.constants";
import { DashboardOverviewChart } from "@/src/views/dashboard/components/dashboard-overview-chart";
import { RecentSales } from "@/src/views/dashboard/components/recent-sales";

export function DashboardView() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-slate-50">
          Dashboard
        </h1>
        <Button variant="secondary">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          {dashboardTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent className="space-y-4" value="overview">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((item) => (
              <StatsCard key={item.title} {...item} />
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <DashboardOverviewChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </section>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Analytics widgets can be mounted here when product metrics are
                connected.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Use this tab for exportable operational reports.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Use this tab for recent system and workflow notifications.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
