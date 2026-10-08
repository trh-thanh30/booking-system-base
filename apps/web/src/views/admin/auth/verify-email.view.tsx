"use client";

import { EmailInput, FormField } from "@/src/components/common";
import { Link, useRouter } from "@/src/i18n/navigation";
import { getLoginUrl } from "@/src/lib/admin/auth-routing";
import { authService } from "@/src/services/admin/auth.service";
import { useToast } from "@repo/hooks";
import {
  emailRequestSchema,
  verifyEmailSchema,
  type EmailRequestInput,
  type VerifyEmailInput,
} from "@repo/shared";
import {
  Button,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { Clock3, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthShell } from "./components";
import { useEmailAuthFeedback } from "./hooks/use-email-auth-feedback";
import { useVerificationCountdown } from "./hooks/use-verification-countdown";
import { formatCountdown, getSessionUrl } from "./utils/email-auth.utils";

export function VerifyEmailView({
  initialSessionId = "",
  returnTo,
  ownerOnboarding = false,
}: {
  initialSessionId?: string;
  returnTo?: string;
  ownerOnboarding?: boolean;
}) {
  const { toast } = useToast();
  const t = useTranslations("Auth");
  const placeholders = useTranslations("AuthJourney.placeholders");
  const router = useRouter();
  const [sessionId, setSessionId] = useState(initialSessionId);
  const feedback = useEmailAuthFeedback();
  const expiry = useVerificationCountdown(sessionId);
  const verifiedRemaining = useRef(expiry.remaining);
  const request = useMutation({
    mutationFn: authService.requestVerification,
    retry: false,
  });
  const verify = useMutation({
    mutationFn: authService.verifyOwnerAccount,
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
  const verifying = verify.isPending || verify.isSuccess;
  const pending = request.isPending || verifying || resend.isPending;

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
      expiry.clear();
      setSessionId(result.sessionId);
      feedback.resetSession();
      feedback.cooldown();
      verifyForm.reset({ code: "", sessionId: result.sessionId });
      router.replace(
        getSessionUrl("verify-email", result.sessionId, returnTo) +
          (ownerOnboarding ? "&onboarding=1" : ""),
      );
      toast.success(t("verify.requestSuccess"));
    } catch (error) {
      const result = feedback.fail(error, "request");
      toast.error(t(result.key));
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
      const result = await verify.mutateAsync(parsed.data);
      verifiedRemaining.current = expiry.remaining;
      expiry.clear();
      toast.success(t("verify.success"));
      router.replace(
        result.onboarding_required
          ? "/admin/onboarding/business?provider=email"
          : loginUrl,
      );
    } catch (error) {
      const result = feedback.fail(error, "otp");
      if (result.key === "emailFlow.invalidCode") {
        feedback.clear();
        verifyForm.setError(
          "code",
          { message: t("verify.invalidCodeInline") },
          { shouldFocus: true },
        );
      }
      toast.error(t(result.key));
    }
  }

  async function resendCode() {
    if (!sessionId || pending || feedback.remaining || feedback.expired) return;
    feedback.clear();
    try {
      await resend.mutateAsync({ sessionId });
      expiry.restart();
      feedback.cooldown();
      verifyForm.reset({ code: "", sessionId });
      toast.success(t("verify.resendSuccess"));
    } catch (error) {
      const result = feedback.fail(error, "otp");
      toast.error(t(result.key));
    }
  }

  return (
    <AuthShell description={t("verify.description")} title={t("verify.title")}>
      <div className="space-y-5">
        {sessionId && !feedback.expired ? (
          <form
            className="space-y-5"
            onSubmit={verifyForm.handleSubmit(verifyCode)}
          >
            <div className="space-y-2 rounded-md border bg-muted p-4 text-sm text-muted-foreground">
              <p>{t("verify.codeHint")}</p>
              <p
                role="timer"
                aria-live="off"
                className={
                  expiry.expired && !verify.isSuccess
                    ? "flex items-center gap-2 font-medium text-destructive"
                    : "flex items-center gap-2 font-medium text-foreground"
                }
              >
                <Clock3 aria-hidden="true" className="size-4" />
                {expiry.expired && !verify.isSuccess
                  ? t("verify.codeExpired")
                  : t("verify.expiresIn", {
                      time: formatCountdown(
                        verify.isSuccess
                          ? verifiedRemaining.current
                          : expiry.remaining,
                      ),
                    })}
              </p>
            </div>
            <div className="space-y-2">
              <FormField
                className="mb-1.5"
                error={verifyForm.formState.errors.code?.message}
                htmlFor="code"
                label={t("fields.code")}
                required
              >
                <Controller
                  control={verifyForm.control}
                  name="code"
                  render={({ field }) => {
                    const invalid = Boolean(verifyForm.formState.errors.code);
                    return (
                      <InputOTP
                        {...field}
                        id="code"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        aria-invalid={invalid}
                        aria-describedby={invalid ? "code-error" : undefined}
                        containerClassName="w-full min-w-0 justify-center"
                        disabled={pending || expiry.expired}
                        onChange={(value) => {
                          field.onChange(value);
                          if (verifyForm.formState.errors.code) {
                            verifyForm.clearErrors("code");
                          }
                        }}
                      >
                        <InputOTPGroup className="min-w-0 flex-1 gap-1 sm:gap-2">
                          {Array.from({ length: 6 }, (_, index) => (
                            <InputOTPSlot
                              className="h-13 min-w-0 flex-1 text-xl font-semibold sm:h-13"
                              key={index}
                              index={index}
                              aria-invalid={invalid}
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    );
                  }}
                />
              </FormField>
              <Button
                className="ml-auto flex h-auto min-h-0 px-0 py-0 text-sm text-primary hover:bg-transparent hover:text-primary-hover disabled:bg-transparent disabled:text-primary/60"
                disabled={pending || feedback.remaining > 0}
                onClick={() => void resendCode()}
                type="button"
                variant="ghost"
              >
                {resend.isPending
                  ? t("verify.resending")
                  : feedback.remaining > 0
                    ? t("verify.resendIn", {
                        seconds: feedback.remaining,
                      })
                    : t("verify.resend")}
              </Button>
            </div>
            <Button
              className="w-full min-h-13 rounded-full text-base font-semibold"
              disabled={
                pending ||
                expiry.expired ||
                verifyForm.watch("code").length !== 6 ||
                (feedback.errorKey === "emailFlow.rateLimited" &&
                  feedback.remaining > 0)
              }
              type="submit"
            >
              {verifying ? t("verify.submitting") : t("verify.submit")}
              {verifying && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              )}
            </Button>
          </form>
        ) : (
          <form
            className="space-y-5"
            onSubmit={requestForm.handleSubmit(requestCode)}
          >
            <FormField
              error={requestForm.formState.errors.email?.message}
              htmlFor="email"
              label={t("fields.email")}
              required
            >
              <EmailInput
                id="email"
                placeholder={placeholders("email")}
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
              className="w-full min-h-13 rounded-full text-base font-semibold"
              disabled={pending || feedback.remaining > 0}
              type="submit"
            >
              {request.isPending ? t("verify.requesting") : t("verify.request")}
            </Button>
          </form>
        )}
        <Button
          asChild
          className="w-full min-h-13 rounded-full text-base font-semibold"
          variant="ghost"
        >
          <Link href={loginUrl}>{t("backToLogin")}</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
