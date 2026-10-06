"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@repo/hooks";
import type { CompleteGoogleOwnerOnboardingInput } from "@repo/shared";
import { Button } from "@repo/ui";
import { GoogleIcon } from "@/src/components/common";
import { useAuth } from "@/src/app/providers/admin";
import { Link, useRouter } from "@/src/i18n/navigation";
import { getSafeReturnTo } from "@/src/lib/admin/auth-routing";
import { authService } from "@/src/services/admin/auth.service";
import { AuthLoadingState, AuthShell, GoogleBusinessForm } from "./components";
import { GOOGLE_ONBOARDING_QUERY_KEY } from "./constants/google-onboarding.constants";
import { useGoogleLogin } from "@/src/hooks/use-google-login";
import { getGoogleOnboardingError } from "./utils/google-auth.utils";

export function GoogleOnboardingView() {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading, isAuthenticated, completeGoogleOnboarding } = useAuth();
  const google = useGoogleLogin();
  const attempt = useRef(false);
  const clearDraftRef = useRef<() => void>(() => undefined);
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
      clearDraftRef.current();
      toast.success(t("google.success"));
      router.replace(getSafeReturnTo(result.return_to), {
        locale: result.locale === "en" ? "en" : "vi",
      });
    } catch (error) {
      attempt.current = false;
      const result = getGoogleOnboardingError(error);
      setSubmitError(result);
      toast.error(t(result.key));
    }
  }

  const profileError = profile.isError
    ? getGoogleOnboardingError(profile.error)
    : null;
  const error = submitError ?? profileError;
  const handleDraftStateChange = useCallback(
    (hasDraft: boolean, clearDraft: () => void) => {
      void hasDraft;
      clearDraftRef.current = clearDraft;
    },
    [],
  );
  useEffect(() => {
    if (!profile.isError) return;
    const currentError = getGoogleOnboardingError(profile.error);
    toast.error(t(currentError.key), {
      id: "google-onboarding-profile-error",
    });
  }, [profile.error, profile.errorUpdatedAt, profile.isError, t, toast]);
  return (
    <AuthShell
      title={t("google.onboardingTitle")}
      description={t("google.onboardingDescription")}
    >
      <div className="space-y-4">
        {isLoading || isAuthenticated || profile.isPending ? (
          <AuthLoadingState
            title={t("checkingSession")}
            description={t("checkingSessionDescription")}
          />
        ) : (
          <>
            {profile.data && !error?.terminal ? (
              <GoogleBusinessForm
                profile={profile.data}
                locale={locale}
                isPending={completion.isPending}
                onSubmit={submit}
                onDraftStateChange={handleDraftStateChange}
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
                <GoogleIcon />
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
