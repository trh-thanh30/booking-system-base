import { useTranslations } from "next-intl";
import { Button, Card, CardContent } from "@repo/ui";
import { Link } from "@/src/i18n/navigation";
import { SetupLoadingSkeleton } from "./setup-loading-skeleton";
import type { BusinessSetupStep } from "@repo/shared";

export function SetupLoadState({
  error = false,
  busy = false,
  noBusiness = false,
  onRetry,
  formOnly = false,
  step,
}: {
  error?: boolean;
  busy?: boolean;
  noBusiness?: boolean;
  onRetry?: () => void;
  formOnly?: boolean;
  step?: BusinessSetupStep;
}) {
  const t = useTranslations("BusinessSetup");
  if (!error && !noBusiness)
    return (
      <SetupLoadingSkeleton
        label={t("loading")}
        formOnly={formOnly}
        step={step}
      />
    );
  return (
    <Card className="mx-auto max-w-3xl">
      <CardContent className="space-y-5 p-6 sm:p-8">
        <p
          role="status"
          aria-busy={!error && !noBusiness}
          className="text-body"
        >
          {t(noBusiness ? "noBusiness" : error ? "errors.load" : "loading")}
        </p>
        {error && onRetry ? (
          <Button
            disabled={busy}
            onClick={onRetry}
            className="min-h-11 text-body"
          >
            {t("retry")}
          </Button>
        ) : null}
        <Button asChild variant="outline" className="min-h-11 text-body">
          <Link href={noBusiness ? "/admin/businesses" : "/admin/dashboard"}>
            {t(noBusiness ? "chooseBusiness" : "dashboard")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
