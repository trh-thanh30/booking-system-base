"use client";

import { useEffect } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { useBusinessSetup } from "./hooks/use-business-setup";
import { getSetupEntryDestination } from "./utils/business-setup.utils";
import { SetupLoadState } from "./components/setup-load-state";

export function BusinessSetupEntryView() {
  const { query, user, businessId, isLoading } = useBusinessSetup();
  const router = useRouter();
  const destination = user
    ? getSetupEntryDestination(user.role, query.data, query)
    : null;
  useEffect(() => {
    if (isLoading || !user) return;
    if (destination) router.replace(destination);
  }, [isLoading, user, destination, router]);
  return (
    <SetupLoadState
      noBusiness={!isLoading && user?.role === "OWNER" && !businessId}
      error={query.isError}
      busy={query.isFetching}
      onRetry={() => void query.refetch()}
    />
  );
}
