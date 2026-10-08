"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { PlatformPage, StatePanel } from "@/src/components/common";

export default function PlatformError({ reset }: { reset: () => void }) {
  const t = useTranslations("Common");

  return (
    <PlatformPage>
      <StatePanel
        action={
          <Button onClick={reset} variant="outline">
            <RotateCcw className="size-4" />
            {t("retry")}
          </Button>
        }
        description={t("pageErrorDescription")}
        icon={TriangleAlert}
        title={t("pageErrorTitle")}
        tone="danger"
      />
    </PlatformPage>
  );
}
