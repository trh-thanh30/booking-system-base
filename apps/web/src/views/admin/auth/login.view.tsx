"use client";

import { Lock, LogIn, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@repo/hooks";
import { loginSchema, type LoginInput } from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { useAuth } from "@/src/app/providers/admin";
import { Link, useRouter } from "@/src/i18n/navigation";
import { AuthShell } from "./components/auth-shell";
import { getSafeReturnTo } from "@/src/lib/admin/auth-routing";
import { getLoginErrorKey } from "./utils/auth.utils";
import { getUnverifiedEmailUrl } from "./utils/email-auth.utils";
import { getOAuthErrorKey, stripOAuthError } from "./utils/google-auth.utils";
import { useGoogleLogin } from "./hooks/use-google-login";

export function LoginView({
  returnTo,
  oauthError,
}: {
  returnTo?: string;
  oauthError?: string;
}) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(
    oauthError ? t(getOAuthErrorKey(oauthError)) : null,
  );
  const handledOAuthError = useRef<string | null>(null);
  const google = useGoogleLogin(returnTo);
  useEffect(() => {
    if (!oauthError || handledOAuthError.current === oauthError) return;
    handledOAuthError.current = oauthError;
    toast.error(t(getOAuthErrorKey(oauthError)));
    window.history.replaceState(
      window.history.state,
      "",
      stripOAuthError(window.location.href),
    );
  }, [oauthError, t, toast]);
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
    if (google.isRedirecting || loginMutation.isPending) return;
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
      const verificationUrl = getUnverifiedEmailUrl(error, destination);
      if (verificationUrl) {
        toast.info(t("login.verificationRequired"));
        router.replace(verificationUrl);
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
                disabled={isSubmitting || google.isRedirecting}
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
                disabled={isSubmitting || google.isRedirecting}
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
              href="/admin/verify-email"
            >
              {t("login.verifyEmail")}
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              href="/admin/forgot-password"
            >
              {t("login.forgotPassword")}
            </Link>
          </div>
          <Button
            className="w-full"
            disabled={
              isSubmitting || loginMutation.isPending || google.isRedirecting
            }
            type="submit"
          >
            <LogIn className="h-4 w-4" />
            {isSubmitting ? t("login.submitting") : t("login.submit")}
          </Button>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>{t("google.or")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            className="w-full"
            variant="outline"
            type="button"
            disabled={
              isSubmitting || loginMutation.isPending || google.isRedirecting
            }
            onClick={google.startGoogleLogin}
          >
            {google.isRedirecting ? t("google.redirecting") : t("google.login")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
