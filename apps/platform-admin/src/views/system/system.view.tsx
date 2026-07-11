import { Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@repo/ui";
import { PageHeader } from "@/src/components/common";

export function SystemView() {
  const t = useTranslations("Platform.system");

  return (
    <div className="space-y-6">
      <PageHeader
        description={t("description")}
        eyebrow="Platform"
        title={t("title")}
      />
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
          <Activity className="h-8 w-8 text-slate-500" />
          <h2 className="mt-4 text-base font-semibold">System operations</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Health checks, worker status, audit logs, and platform config will
            be wired here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
