"use client";

import { useEffect } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { useBusinessSetup } from "./hooks/use-business-setup";
import { SetupLoadState } from "./components/setup-load-state";
import { BusinessSetupTour } from "./components/business-setup-tour";
import { getSetupEntryDestination } from "./utils/business-setup.utils";

export function BusinessSetupView() {
  const { query, queryKey, service, user, businessId, isLoading } =
    useBusinessSetup();
  const router = useRouter();
  const destination = user
    ? getSetupEntryDestination(user.role, query.data, query)
    : null;
  const finished = destination === "/admin/dashboard";
  useEffect(() => {
    if (!isLoading && user && (user.role !== "OWNER" || finished))
      router.replace("/admin/dashboard");
  }, [isLoading, user, finished, router]);
  if (isLoading || !user || user.role !== "OWNER" || finished)
    return <SetupLoadState />;
  if (!businessId || !service) return <SetupLoadState noBusiness />;
  if (!query.data || query.isError || !destination)
    return (
      <SetupLoadState
        error={query.isError}
        busy={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    );
  return (
    <BusinessSetupTour
      key={businessId}
      businessId={businessId}
      summary={query.data}
      queryKey={queryKey}
      service={service}
    />
  );
}
