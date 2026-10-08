import { Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState, PageHeader, PlatformPage } from "@/src/components/common";

export function SystemView() {
  const t = useTranslations("Platform.system");

  return (
    <PlatformPage>
      <PageHeader
        description={t("description")}
        eyebrow="Platform"
        title={t("title")}
      />
      <EmptyState
        description="Health checks, worker status, audit logs, and platform config will be wired here."
        icon={Activity}
        title="System operations"
      />
    </PlatformPage>
  );
}
