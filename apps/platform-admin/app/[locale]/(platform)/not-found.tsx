import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui";
import { Link } from "@/src/i18n/navigation";
import { PlatformPage, StatePanel } from "@/src/components/common";

export default async function PlatformNotFound() {
  const t = await getTranslations("Common");

  return (
    <PlatformPage>
      <StatePanel
        action={
          <Button asChild>
            <Link href="/dashboard">{t("backToDashboard")}</Link>
          </Button>
        }
        description={t("notFoundDescription")}
        icon={FileQuestion}
        title={t("notFoundTitle")}
      />
    </PlatformPage>
  );
}
