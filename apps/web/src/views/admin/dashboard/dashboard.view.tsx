"use client";

import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
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
import {
  AdminContentGrid,
  AdminPage,
  AdminPageHeader,
  AdminStatsGrid,
} from "@/src/components/common/admin/admin-page";
import { AdminStatsCard } from "@/src/components/common/admin/admin-stats-card";
import {
  getDashboardStats,
  getDashboardTabs,
} from "@/src/views/admin/dashboard/constants/dashboard.constants";
import { DashboardOverviewChart } from "@/src/views/admin/dashboard/components/dashboard-overview-chart";
import { RecentSales } from "@/src/views/admin/dashboard/components/recent-sales";

import { SetupResumeCard } from "@/src/views/admin/business-setup/components/setup-resume-card";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

export function DashboardView() {
  const t = useTranslations("Dashboard");
  const dashboardStats = getDashboardStats(t);
  const dashboardTabs = getDashboardTabs(t);

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>
      <AdminPage>
        <motion.div variants={itemVariants}>
          <AdminPageHeader
            actions={
              <Button variant="outline">
                <Download className="size-4" />
                {t("download")}
              </Button>
            }
            description={t("description")}
            eyebrow={t("eyebrow")}
            title={t("title")}
          />
        </motion.div>

        <SetupResumeCard />

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="overview">
            <TabsList className="max-w-full justify-start overflow-x-auto bg-surface shadow-xs">
              {dashboardTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="cursor-pointer"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent className="space-y-4 pt-2" value="overview">
              <AdminStatsGrid>
                {dashboardStats.map((item) => (
                  <motion.div key={item.title} variants={itemVariants}>
                    <AdminStatsCard {...item} />
                  </motion.div>
                ))}
              </AdminStatsGrid>

              <AdminContentGrid>
                <motion.div
                  className="min-w-0 lg:col-span-7"
                  variants={itemVariants}
                >
                  <Card className="h-full min-w-0 shadow-xs">
                    <CardHeader>
                      <CardTitle>{t("overview")}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <DashboardOverviewChart />
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  className="min-w-0 lg:col-span-5"
                  variants={itemVariants}
                >
                  <Card className="h-full min-w-0 shadow-xs">
                    <CardHeader>
                      <CardTitle>{t("recentSales")}</CardTitle>
                      <CardDescription>
                        {t("recentSalesDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentSales />
                    </CardContent>
                  </Card>
                </motion.div>
              </AdminContentGrid>
            </TabsContent>
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analyticsTitle")}</CardTitle>
                  <CardDescription>{t("analyticsDescription")}</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>{t("reportsTitle")}</CardTitle>
                  <CardDescription>{t("reportsDescription")}</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>{t("notificationsTitle")}</CardTitle>
                  <CardDescription>
                    {t("notificationsDescription")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </AdminPage>
    </motion.div>
  );
}
