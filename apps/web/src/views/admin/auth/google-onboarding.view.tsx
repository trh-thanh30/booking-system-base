"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@repo/hooks";
import type { CompleteGoogleOwnerOnboardingInput } from "@repo/shared";
import { Button } from "@repo/ui";
import { useAuth } from "@/src/app/providers/admin";
import { Link, useRouter } from "@/src/i18n/navigation";
import { getSafeReturnTo } from "@/src/lib/admin/auth-routing";
import { authService } from "@/src/services/admin/auth.service";
import { AuthShell } from "./components/auth-shell";
import { GoogleBusinessForm } from "./components/google-business-form";
import { GOOGLE_ONBOARDING_QUERY_KEY } from "./constants/google-onboarding.constants";
import { useGoogleLogin } from "./hooks/use-google-login";
import { getGoogleOnboardingError } from "./utils/google-auth.utils";

export function GoogleOnboardingView() {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading, isAuthenticated, completeGoogleOnboarding } = useAuth();
  const google = useGoogleLogin();
  const attempt = useRef(false);
  const [submitError, setSubmitError] = useState<ReturnType<
    typeof getGoogleOnboardingError
  > | null>(null);
  const profile = useQuery({
    queryKey: GOOGLE_ONBOARDING_QUERY_KEY,
    queryFn: authService.getGoogleOnboardingProfile,
    enabled: !isLoading && !isAuthenticated,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const completion = useMutation({
    mutationFn: completeGoogleOnboarding,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && !attempt.current)
      router.replace("/admin/dashboard");
  }, [isLoading, isAuthenticated, router]);

  async function submit(input: CompleteGoogleOwnerOnboardingInput) {
    if (attempt.current || submitError?.terminal) return;
    attempt.current = true;
    setSubmitError(null);
    try {
      const result = await completion.mutateAsync(input);
      toast.success(t("google.success"));
      router.replace(getSafeReturnTo(result.return_to), {
        locale: result.locale === "en" ? "en" : "vi",
      });
    } catch (error) {
      attempt.current = false;
      setSubmitError(getGoogleOnboardingError(error));
    }
  }

  const error =
    submitError ??
    (profile.isError ? getGoogleOnboardingError(profile.error) : null);
  return (
    <AuthShell
      title={t("google.onboardingTitle")}
      description={t("google.onboardingDescription")}
    >
      <div className="space-y-4">
        {isLoading || isAuthenticated || profile.isPending ? (
          <p role="status" className="text-muted-foreground">
            {t("checkingSession")}
          </p>
        ) : (
          <>
            {error ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {t(error.key)}
              </p>
            ) : null}
            {profile.data && !error?.terminal ? (
              <GoogleBusinessForm
                profile={profile.data}
                locale={locale}
                isPending={completion.isPending}
                onSubmit={submit}
              />
            ) : null}
            {profile.isError && !error?.terminal ? (
              <Button
                className="w-full"
                variant="outline"
                disabled={profile.isFetching}
                onClick={() => void profile.refetch()}
              >
                {t("google.retry")}
              </Button>
            ) : null}
            {error?.terminal ? (
              <Button
                className="w-full"
                variant="outline"
                disabled={google.isRedirecting}
                onClick={google.startGoogleLogin}
              >
                {google.isRedirecting
                  ? t("google.redirecting")
                  : t("google.restart")}
              </Button>
            ) : null}
            <Button asChild variant="ghost" className="w-full">
              <Link href="/admin/login">{t("backToLogin")}</Link>
            </Button>
          </>
        )}
      </div>
    </AuthShell>
  );
}
