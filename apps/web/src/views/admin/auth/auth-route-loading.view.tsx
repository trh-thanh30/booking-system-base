import { useTranslations } from "next-intl";
import { Skeleton } from "@repo/ui";
import { AuthenticationLayout } from "@/src/components/layout";

export function AuthRouteLoadingView() {
  const t = useTranslations("Auth");
  return (
    <AuthenticationLayout
      title={t("checkingSession")}
      description={t("checkingSessionDescription")}
    >
      <div role="status" aria-busy="true" className="space-y-5">
        <span className="sr-only">{t("checkingSession")}</span>
        <div aria-hidden="true" className="space-y-5">
          {[0, 1].map((field) => (
            <div key={field} className="space-y-2">
              <Skeleton className="h-4 w-32 motion-reduce:animate-none" />
              <Skeleton className="h-13 w-full motion-reduce:animate-none" />
            </div>
          ))}
          <Skeleton className="h-13 w-full rounded-full motion-reduce:animate-none" />
          <Skeleton className="h-13 w-full rounded-full motion-reduce:animate-none" />
        </div>
      </div>
    </AuthenticationLayout>
  );
}
