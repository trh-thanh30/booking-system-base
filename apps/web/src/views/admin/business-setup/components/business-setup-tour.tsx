"use client";

import { useEffect, useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { useToast } from "@repo/hooks";
import type { BusinessSetupStep, BusinessSetupSummary } from "@repo/shared";
import { useRouter } from "@/src/i18n/navigation";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { createBusinessSettingsService } from "@/src/services/admin/business-settings.service";
import { createServicesService } from "@/src/services/admin/services.service";
import { completeFirstService } from "../utils/business-setup.utils";
import { createSetupServices } from "../utils/setup-services.utils";
import type { SetupAction } from "../types/business-setup.types";
import { SetupProgress } from "./setup-progress";
import { WorkingHoursForm } from "./working-hours-form";
import { FirstServiceForm } from "./first-service-form";
import { BookingTemplatePicker } from "./booking-template-picker";
import { SetupLoadState } from "./setup-load-state";

export function BusinessSetupTour({
  businessId,
  summary,
  queryKey,
  service,
}: {
  businessId: string;
  summary: BusinessSetupSummary;
  queryKey: QueryKey;
  service: ReturnType<typeof createBusinessSettingsService>;
}) {
  const t = useTranslations("BusinessSetup");
  const { toast } = useToast();
  const router = useRouter();
  const cache = useQueryClient();
  const [selectedStep, setSelectedStep] = useState<BusinessSetupStep | null>(
    null,
  );
  const step = selectedStep ?? summary.next_step ?? "WORKING_HOURS";
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const hours = useQuery({
    queryKey: [...queryKey, "hours"],
    queryFn: service.getHours,
    enabled: step === "WORKING_HOURS",
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const templates = useQuery({
    queryKey: [...queryKey, "templates"],
    queryFn: service.getTemplates,
    enabled: step === "BOOKING_TEMPLATE",
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (hours.isError || templates.isError) toast.error(t("errors.load"));
  }, [
    hours.isError,
    hours.errorUpdatedAt,
    templates.isError,
    templates.errorUpdatedAt,
    t,
    toast,
  ]);
  const mutation = useMutation({
    mutationFn: async (action: SetupAction) => {
      if (action.type === "skip") return service.skip();
      if (action.type === "services")
        return createSetupServices(
          {
            getSummary: service.getSummary,
            createService: createServicesService(businessId).createService,
          },
          action.items,
          action.onCreated,
        );
      if (action.type === "hours") await service.saveHours(action.input);
      if (action.type === "template")
        await service.selectTemplate({ template_id: action.id });
      if (action.type === "service")
        return completeFirstService(
          {
            getSummary: service.getSummary,
            createService: createServicesService(businessId).createService,
          },
          action.input,
        );
      return service.getSummary();
    },
    onSuccess: (next, action) => {
      cache.setQueryData(queryKey, next);
      void cache.invalidateQueries({ queryKey: [...queryKey, "hours"] });
      void cache.invalidateQueries({ queryKey: [...queryKey, "templates"] });
      if (useAdminUiStore.getState().activeBusinessId !== businessId) return;
      setSelectedStep(null);
      toast.success(
        t(
          action.type === "skip"
            ? "skipped"
            : next.status === "COMPLETED"
              ? "completed"
              : "saved",
        ),
      );
      if (next.status === "SKIPPED") router.replace("/admin/dashboard");
    },
    onError: () => toast.error(t("errors.save")),
  });
  async function save(action: SetupAction) {
    try {
      await mutation.mutateAsync(action);
    } catch {
      /* The mutation displays the API error through the design-system toast. */
    }
  }
  const busy = mutation.isPending;
  const footerActions = (
    <div className="flex justify-center">
      <Button
        variant="outline"
        type="button"
        disabled={busy}
        onClick={() => void save({ type: "skip" })}
        className="min-h-11 w-full text-body sm:w-auto"
      >
        {t("skip")}
      </Button>
    </div>
  );
  return (
    <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12">
      <header className="relative space-y-6">
        <div className="sr-only">
          <p className="text-label font-semibold text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="text-heading-1 font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-body text-muted-foreground">{t("description")}</p>
        </div>
        <div className="mx-auto max-w-2xl">
          <SetupProgress
            summary={summary}
            current={step}
            busy={busy}
            onSelect={setSelectedStep}
          />
        </div>
      </header>
      <section className="space-y-8 sm:space-y-10">
        <div className="space-y-3 text-center">
          <p className="text-label text-muted-foreground">
            {t("progress", {
              count: summary.completed_steps,
              total: summary.total_steps,
            })}
          </p>
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-heading-1 font-bold tracking-tight focus:outline-none"
          >
            {t(`steps.${step}`)}
          </h2>
          <p className="text-body text-muted-foreground">
            {t(`descriptions.${step}`)}
          </p>
        </div>
        {step === "WORKING_HOURS" ? (
          !hours.data ? (
            <SetupLoadState
              formOnly
              error={hours.isError}
              busy={hours.isFetching}
              onRetry={() => void hours.refetch()}
            />
          ) : (
            <WorkingHoursForm
              footerActions={footerActions}
              initialDays={hours.data.days}
              timezone={hours.data.timezone}
              busy={busy}
              onSave={(input) => save({ type: "hours", input })}
            />
          )
        ) : null}
        {step === "FIRST_SERVICE" ? (
          <FirstServiceForm
            footerActions={footerActions}
            existing={summary.steps.first_service}
            busy={busy}
            onSave={(items, onCreated) =>
              items === null
                ? save({ type: "service", input: null })
                : save({ type: "services", items, onCreated })
            }
          />
        ) : null}
        {step === "BOOKING_TEMPLATE" ? (
          !templates.data ? (
            <SetupLoadState
              formOnly
              step="BOOKING_TEMPLATE"
              error={templates.isError}
              busy={templates.isFetching}
              onRetry={() => void templates.refetch()}
            />
          ) : (
            <BookingTemplatePicker
              footerActions={footerActions}
              catalog={templates.data}
              busy={busy}
              onSave={(id) => save({ type: "template", id })}
            />
          )
        ) : null}
      </section>
    </div>
  );
}
