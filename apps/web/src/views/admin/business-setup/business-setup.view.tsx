"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { useBusinessSetup } from "./hooks/use-business-setup";
import { SetupLoadState } from "./components/setup-load-state";
import { BusinessSetupTour } from "./components/business-setup-tour";
import { BusinessSetupCompleteView } from "./business-setup-complete.view";
import {
  getSetupEntryDestination,
  getSetupViewDestination,
} from "./utils/business-setup.utils";

export function BusinessSetupView() {
  const { query, queryKey, service, user, businessId, isLoading } =
    useBusinessSetup();
  const router = useRouter();
  const [readyBusinessId, setReadyBusinessId] = useState<string | null>(null);
  const freshDestination = user
    ? getSetupEntryDestination(user.role, query.data, query)
    : null;
  useEffect(() => {
    if (freshDestination && businessId) setReadyBusinessId(businessId);
  }, [freshDestination, businessId]);
  const destination = user
    ? getSetupViewDestination(
        user.role,
        query.data,
        query,
        readyBusinessId === businessId && Boolean(businessId),
      )
    : null;
  const completed =
    user?.role === "OWNER" &&
    destination === "/admin/dashboard" &&
    query.data?.status === "COMPLETED";
  const finished = destination === "/admin/dashboard" && !completed;
  useEffect(() => {
    if (!isLoading && user && (user.role !== "OWNER" || finished))
      router.replace("/admin/dashboard");
  }, [isLoading, user, finished, router]);
  if (isLoading || !user || user.role !== "OWNER" || finished)
    return <SetupLoadState />;
  if (!businessId || !service) return <SetupLoadState noBusiness />;
  if (!query.data || !destination)
    return (
      <SetupLoadState
        error={query.isError}
        busy={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    );
  if (completed) {
    return (
      <BusinessSetupCompleteView
        key={businessId}
        businessName={
          user.businesses.find((business) => business.id === businessId)
            ?.name ?? ""
        }
        templateId={query.data.selected_template_id}
      />
    );
  }
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
