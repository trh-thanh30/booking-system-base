"use client";

import {
  EmailInput,
  FormField,
  GoogleIcon,
  PasswordInput,
} from "@/src/components/common";
import { AuthenticationLayout } from "@/src/components/layout";
import { useGoogleLogin } from "@/src/hooks/use-google-login";
import { Link, useRouter } from "@/src/i18n/navigation";
import { authService } from "@/src/services/auth.service";
import { useToast } from "@repo/hooks";
import {
  HttpClientError,
  registerOwnerAccountSchema,
  type RegisterOwnerAccountInput,
} from "@repo/shared";
import { Button } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

export function SignupBusinessView() {
  const t = useTranslations("AuthJourney");
  const auth = useTranslations("Auth");
  const router = useRouter();
  const { toast } = useToast();
  const google = useGoogleLogin();
  const form = useForm<RegisterOwnerAccountInput>({
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });
  const registration = useMutation({
    mutationFn: authService.registerOwnerAccount,
    retry: false,
  });
  const password = form.watch("password");
  const busy =
    registration.isPending ||
    form.formState.isSubmitting ||
    google.isRedirecting;
  async function submit(input: RegisterOwnerAccountInput) {
    if (registration.isPending || google.isRedirecting) return;
    form.clearErrors();
    const parsed = registerOwnerAccountSchema.safeParse(input);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        form.setError(issue.path[0] as keyof RegisterOwnerAccountInput, {
          message: t("invalidField"),
        });
      return;
    }
    try {
      const result = await registration.mutateAsync(parsed.data);
      toast.success(t("verificationSent"));
      form.reset();
      router.replace(
        `/admin/verify-email?${new URLSearchParams({ sessionId: result.sessionId, onboarding: "1" })}`,
      );
    } catch (failure) {
      toast.error(
        t(
          failure instanceof HttpClientError && failure.status === 409
            ? "accountExists"
            : "registrationFailed",
        ),
      );
    }
  }
  return (
    <AuthenticationLayout
      title={t("registerTitle")}
      description={t("registerDescription")}
    >
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(submit)}
        noValidate
      >
        <Button
          variant="outline"
          type="button"
          className="min-h-13 w-full rounded-full text-base font-semibold"
          disabled={busy}
          onClick={google.startGoogleLogin}
        >
          <GoogleIcon />
          {auth(google.isRedirecting ? "google.redirecting" : "google.login")}
        </Button>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {auth("google.or")}
          <span className="h-px flex-1 bg-border" />
        </div>
        <fieldset disabled={busy} className="space-y-5">
          <legend className="sr-only">{t("accountDetails")}</legend>
          <FormField
            htmlFor="owner-email"
            label={auth("fields.email")}
            error={form.formState.errors.email?.message}
            required
          >
            <EmailInput
              id="owner-email"
              placeholder={t("placeholders.email")}
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
          </FormField>
          <FormField
            htmlFor="owner-password"
            label={auth("fields.password")}
            error={form.formState.errors.password?.message}
            description={t(
              password.length >= 8 ? "passwordReady" : "passwordHint",
            )}
            descriptionClassName={
              password.length >= 8 ? "text-success" : undefined
            }
            descriptionRole="status"
            required
          >
            <PasswordInput
              id="owner-password"
              placeholder={t("placeholders.newPassword")}
              autoComplete="new-password"
              {...form.register("password")}
            />
          </FormField>
          <FormField
            htmlFor="owner-confirm-password"
            label={t("confirmPassword")}
            error={form.formState.errors.confirmPassword?.message}
            required
          >
            <PasswordInput
              id="owner-confirm-password"
              placeholder={t("placeholders.confirmPassword")}
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
          </FormField>
          <Button
            className="min-h-13 w-full rounded-full text-base font-semibold"
            type="submit"
            disabled={busy}
          >
            {t(registration.isPending ? "registering" : "continueEmail")}
          </Button>
        </fieldset>
        <p className="pt-3 text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href="/admin/login"
          >
            {auth("login.submit")}
          </Link>
        </p>
      </form>
    </AuthenticationLayout>
  );
}
