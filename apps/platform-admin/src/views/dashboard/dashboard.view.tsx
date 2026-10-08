"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Building2, ShieldCheck, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import {
  PageHeader,
  PlatformPage,
  PlatformStatsGrid,
  StatCard,
} from "@/src/components/common";
import { tenantsService } from "@/src/services/tenants.service";

export function DashboardView() {
  const t = useTranslations("Platform.dashboard");
  const tenantsQuery = useQuery({
    queryFn: tenantsService.listTenants,
    queryKey: ["platform-tenants"],
  });
  const tenants = tenantsQuery.data ?? [];
  const totalUsers = tenants.reduce(
    (total, tenant) => total + tenant.users_count,
    0,
  );
  const activeTenants = tenants.filter(
    (tenant) => tenant.status === "ACTIVE",
  ).length;

  return (
    <PlatformPage>
      <PageHeader
        description={t("description")}
        eyebrow="Platform"
        title={t("title")}
      />
      <PlatformStatsGrid>
        <StatCard
          description={t("tenantDescription")}
          icon={Building2}
          title={t("tenantCard")}
          value={tenantsQuery.isLoading ? "..." : String(tenants.length)}
        />
        <StatCard
          description={t("userDescription")}
          icon={Users}
          title={t("userCard")}
          value={tenantsQuery.isLoading ? "..." : String(totalUsers)}
        />
        <StatCard
          description={t("systemDescription")}
          icon={Activity}
          title={t("systemCard")}
          value={tenantsQuery.isLoading ? "..." : `${activeTenants} active`}
        />
      </PlatformStatsGrid>
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Platform boundary
          </CardTitle>
          <CardDescription>
            This portal is reserved for super admin operations and should not
            render tenant-scoped workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Tenant/business workflows stay in <code>apps/web /admin</code>. Global
          tenant lifecycle, platform users, audits, billing oversight, and
          system health belong here.
        </CardContent>
      </Card>
    </PlatformPage>
  );
}
