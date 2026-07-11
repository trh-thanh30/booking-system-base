import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@repo/ui";
import { PageHeader } from "@/src/components/common";

export function TenantsView() {
  const t = useTranslations("Platform.tenants");

  return (
    <div className="space-y-6">
      <PageHeader
        description={t("description")}
        eyebrow="Platform"
        title={t("title")}
      />
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
          <Building2 className="h-8 w-8 text-slate-500" />
          <h2 className="mt-4 text-base font-semibold">Tenant registry</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Platform tenant APIs will connect here after the super admin backend
            context is added.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
