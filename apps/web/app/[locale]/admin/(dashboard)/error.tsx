"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { StatePanel } from "@/src/components/common/state-panel";
import { AdminPage } from "@/src/components/common/admin/admin-page";

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations("RouteStates");

  return (
    <AdminPage>
      <StatePanel
        action={
          <Button onClick={reset}>
            <RotateCcw className="size-4" />
            {t("tryAgain")}
          </Button>
        }
        description={t("errorDescription")}
        icon={AlertTriangle}
        title={t("errorTitle")}
      />
    </AdminPage>
  );
}
