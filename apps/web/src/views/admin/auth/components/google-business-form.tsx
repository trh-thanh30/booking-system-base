"use client";

import { useForm, type FieldPath } from "react-hook-form";
import { useTranslations } from "next-intl";
import type {
  CompleteGoogleOwnerOnboardingInput,
  GoogleOnboardingProfile,
} from "@repo/shared";
import { Avatar, AvatarFallback, AvatarImage, Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { GOOGLE_ONBOARDING_FIELDS } from "../constants/google-onboarding.constants";
import { parseGoogleOnboarding } from "../utils/google-onboarding.utils";

export function GoogleBusinessForm({
  profile,
  locale,
  isPending,
  onSubmit,
}: {
  profile: GoogleOnboardingProfile;
  locale: string;
  isPending: boolean;
  onSubmit: (input: CompleteGoogleOwnerOnboardingInput) => Promise<void>;
}) {
  const t = useTranslations("Auth");
  const form = useForm<CompleteGoogleOwnerOnboardingInput>({
    defaultValues: {
      name: "",
      slug: "",
      default_business_name: "",
      default_business_slug: "",
      primary_domain: "",
      owner: { username: "", phone: "" },
      timezone: "Asia/Ho_Chi_Minh",
      locale: locale === "en" ? "en" : "vi",
    },
  });

  async function submit(input: CompleteGoogleOwnerOnboardingInput) {
    if (isPending) return;
    const parsed = parseGoogleOnboarding(input);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        form.setError(
          issue.path.join(".") as FieldPath<CompleteGoogleOwnerOnboardingInput>,
          { message: t("google.invalidField") },
        );
      }
      return;
    }
    try {
      new Intl.DateTimeFormat("en", { timeZone: parsed.data.timezone });
    } catch {
      form.setError("timezone", { message: t("google.invalidTimezone") });
      return;
    }
    await onSubmit(parsed.data);
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(submit)}>
      <div className="flex items-center gap-3 rounded-md border bg-muted p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={
              profile.avatar_url?.startsWith("https://")
                ? profile.avatar_url
                : undefined
            }
            alt={profile.full_name ?? t("google.verifiedIdentity")}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback>{profile.full_name?.[0] ?? "G"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">
            {profile.full_name ?? t("google.verifiedIdentity")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("google.verifiedIdentity")}
          </p>
        </div>
      </div>
      <FormField
        htmlFor="google-email"
        label={t("google.fields.email")}
        description={t("google.emailReadOnly")}
      >
        <Input
          id="google-email"
          type="email"
          value={profile.email}
          readOnly
          autoComplete="off"
        />
      </FormField>
      <fieldset
        disabled={isPending || form.formState.isSubmitting}
        className="grid gap-4 sm:grid-cols-2"
      >
        <legend className="sr-only">{t("google.workspaceDetails")}</legend>
        {GOOGLE_ONBOARDING_FIELDS.map((field) => {
          const error = form.getFieldState(field.name, form.formState).error;
          return (
            <FormField
              key={field.name}
              htmlFor={field.id}
              label={t(`google.fields.${field.label}`)}
              error={error?.message}
            >
              <Input
                id={field.id}
                autoComplete={field.autoComplete}
                type={field.name === "owner.phone" ? "tel" : "text"}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${field.id}-error` : undefined}
                {...form.register(field.name)}
              />
            </FormField>
          );
        })}
        <FormField htmlFor="workspace-locale" label={t("google.fields.locale")}>
          <select
            id="workspace-locale"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...form.register("locale")}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </FormField>
        <Button
          className="w-full sm:col-span-2"
          type="submit"
          disabled={isPending || form.formState.isSubmitting}
        >
          {isPending ? t("google.completing") : t("google.complete")}
        </Button>
      </fieldset>
    </form>
  );
}
