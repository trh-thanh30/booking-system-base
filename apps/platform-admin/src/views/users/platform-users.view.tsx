import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState, PageHeader, PlatformPage } from "@/src/components/common";

export function PlatformUsersView() {
  const t = useTranslations("Platform.users");

  return (
    <PlatformPage>
      <PageHeader
        description={t("description")}
        eyebrow="Platform"
        title={t("title")}
      />
      <EmptyState
        description="Super admin and operator user management will live outside tenant staff management."
        icon={Users}
        title="Platform access"
      />
    </PlatformPage>
  );
}
