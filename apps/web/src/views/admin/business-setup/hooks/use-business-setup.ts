"use client";

import { useAuth } from "@/src/app/providers/admin";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { createBusinessSettingsService } from "@/src/services/admin/business-settings.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect } from "react";
import { useToast } from "@repo/hooks";
import { useTranslations } from "next-intl";
import { setupQueryKey } from "../utils/business-setup.utils";

export function useBusinessSetup() {
  const { user, isLoading } = useAuth();
  const businessId = useAdminUiStore((state) => state.activeBusinessId);
  const service = useMemo(
    () => (businessId ? createBusinessSettingsService(businessId) : null),
    [businessId],
  );
  const queryKey = setupQueryKey(user?.tenant_id, businessId);
  const query = useQuery({
    queryKey,
    queryFn: () => service!.getSummary(),
    enabled: !isLoading && user?.role === "OWNER" && Boolean(service),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { toast } = useToast();
  const t = useTranslations("BusinessSetup");
  useEffect(() => {
    if (query.isError)
      toast.error(t("errors.load"), {
        id: `business-setup-load-${businessId}`,
      });
  }, [businessId, query.isError, query.errorUpdatedAt, t, toast]);
  return { query, queryKey, service, businessId, user, isLoading };
}
