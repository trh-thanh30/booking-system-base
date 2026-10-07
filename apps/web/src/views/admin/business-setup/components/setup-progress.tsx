import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, cn } from "@repo/ui";
import type { BusinessSetupStep, BusinessSetupSummary } from "@repo/shared";
import { SETUP_STEPS } from "../constants/business-setup.constants";

export function SetupProgress({
  summary,
  current,
  busy,
  onSelect,
}: {
  summary: BusinessSetupSummary;
  current: BusinessSetupStep;
  busy: boolean;
  onSelect: (step: BusinessSetupStep) => void;
}) {
  const t = useTranslations("BusinessSetup");
  const complete = [
    summary.steps.working_hours,
    summary.steps.first_service,
    summary.steps.booking_template,
  ];
  const nextIndex = SETUP_STEPS.indexOf(
    summary.next_step ?? "BOOKING_TEMPLATE",
  );
  return (
    <nav aria-label={t("progressLabel")}>
      <ol className="grid grid-cols-3 gap-2 sm:gap-6">
        {SETUP_STEPS.map((step, index) => (
          <li
            key={step}
            aria-current={step === current ? "step" : undefined}
            className="relative after:absolute after:left-[calc(50%+1.5rem)] after:top-7 after:h-px after:w-[calc(100%-1rem)] after:bg-border last:after:hidden"
          >
            <Button
              type="button"
              variant="ghost"
              disabled={busy || index > nextIndex}
              onClick={() => onSelect(step)}
              className="relative z-10 h-auto min-h-11 w-full flex-col gap-3 whitespace-normal p-2 hover:bg-transparent disabled:bg-transparent"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border border-border text-body",
                  current === step || complete[index]
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {complete[index] ? (
                  <Check className="size-5" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-label font-semibold sm:text-body">
                {t(`steps.${step}`)}
              </span>
              {complete[index] ? (
                <span className="sr-only">{t("stepCompleted")}</span>
              ) : null}
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
