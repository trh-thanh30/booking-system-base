"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@repo/hooks";
import { HttpClientError, type CompleteOwnerBusinessInput } from "@repo/shared";
import { Button } from "@repo/ui";
import { Link, useRouter } from "@/src/i18n/navigation";
import { authService } from "@/src/services/admin/auth.service";
import { AuthShell, BusinessOnboardingForm } from "./components";

export function OwnerOnboardingView() {
  const locale = useLocale();
  const t = useTranslations("AuthJourney");
  const router = useRouter();
  const { toast } = useToast();
  const submitted = useRef(false);
  const [expired, setExpired] = useState(false);
  const profile = useQuery({
    queryKey: ["owner-onboarding-profile"],
    queryFn: authService.getOwnerOnboardingProfile,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const completion = useMutation({
    mutationFn: authService.completeOwnerOnboarding,
    retry: false,
  });
  async function submit(input: CompleteOwnerBusinessInput) {
    if (submitted.current) return;
    submitted.current = true;
    try {
      await completion.mutateAsync(input);
      toast.success(t("businessCreated"));
      router.replace("/admin/login");
    } catch (failure) {
      submitted.current = false;
      const sessionExpired =
        failure instanceof HttpClientError && failure.status === 401;
      setExpired(sessionExpired);
      toast.error(
        t(
          sessionExpired
            ? "sessionExpired"
            : failure instanceof HttpClientError && failure.status === 409
              ? "detailsConflict"
              : "completionFailed",
        ),
      );
    }
  }
  const terminal =
    expired ||
    (profile.error instanceof HttpClientError && profile.error.status === 401);
  const profileErrorKey = profile.isError
    ? terminal
      ? "sessionExpired"
      : "completionFailed"
    : null;
  useEffect(() => {
    if (!profileErrorKey) return;
    toast.error(t(profileErrorKey), {
      id: "owner-onboarding-profile-error",
    });
  }, [profile.errorUpdatedAt, profileErrorKey, t, toast]);
  return (
    <AuthShell
      title={t("businessTitle")}
      description={t("businessDescription")}
    >
      <div className="space-y-5">
        {profile.isPending ? <p role="status">{t("loading")}</p> : null}
        {profile.data && !terminal ? (
          <BusinessOnboardingForm
            profile={profile.data}
            locale={locale}
            isPending={completion.isPending}
            onSubmit={submit}
          />
        ) : null}
        {profile.isError && !terminal ? (
          <Button
            type="button"
            variant="outline"
            disabled={profile.isFetching}
            onClick={() => void profile.refetch()}
          >
            {t("retry")}
          </Button>
        ) : null}
        <Button asChild variant="ghost" className="w-full">
          <Link href="/admin/login">{t("backToLogin")}</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
