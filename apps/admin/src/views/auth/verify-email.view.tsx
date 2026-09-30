"use client";

import { ArrowLeft, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  emailRequestSchema,
  verifyEmailSchema,
  type EmailRequestInput,
  type VerifyEmailInput,
} from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { Link, useRouter } from "@/src/i18n/navigation";
import { authService } from "@/src/services/auth.service";
import { AuthShell } from "./components/auth-shell";

export function VerifyEmailView({
  initialSessionId = "",
}: {
  initialSessionId?: string;
}) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [isResending, setIsResending] = useState(false);
  const requestForm = useForm<EmailRequestInput>({
    defaultValues: { email: "" },
  });
  const verifyForm = useForm<VerifyEmailInput>({
    defaultValues: {
      code: "",
      sessionId,
    },
  });

  async function requestCode(input: EmailRequestInput) {
    const parsed = emailRequestSchema.safeParse(input);

    if (!parsed.success) {
      requestForm.setError("email", {
        message: parsed.error.issues[0]?.message,
      });
      return;
    }

    try {
      const result = await authService.requestVerification(parsed.data);
      setSessionId(result.sessionId);
      verifyForm.reset({ code: "", sessionId: result.sessionId });
      router.replace(
        `/verify-email?sessionId=${encodeURIComponent(result.sessionId)}`,
      );
      toast.success(t("verify.requestSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("verify.requestFailed"),
      );
    }
  }

  async function verifyCode(input: VerifyEmailInput) {
    const parsed = verifyEmailSchema.safeParse({ ...input, sessionId });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0] as keyof VerifyEmailInput | undefined;
      if (field && issue) {
        verifyForm.setError(field, { message: issue.message });
      }
      return;
    }

    try {
      await authService.verifyEmail(parsed.data);
      toast.success(t("verify.success"));
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("verify.failed"));
    }
  }

  async function resendCode() {
    if (!sessionId || isResending) return;

    setIsResending(true);
    try {
      await authService.resendVerification({ sessionId });
      toast.success(t("verify.resendSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("verify.resendFailed"),
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell description={t("verify.description")} title={t("verify.title")}>
      {sessionId ? (
        <form
          className="space-y-4"
          onSubmit={verifyForm.handleSubmit(verifyCode)}
        >
          <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {t("verify.codeHint")}
          </div>
          <FormField
            error={verifyForm.formState.errors.code?.message}
            htmlFor="code"
            label={t("fields.code")}
          >
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                autoComplete="one-time-code"
                className="pl-9 tracking-[0.3em]"
                id="code"
                inputMode="numeric"
                maxLength={6}
                {...verifyForm.register("code")}
              />
            </div>
          </FormField>
          <Button
            className="w-full"
            disabled={verifyForm.formState.isSubmitting}
            type="submit"
          >
            <ShieldCheck className="h-4 w-4" />
            {verifyForm.formState.isSubmitting
              ? t("verify.submitting")
              : t("verify.submit")}
          </Button>
          <Button
            className="w-full"
            disabled={isResending}
            onClick={() => void resendCode()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            {isResending ? t("verify.resending") : t("verify.resend")}
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
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                autoComplete="email"
                className="pl-9"
                id="email"
                type="email"
                {...requestForm.register("email")}
              />
            </div>
          </FormField>
          <Button
            className="w-full"
            disabled={requestForm.formState.isSubmitting}
            type="submit"
          >
            <Mail className="h-4 w-4" />
            {requestForm.formState.isSubmitting
              ? t("verify.requesting")
              : t("verify.request")}
          </Button>
        </form>
      )}
      <Button asChild className="mt-3 w-full" type="button" variant="ghost">
        <Link href="/login">
          <ArrowLeft className="h-4 w-4" />
          {t("backToLogin")}
        </Link>
      </Button>
    </AuthShell>
  );
}
