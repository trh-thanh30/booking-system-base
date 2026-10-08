import { RefreshCcw, Server, Wifi } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@repo/ui";
import {
  AdminContentGrid,
  AdminPage,
  AdminPageHeader,
  AdminStatsGrid,
} from "@/src/components/common/admin/admin-page";
import { AdminStatsCard } from "@/src/components/common/admin/admin-stats-card";
import {
  connectivityNotes,
  services,
  systemStats,
} from "@/src/views/admin/system/constants/system.constants";

export function SystemView() {
  return (
    <AdminPage>
      <AdminPageHeader
        actions={
          <Button variant="secondary">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        }
        description="Operational health view for API, database, Redis, and worker services."
        eyebrow="Infrastructure"
        title="System health"
      />

      <AdminStatsGrid className="xl:grid-cols-3">
        {systemStats.map((item) => (
          <AdminStatsCard key={item.title} {...item} />
        ))}
      </AdminStatsGrid>

      <AdminContentGrid>
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Service checks</CardTitle>
            <CardDescription>
              Mock checks designed to map cleanly to live health endpoints
              later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service, index) => (
              <div key={service.name}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Server className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {service.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {service.target}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {service.latency}
                    </span>
                    <Badge
                      variant={
                        service.status === "Healthy" ? "success" : "warning"
                      }
                    >
                      {service.status}
                    </Badge>
                  </div>
                </div>
                {index < services.length - 1 ? (
                  <Separator className="mt-4" />
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Connectivity notes</CardTitle>
            <CardDescription>
              Use this card as the future deploy checklist surface.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectivityNotes.map((item) => (
              <div
                className="flex gap-3 rounded-lg border border-border bg-surface p-3"
                key={item}
              >
                <Wifi className="mt-0.5 size-4 text-success" />
                <p className="text-sm leading-6 text-muted-foreground">
                  {item}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </AdminContentGrid>
    </AdminPage>
  );
}
