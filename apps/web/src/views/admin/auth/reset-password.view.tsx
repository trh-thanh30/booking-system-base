"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useToast } from "@repo/hooks";
import { resetPasswordSchema, type ResetPasswordInput } from "@repo/shared";
import { Button } from "@repo/ui";
import {
  AuthInput as Input,
  PasswordInput,
  FormField,
} from "@/src/components/common";
import { Link, useRouter } from "@/src/i18n/navigation";
import { authService } from "@/src/services/admin/auth.service";
import { AuthShell, EmailAuthFeedback } from "./components";
import { useEmailAuthFeedback } from "./hooks/use-email-auth-feedback";

export function ResetPasswordView({
  initialSessionId = "",
}: {
  initialSessionId?: string;
}) {
  const { toast } = useToast();
  const t = useTranslations("Auth");
  const placeholders = useTranslations("AuthJourney.placeholders");
  const router = useRouter();
  const feedback = useEmailAuthFeedback();
  const reset = useMutation({
    mutationFn: authService.resetPassword,
    retry: false,
  });
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<ResetPasswordInput>({
    defaultValues: {
      code: "",
      confirmPassword: "",
      password: "",
      sessionId: initialSessionId,
    },
  });

  async function onSubmit(input: ResetPasswordInput) {
    if (
      !initialSessionId ||
      feedback.expired ||
      feedback.remaining ||
      reset.isPending
    )
      return;
    const parsed = resetPasswordSchema.safeParse({
      ...input,
      sessionId: initialSessionId,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          field === "code" ||
          field === "password" ||
          field === "confirmPassword"
        ) {
          const key =
            field === "code"
              ? "codeFormat"
              : field === "password"
                ? "passwordLength"
                : "passwordMismatch";
          setError(field, { message: t(`emailFlow.${key}`) });
        }
      }
      return;
    }
    feedback.clear();
    try {
      await reset.mutateAsync(parsed.data);
      toast.success(t("reset.success"));
      router.replace("/admin/login");
    } catch (error) {
      feedback.fail(error, "otp");
    }
  }

  const expired = !initialSessionId || feedback.expired;
  return (
    <AuthShell description={t("reset.description")} title={t("reset.title")}>
      <div className="space-y-4">
        <EmailAuthFeedback
          errorKey={
            !initialSessionId ? "emailFlow.sessionExpired" : feedback.errorKey
          }
          remaining={feedback.remaining}
        />
        {expired ? (
          <Button asChild className="w-full">
            <Link href="/admin/forgot-password">
              {t("emailFlow.requestNewCode")}
            </Link>
          </Button>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              error={errors.code?.message}
              htmlFor="code"
              label={t("fields.code")}
              required
            >
              <Input
                id="code"
                placeholder={placeholders("code")}
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                className="tracking-[0.3em]"
                disabled={reset.isPending}
                aria-invalid={Boolean(errors.code)}
                aria-describedby={errors.code ? "code-error" : undefined}
                {...register("code")}
              />
            </FormField>
            <FormField
              error={errors.password?.message}
              htmlFor="password"
              label={t("fields.password")}
              description={t("emailFlow.passwordLength")}
              required
            >
              <PasswordInput
                id="password"
                placeholder={placeholders("newPassword")}
                type="password"
                autoComplete="new-password"
                disabled={reset.isPending}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                {...register("password")}
              />
            </FormField>
            <FormField
              error={errors.confirmPassword?.message}
              htmlFor="confirmPassword"
              label={t("fields.confirmPassword")}
              required
            >
              <PasswordInput
                id="confirmPassword"
                placeholder={placeholders("confirmPassword")}
                type="password"
                autoComplete="new-password"
                disabled={reset.isPending}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
                {...register("confirmPassword")}
              />
            </FormField>
            <Button
              className="w-full"
              disabled={reset.isPending || feedback.remaining > 0}
              type="submit"
            >
              {reset.isPending ? t("reset.submitting") : t("reset.submit")}
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/forgot-password">
                {t("emailFlow.requestNewCode")}
              </Link>
            </Button>
          </form>
        )}
        <Button asChild className="w-full" variant="ghost">
          <Link href="/admin/login">{t("backToLogin")}</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
