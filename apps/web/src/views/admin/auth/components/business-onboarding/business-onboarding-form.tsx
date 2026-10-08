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
import { LoaderCircle } from "lucide-react";
import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { useBusinessNameAvailability } from "../../hooks/use-business-name-availability";
import { useOwnerContactAvailability } from "../../hooks/use-owner-contact-availability";
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
  availabilityProvider = "email",
}: {
  profile: OwnerOnboardingProfile;
  locale: string;
  isPending: boolean;
  onSubmit: (input: CompleteOwnerBusinessInput) => Promise<void>;
  onDraftStateChange?: (hasDraft: boolean, clearDraft: () => void) => void;
  availabilityProvider?: "email" | "google";
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
  } = useBusinessNameAvailability(form.watch("slug"));
  const busy = isPending || form.formState.isSubmitting;
  const creatingBusiness =
    isPending || (step === 1 && form.formState.isSubmitting);
  const usernameAvailability = useOwnerContactAvailability(
    form,
    "username",
    availabilityProvider,
  );
  const phoneAvailability = useOwnerContactAvailability(
    form,
    "phone",
    availabilityProvider,
  );

  useEffect(() => {
    if (
      !draft.hydrated ||
      !draft.hasRestoredDraft ||
      step !== 0 ||
      checkedRestoredBusinessName.current
    ) {
      return;
    }
    const restoredSlug =
      form.getValues("slug") || createBusinessSlug(form.getValues("name"));
    if (restoredSlug && !form.getValues("slug")) {
      form.setValue("slug", restoredSlug, { shouldDirty: false });
    }
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
    const changed =
      previousStep.current !== null && previousStep.current !== step;
    previousStep.current = step;
    if (changed) {
      const title = heading.current;
      title?.focus({ preventScroll: true });
      const bounds = title?.getBoundingClientRect();
      if (bounds && (bounds.top < 96 || bounds.bottom > window.innerHeight)) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          title?.scrollIntoView({ behavior: "instant", block: "start" });
          return;
        }
        const animation = animate(
          window.scrollY,
          window.scrollY + bounds.top - 96,
          {
            duration: 0.8,
            ease: "easeInOut",
            onUpdate: (top) => window.scrollTo({ top, behavior: "instant" }),
          },
        );
        const stop = () => {
          animation.stop();
          window.removeEventListener("wheel", stop);
          window.removeEventListener("touchstart", stop);
          window.removeEventListener("keydown", stop);
        };
        window.addEventListener("wheel", stop, { passive: true });
        window.addEventListener("touchstart", stop, { passive: true });
        window.addEventListener("keydown", stop);
        return stop;
      }
    }
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
      slug: input.slug.trim(),
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
        const path = issue.path;
        form.setError(
          path.join(".") as FieldPath<CompleteOwnerBusinessInput>,
          {
            message: t(
              path.join(".") === "owner.phone"
                ? "invalidPhone"
                : "invalidField",
            ),
          },
          { shouldFocus: true },
        );
      }
      return;
    }
    const contacts = await Promise.all([
      usernameAvailability.check(),
      phoneAvailability.check(),
    ]);
    if (contacts.some((available) => !available)) {
      if (step !== 0) {
        draft.persistDraft(0);
        setStep(0);
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
            className="scroll-mt-24 rounded-sm text-base font-semibold focus-visible:outline-2 focus-visible:outline-ring"
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
        <div className="flex min-h-5 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <legend className="sr-only">{t(STEP_TITLES[step])}</legend>
          <div
            key={step}
            data-onboarding-step={step}
            className="space-y-5 animate-panel-in motion-reduce:animate-none [&_input:disabled]:bg-card [&_input:disabled]:text-foreground"
          >
            {step === 0 ? (
              <BusinessInformationStep
                locale={locale}
                disabled={busy}
                phoneCountry={phoneCountry}
                businessNameStatus={businessNameStatus}
                onCheckBusinessName={checkBusinessName}
                usernameStatus={usernameAvailability.status}
                phoneStatus={phoneAvailability.status}
                onCheckUsername={usernameAvailability.check}
                onCheckPhone={phoneAvailability.check}
              />
            ) : null}
            {step === 1 ? (
              <BusinessAddressStep locale={locale} disabled={busy} />
            ) : null}
          </div>
          <div className="flex flex-col gap-2 pt-3 sm:flex-row">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-13 rounded-full flex-1 text-base font-semibold"
                onClick={goBack}
              >
                {t("back")}
              </Button>
            ) : null}
            <Button
              className="min-h-13 rounded-full flex-1 text-base font-semibold"
              disabled={
                busy || (step === 0 && businessNameStatus !== "available")
              }
              type="submit"
              aria-busy={busy}
            >
              {busy && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              )}
              {t(
                creatingBusiness
                  ? "completing"
                  : busy
                    ? "availability.checking"
                    : step === 1
                      ? "complete"
                      : "continue",
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
