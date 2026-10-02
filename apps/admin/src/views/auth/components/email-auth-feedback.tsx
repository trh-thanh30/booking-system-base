"use client";

import { useTranslations } from "next-intl";

export function EmailAuthFeedback({
  errorKey,
  remaining,
}: {
  errorKey: string | null;
  remaining: number;
}) {
  const t = useTranslations("Auth");
  return (
    <>
      {errorKey ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {t(errorKey)}
        </p>
      ) : null}
      {remaining > 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t("emailFlow.retryIn", { seconds: remaining })}
        </p>
      ) : null}
    </>
  );
}
