"use client";

import { useAuth } from "@/src/app/providers/admin";
import {
  EmailInput,
  FormField,
  GoogleIcon,
  PasswordInput,
} from "@/src/components/common";
import { useGoogleLogin } from "@/src/hooks/use-google-login";
import { Link, useRouter } from "@/src/i18n/navigation";
import { getPostAuthReturnTo } from "@/src/lib/admin/auth-routing";
import { buildTenantAdminUrl } from "@/src/lib/admin/admin-workspace-url";
import { authService } from "@/src/services/admin/auth.service";
import { useToast } from "@repo/hooks";
import { HttpClientError, loginSchema, type LoginInput } from "@repo/shared";
import { Button } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, LogIn } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthLoadingState, AuthShell } from "./components";
import {
  getLoginErrorKey,
  getLoginValidationErrorKey,
} from "./utils/auth.utils";
import { getUnverifiedEmailUrl } from "./utils/email-auth.utils";
import { getOAuthErrorKey, stripOAuthError } from "./utils/google-auth.utils";

export function LoginView({
  returnTo,
  oauthError,
}: {
  returnTo?: string;
  oauthError?: string;
}) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const placeholders = useTranslations("AuthJourney.placeholders");
  const router = useRouter();
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const handledOAuthError = useRef<string | null>(null);
  const manualLoginRedirect = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
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
  const destination = getPostAuthReturnTo(returnTo);
  useEffect(() => {
    if (
      !manualLoginRedirect.current &&
      !isLoading &&
      isAuthenticated &&
      user?.tenant?.slug
    ) {
      window.location.replace(
        buildTenantAdminUrl({
          locale,
          returnTo: destination,
          tenantSlug: user.tenant.slug,
        }),
      );
    }
  }, [destination, isAuthenticated, isLoading, locale, user]);
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
  const loggingIn = isSubmitting || loginMutation.isPending || isRedirecting;
  const busy = loggingIn || google.isRedirecting;

  async function onSubmit(input: LoginInput) {
    if (google.isRedirecting || loginMutation.isPending || isRedirecting)
      return;
    const parsed = loginSchema.safeParse(input);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0] as keyof LoginInput | undefined;

      if (field && issue) {
        setError(field, { message: t(getLoginValidationErrorKey(field)) });
      }

      return;
    }

    try {
      manualLoginRedirect.current = true;
      const authenticatedUser = await loginMutation.mutateAsync(parsed.data);
      if (!authenticatedUser.tenant?.slug) throw new Error("TENANT_REQUIRED");
      setIsRedirecting(true);
      toast.success(t("login.success"));
      window.location.replace(
        buildTenantAdminUrl({
          locale,
          returnTo: destination,
          tenantSlug: authenticatedUser.tenant.slug,
        }),
      );
    } catch (error) {
      manualLoginRedirect.current = false;
      if (
        error instanceof HttpClientError &&
        error.code === "OWNER_ONBOARDING_REQUIRED"
      ) {
        try {
          await authService.resumeOwnerOnboarding(parsed.data);
          setIsRedirecting(true);
          toast.success(t("login.onboardingRequired"));
          router.replace("/admin/onboarding/business?provider=email");
        } catch (resumeError) {
          toast.error(t(getLoginErrorKey(resumeError)));
        }
        return;
      }
      const verificationUrl = getUnverifiedEmailUrl(error, destination);
      if (verificationUrl) {
        setIsRedirecting(true);
        toast.info(t("login.verificationRequired"));
        router.replace(verificationUrl);
        return;
      }

      toast.error(t(getLoginErrorKey(error)));
    }
  }

  return (
    <AuthShell description={t("login.description")} title={t("login.title")}>
      {(isLoading || isAuthenticated) && !manualLoginRedirect.current ? (
        <AuthLoadingState
          title={t("checkingSession")}
          description={t("checkingSessionDescription")}
        />
      ) : (
        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          aria-busy={loggingIn}
        >
          <FormField
            error={errors.usernameOrEmail?.message}
            htmlFor="usernameOrEmail"
            label={t("fields.usernameOrEmail")}
            className="text-base font-semibold"
            required
          >
            <EmailInput
              className="h-13 min-h-13 text-base"
              type="text"
              aria-invalid={Boolean(errors.usernameOrEmail)}
              aria-describedby={
                errors.usernameOrEmail ? "usernameOrEmail-error" : undefined
              }
              disabled={busy}
              autoComplete="username"
              id="usernameOrEmail"
              placeholder={placeholders("usernameOrEmail")}
              {...register("usernameOrEmail")}
            />
          </FormField>
          <FormField
            error={errors.password?.message}
            htmlFor="password"
            label={t("fields.password")}
            className="text-base font-semibold"
            required
          >
            <PasswordInput
              className="h-13 min-h-13 text-base"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={busy}
              autoComplete="current-password"
              id="password"
              placeholder={placeholders("password")}
              type="password"
              {...register("password")}
            />
          </FormField>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
            className="min-h-13 w-full rounded-full text-base font-semibold"
            disabled={busy}
            type="submit"
          >
            {loggingIn ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            ) : (
              <LogIn aria-hidden="true" className="size-4" />
            )}
            {loggingIn ? t("login.submitting") : t("login.submit")}
          </Button>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>{t("google.or")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            className="min-h-13 w-full rounded-full text-base font-semibold"
            variant="outline"
            type="button"
            disabled={busy}
            onClick={google.startGoogleLogin}
          >
            <GoogleIcon />
            {google.isRedirecting ? t("google.redirecting") : t("google.login")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("login.noAccount")}
          </p>
          <Button
            asChild
            variant="outline"
            className="min-h-13 w-full rounded-full text-base font-semibold"
          >
            <Link href="/signup-business">{t("login.createAccount")}</Link>
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
