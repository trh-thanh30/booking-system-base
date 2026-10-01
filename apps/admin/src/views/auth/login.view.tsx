"use client";

import { Lock, LogIn, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@repo/hooks";
import { HttpClientError, loginSchema, type LoginInput } from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { useAuth } from "@/src/app/providers";
import { Link, useRouter } from "@/src/i18n/navigation";
import { AuthShell } from "./components/auth-shell";
import { getSafeReturnTo } from "@/src/lib/auth-routing";
import { getLoginErrorKey } from "./utils/auth.utils";

export function LoginView({ returnTo }: { returnTo?: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const loginMutation = useMutation({ mutationFn: login, retry: false });
  const destination = getSafeReturnTo(returnTo);
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace(destination);
  }, [destination, isAuthenticated, isLoading, router]);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInput>({
    defaultValues: {
      password: "",
      usernameOrEmail: "",
    },
  });

  async function onSubmit(input: LoginInput) {
    setSubmitError(null);
    const parsed = loginSchema.safeParse(input);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0] as keyof LoginInput | undefined;

      if (field && issue) {
        setError(field, { message: issue.message });
      }

      return;
    }

    try {
      await loginMutation.mutateAsync(parsed.data);
      toast.success(t("login.success"));
      router.replace(destination);
    } catch (error) {
      if (
        error instanceof HttpClientError &&
        error.code === "EMAIL_NOT_VERIFIED"
      ) {
        const details = error.details;
        const sessionId =
          typeof details === "object" &&
          details !== null &&
          "sessionId" in details &&
          typeof details.sessionId === "string"
            ? details.sessionId
            : undefined;

        toast.info(t("login.verificationRequired"));
        const verificationUrl = sessionId
          ? "/verify-email?sessionId=" + encodeURIComponent(sessionId)
          : "/verify-email";
        router.replace(
          verificationUrl +
            (sessionId ? "&" : "?") +
            "returnTo=" +
            encodeURIComponent(destination),
        );
        return;
      }

      setSubmitError(t(getLoginErrorKey(error)));
    }
  }

  return (
    <AuthShell description={t("login.description")} title={t("login.title")}>
      {isLoading || isAuthenticated ? (
        <p role="status" className="text-muted-foreground">
          {t("checkingSession")}
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {submitError ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {submitError}
            </p>
          ) : null}
          <FormField
            error={errors.usernameOrEmail?.message}
            htmlFor="usernameOrEmail"
            label={t("fields.usernameOrEmail")}
          >
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-invalid={Boolean(errors.usernameOrEmail)}
                aria-describedby={
                  errors.usernameOrEmail ? "usernameOrEmail-error" : undefined
                }
                disabled={isSubmitting}
                autoComplete="username"
                className="pl-9"
                id="usernameOrEmail"
                {...register("usernameOrEmail")}
              />
            </div>
          </FormField>
          <FormField
            error={errors.password?.message}
            htmlFor="password"
            label={t("fields.password")}
          >
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                disabled={isSubmitting}
                autoComplete="current-password"
                className="pl-9"
                id="password"
                type="password"
                {...register("password")}
              />
            </div>
          </FormField>
          <div className="flex items-center justify-between">
            <Link
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              href="/verify-email"
            >
              {t("login.verifyEmail")}
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              href="/forgot-password"
            >
              {t("login.forgotPassword")}
            </Link>
          </div>
          <Button
            className="w-full"
            disabled={isSubmitting || loginMutation.isPending}
            type="submit"
          >
            <LogIn className="h-4 w-4" />
            {isSubmitting ? t("login.submitting") : t("login.submit")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
