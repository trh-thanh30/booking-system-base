"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useToast } from "@repo/hooks";
import {
  emailRequestSchema,
  verifyEmailSchema,
  type EmailRequestInput,
  type VerifyEmailInput,
} from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { Link, useRouter } from "@/src/i18n/navigation";
import { getLoginUrl } from "@/src/lib/admin/auth-routing";
import { authService } from "@/src/services/admin/auth.service";
import { AuthShell } from "./components/auth-shell";
import { EmailAuthFeedback } from "./components/email-auth-feedback";
import { useEmailAuthFeedback } from "./hooks/use-email-auth-feedback";
import { getSessionUrl } from "./utils/email-auth.utils";

export function VerifyEmailView({
  initialSessionId = "",
  returnTo,
}: {
  initialSessionId?: string;
  returnTo?: string;
}) {
  const { toast } = useToast();
  const t = useTranslations("Auth");
  const router = useRouter();
  const [sessionId, setSessionId] = useState(initialSessionId);
  const feedback = useEmailAuthFeedback();
  const request = useMutation({
    mutationFn: authService.requestVerification,
    retry: false,
  });
  const verify = useMutation({
    mutationFn: authService.verifyEmail,
    retry: false,
  });
  const resend = useMutation({
    mutationFn: authService.resendVerification,
    retry: false,
  });
  const requestForm = useForm<EmailRequestInput>({
    defaultValues: { email: "" },
  });
  const verifyForm = useForm<VerifyEmailInput>({
    defaultValues: { code: "", sessionId },
  });
  const loginUrl = returnTo ? getLoginUrl(returnTo) : "/admin/login";
  const pending = request.isPending || verify.isPending || resend.isPending;

  async function requestCode(input: EmailRequestInput) {
    if (pending || feedback.remaining) return;
    const parsed = emailRequestSchema.safeParse({ email: input.email.trim() });
    if (!parsed.success) {
      requestForm.setError("email", { message: t("emailFlow.invalidEmail") });
      return;
    }
    feedback.clear();
    try {
      const result = await request.mutateAsync(parsed.data);
      setSessionId(result.sessionId);
      feedback.resetSession();
      feedback.cooldown();
      verifyForm.reset({ code: "", sessionId: result.sessionId });
      router.replace(getSessionUrl("verify-email", result.sessionId, returnTo));
      toast.success(t("verify.requestSuccess"));
    } catch (error) {
      feedback.fail(error, "request");
    }
  }

  async function verifyCode(input: VerifyEmailInput) {
    if (
      pending ||
      feedback.expired ||
      !sessionId ||
      (feedback.errorKey === "emailFlow.rateLimited" && feedback.remaining)
    )
      return;
    const parsed = verifyEmailSchema.safeParse({ ...input, sessionId });
    if (!parsed.success) {
      verifyForm.setError("code", { message: t("emailFlow.codeFormat") });
      return;
    }
    feedback.clear();
    try {
      await verify.mutateAsync(parsed.data);
      toast.success(t("verify.success"));
      router.replace(loginUrl);
    } catch (error) {
      feedback.fail(error, "otp");
    }
  }

  async function resendCode() {
    if (!sessionId || pending || feedback.remaining || feedback.expired) return;
    feedback.clear();
    try {
      await resend.mutateAsync({ sessionId });
      feedback.cooldown();
      verifyForm.reset({ code: "", sessionId });
      toast.success(t("verify.resendSuccess"));
    } catch (error) {
      feedback.fail(error, "otp");
    }
  }

  return (
    <AuthShell description={t("verify.description")} title={t("verify.title")}>
      <div className="space-y-4">
        <EmailAuthFeedback
          errorKey={feedback.errorKey}
          remaining={feedback.remaining}
        />
        {sessionId && !feedback.expired ? (
          <form
            className="space-y-4"
            onSubmit={verifyForm.handleSubmit(verifyCode)}
          >
            <p className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
              {t("verify.codeHint")}
            </p>
            <FormField
              error={verifyForm.formState.errors.code?.message}
              htmlFor="code"
              label={t("fields.code")}
            >
              <Input
                id="code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                aria-invalid={Boolean(verifyForm.formState.errors.code)}
                aria-describedby={
                  verifyForm.formState.errors.code ? "code-error" : undefined
                }
                className="tracking-[0.3em]"
                disabled={pending}
                {...verifyForm.register("code")}
              />
            </FormField>
            <Button
              className="w-full"
              disabled={
                pending ||
                (feedback.errorKey === "emailFlow.rateLimited" &&
                  feedback.remaining > 0)
              }
              type="submit"
            >
              {verify.isPending ? t("verify.submitting") : t("verify.submit")}
            </Button>
            <Button
              className="w-full"
              disabled={pending || feedback.remaining > 0}
              onClick={() => void resendCode()}
              type="button"
              variant="outline"
            >
              {resend.isPending ? t("verify.resending") : t("verify.resend")}
            </Button>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={requestForm.handleSubmit(requestCode)}
          >
            <FormField
              error={requestForm.formState.errors.email?.message}
              htmlFor="email"
              label={t("fields.email")}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={pending}
                aria-invalid={Boolean(requestForm.formState.errors.email)}
                aria-describedby={
                  requestForm.formState.errors.email ? "email-error" : undefined
                }
                {...requestForm.register("email")}
              />
            </FormField>
            <Button
              className="w-full"
              disabled={pending || feedback.remaining > 0}
              type="submit"
            >
              {request.isPending ? t("verify.requesting") : t("verify.request")}
            </Button>
          </form>
        )}
        <Button asChild className="w-full" variant="ghost">
          <Link href={loginUrl}>{t("backToLogin")}</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
