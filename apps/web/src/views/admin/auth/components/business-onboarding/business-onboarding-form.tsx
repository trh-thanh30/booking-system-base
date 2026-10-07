"use client";

import { EmailInput, FormField } from "@/src/components/common";
import {
  completeOwnerBusinessSchema,
  type CompleteOwnerBusinessInput,
  type OwnerOnboardingProfile,
} from "@repo/shared";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ConfirmDialog,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type PhoneCountry,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { useBusinessNameAvailability } from "../../hooks/use-business-name-availability";
import { useBusinessOnboardingDraft } from "../../hooks/use-business-onboarding-draft";
import type { BusinessOnboardingStep } from "../../types/business-onboarding.types";
import {
  createBusinessSlug,
  getBrowserPhoneCountry,
  getBrowserTimezone,
  getCountryFromTimezone,
} from "../../utils/business-onboarding.utils";
import { BusinessAddressStep } from "./business-address-step";
import { BusinessInformationStep } from "./business-information-step";

// Opening hours is temporarily configured after onboarding instead of as a step.
const STEP_TITLES = ["businessInfo", "businessAddress"] as const;

export function BusinessOnboardingForm({
  profile,
  locale,
  isPending,
  onSubmit,
  onDraftStateChange,
}: {
  profile: OwnerOnboardingProfile;
  locale: string;
  isPending: boolean;
  onSubmit: (input: CompleteOwnerBusinessInput) => Promise<void>;
  onDraftStateChange?: (hasDraft: boolean, clearDraft: () => void) => void;
}) {
  const t = useTranslations("AuthJourney");
  const [step, setStep] = useState<BusinessOnboardingStep>(0);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef<BusinessOnboardingStep | null>(null);
  const checkedRestoredBusinessName = useRef(false);
  const form = useForm<CompleteOwnerBusinessInput>({
    defaultValues: {
      business_category_id: "",
      name: "",
      slug: "",
      owner: { username: "", phone: "" },
      timezone: "Asia/Ho_Chi_Minh",
      locale: locale === "en" ? "en" : "vi",
      business_profile: {
        address: {
          countryCode: "VN",
          addressLine1: "",
          addressLine2: "",
          locality: "",
          administrativeAreaLevel1: "",
          administrativeAreaLevel2: "",
          postalCode: "",
          formattedAddress: "",
          location: null,
        },
      },
    },
  });
  const draft = useBusinessOnboardingDraft({
    form,
    profileEmail: profile.email,
    step,
    setStep,
    isPending,
    onDraftStateChange,
  });
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>("VN");
  const {
    check: checkBusinessName,
    slug: businessSlug,
    status: businessNameStatus,
  } = useBusinessNameAvailability(form.watch("name"));
  const busy = isPending || form.formState.isSubmitting;

  useEffect(() => {
    if (
      !draft.hydrated ||
      !draft.hasRestoredDraft ||
      step !== 0 ||
      checkedRestoredBusinessName.current
    ) {
      return;
    }
    const restoredSlug = createBusinessSlug(form.getValues("name"));
    if (!restoredSlug) {
      checkedRestoredBusinessName.current = true;
      return;
    }
    if (businessSlug !== restoredSlug) return;
    checkedRestoredBusinessName.current = true;
    void checkBusinessName();
  }, [
    businessSlug,
    checkBusinessName,
    draft.hasRestoredDraft,
    draft.hydrated,
    form,
    step,
  ]);

  useEffect(() => {
    if (previousStep.current !== null && previousStep.current !== step) {
      heading.current?.focus();
    }
    previousStep.current = step;
  }, [step]);

  useEffect(() => {
    if (!draft.hydrated || draft.hasRestoredDraft) return;
    const browserTimezone = getBrowserTimezone();
    const browserCountry =
      getCountryFromTimezone(browserTimezone) ?? getBrowserPhoneCountry();
    setPhoneCountry(browserCountry);
    if (form.getValues("business_profile.address.countryCode") === "VN") {
      form.setValue("business_profile.address.countryCode", browserCountry, {
        shouldDirty: false,
      });
    }
    if (form.getValues("timezone") === "Asia/Ho_Chi_Minh") {
      form.setValue("timezone", browserTimezone, { shouldDirty: false });
    }
  }, [draft.hasRestoredDraft, draft.hydrated, form]);

  async function submit(input: CompleteOwnerBusinessInput) {
    if (isPending) return;
    if (step === 0 && businessNameStatus !== "available") return;
    form.clearErrors();
    const normalizedInput = {
      ...input,
      slug: createBusinessSlug(input.name),
    };
    const parsed =
      step === 0
        ? completeOwnerBusinessSchema
            .pick({
              name: true,
              business_category_id: true,
              slug: true,
              owner: true,
              timezone: true,
              locale: true,
            })
            .safeParse(normalizedInput)
        : completeOwnerBusinessSchema.safeParse(normalizedInput);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] === "slug" ? ["name"] : issue.path;
        form.setError(
          path.join(".") as FieldPath<CompleteOwnerBusinessInput>,
          { message: t("invalidField") },
          { shouldFocus: true },
        );
      }
      return;
    }
    if (step === 0) {
      const nextStep: BusinessOnboardingStep = 1;
      draft.persistDraft(nextStep);
      setStep(nextStep);
      return;
    }
    const result = completeOwnerBusinessSchema.safeParse(normalizedInput);
    if (result.success) await onSubmit(result.data);
  }

  function goBack() {
    const previous = (step - 1) as BusinessOnboardingStep;
    form.clearErrors();
    draft.persistDraft(previous);
    setStep(previous);
  }

  return (
    <FormProvider {...form}>
      <form
        className="space-y-1.5"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="flex items-center gap-3 rounded-md border bg-muted p-3 mb-5">
          <Avatar className="size-10">
            <AvatarImage
              src={
                profile.avatar_url?.startsWith("https://")
                  ? profile.avatar_url
                  : undefined
              }
              alt={profile.full_name ?? t("verifiedAccount")}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback>
              {profile.full_name?.[0] ?? profile.email?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {profile.full_name ?? profile.email ?? t("verifiedAccount")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("verifiedAccount")}
            </p>
          </div>
        </div>
        <FormField htmlFor="google-email" label={t("verifiedEmail")}>
          <EmailInput
            id="google-email"
            placeholder={t("placeholders.verifiedEmail")}
            type="email"
            value={profile.email}
            readOnly
            autoComplete="off"
          />
        </FormField>
        <div
          aria-live="polite"
          className="flex items-center justify-between gap-3"
        >
          <h2
            ref={heading}
            tabIndex={-1}
            className="rounded-sm text-base font-semibold focus-visible:outline-2 focus-visible:outline-ring"
          >
            {t(STEP_TITLES[step])}
          </h2>
          <span className="shrink-0 text-sm text-muted-foreground">
            {t("step", { current: step + 1, total: STEP_TITLES.length })}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={t("progress")}
          aria-valuemin={0}
          aria-valuemax={STEP_TITLES.length}
          aria-valuenow={step + 1}
          className="grid grid-cols-2 gap-1"
        >
          <TooltipProvider delayDuration={100} skipDelayDuration={100}>
            <div className="contents">
              {STEP_TITLES.map((title, index) => (
                <Tooltip key={title}>
                  <TooltipTrigger asChild>
                    <span
                      aria-label={t(title)}
                      className={`h-1 cursor-help rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{t(title)}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
        <div className="flex min-h-5 items-center justify-between ">
          <p
            aria-live="polite"
            role="status"
            className={`text-xs ${
              draft.saveStatus === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {draft.saveStatus === "restored"
              ? t("draftRestored")
              : draft.saveStatus === "saving"
                ? t("draftSaving")
                : draft.saveStatus === "saved"
                  ? t("draftSaved")
                  : draft.saveStatus === "error"
                    ? t("draftSaveFailed")
                    : null}
          </p>
          {draft.hasDraft ? (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 shrink-0 px-2 text-xs hover:cursor-pointer hover:underline text-destructive hover:bg-transparent hover:text-destructive/80"
              onClick={() => setDiscardDialogOpen(true)}
            >
              {t("discardDraft")}
            </Button>
          ) : null}
        </div>
        <fieldset disabled={busy} className="space-y-4">
          <legend className="sr-only">{t(STEP_TITLES[step])}</legend>
          {step === 0 ? (
            <BusinessInformationStep
              locale={locale}
              disabled={busy}
              phoneCountry={phoneCountry}
              businessSlug={businessSlug}
              businessNameStatus={businessNameStatus}
              onCheckBusinessName={checkBusinessName}
            />
          ) : null}
          {step === 1 ? (
            <BusinessAddressStep locale={locale} disabled={busy} />
          ) : null}
          <div className="flex gap-2 pt-3">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 rounded-full flex-1"
                onClick={goBack}
              >
                {t("back")}
              </Button>
            ) : null}
            <Button
              className="min-h-11 rounded-full flex-1"
              disabled={
                busy || (step === 0 && businessNameStatus !== "available")
              }
              type="submit"
            >
              {t(
                isPending ? "completing" : step === 1 ? "complete" : "continue",
              )}
            </Button>
          </div>
        </fieldset>
      </form>
      <ConfirmDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        title={t("discardDraftDialog.title")}
        description={t("discardDraftDialog.description")}
        cancelLabel={t("discardDraftDialog.cancel")}
        confirmLabel={t("discardDraftDialog.confirm")}
        onConfirm={() => {
          draft.clearDraft();
          setDiscardDialogOpen(false);
        }}
      />
    </FormProvider>
  );
}
