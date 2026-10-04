"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useToast } from "@repo/hooks";
import { emailRequestSchema, type EmailRequestInput } from "@repo/shared";
import { Button } from "@repo/ui";
import { EmailInput, FormField } from "@/src/components/common";
import { Link, useRouter } from "@/src/i18n/navigation";
import { authService } from "@/src/services/admin/auth.service";
import { AuthShell, EmailAuthFeedback } from "./components";
import { useEmailAuthFeedback } from "./hooks/use-email-auth-feedback";
import { getSessionUrl } from "./utils/email-auth.utils";

export function ForgotPasswordView() {
  const { toast } = useToast();
  const t = useTranslations("Auth");
  const placeholders = useTranslations("AuthJourney.placeholders");
  const router = useRouter();
  const feedback = useEmailAuthFeedback();
  const request = useMutation({
    mutationFn: authService.forgotPassword,
    retry: false,
  });
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<EmailRequestInput>({ defaultValues: { email: "" } });

  async function onSubmit(input: EmailRequestInput) {
    if (request.isPending || feedback.remaining) return;
    const parsed = emailRequestSchema.safeParse({ email: input.email.trim() });
    if (!parsed.success) {
      setError("email", { message: t("emailFlow.invalidEmail") });
      return;
    }
    feedback.clear();
    try {
      const result = await request.mutateAsync(parsed.data);
      toast.success(t("forgot.success"));
      router.replace(getSessionUrl("reset-password", result.sessionId));
    } catch (error) {
      feedback.fail(error, "request");
    }
  }

  return (
    <AuthShell description={t("forgot.description")} title={t("forgot.title")}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <EmailAuthFeedback
          errorKey={feedback.errorKey}
          remaining={feedback.remaining}
        />
        <FormField
          error={errors.email?.message}
          htmlFor="email"
          label={t("fields.email")}
        >
          <EmailInput
            id="email"
            placeholder={placeholders("email")}
            type="email"
            autoComplete="email"
            disabled={request.isPending}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </FormField>
        <Button
          className="w-full"
          disabled={request.isPending || feedback.remaining > 0}
          type="submit"
        >
          {request.isPending ? t("forgot.submitting") : t("forgot.submit")}
        </Button>
        <Button asChild className="w-full" variant="ghost">
          <Link href="/admin/login">{t("backToLogin")}</Link>
        </Button>
      </form>
    </AuthShell>
  );
}
