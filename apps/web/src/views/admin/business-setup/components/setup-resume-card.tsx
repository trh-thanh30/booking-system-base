"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent } from "@repo/ui";
import { useToast } from "@repo/hooks";
import { useRouter } from "@/src/i18n/navigation";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { useBusinessSetup } from "../hooks/use-business-setup";
import { getSetupDestination } from "../utils/business-setup.utils";
import { SetupResumeSkeleton } from "./setup-resume-skeleton";

export function SetupResumeCard() {
  const { user, query, queryKey, service, businessId } = useBusinessSetup();
  const t = useTranslations("BusinessSetup");
  const { toast } = useToast();
  const cache = useQueryClient();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: () => service!.resume(),
    onSuccess: (summary) => {
      cache.setQueryData(queryKey, summary);
      if (useAdminUiStore.getState().activeBusinessId === businessId)
        router.push(getSetupDestination("OWNER", summary));
    },
    onError: () => toast.error(t("errors.save")),
  });
  if (
    user?.role !== "OWNER" ||
    !businessId ||
    query.data?.status === "COMPLETED"
  )
    return null;
  if (query.isPending) return <SetupResumeSkeleton label={t("loading")} />;
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-body font-semibold">{t("resumeTitle")}</h2>
          <p className="mt-1 text-body text-muted-foreground">
            {query.isError
              ? t("errors.load")
              : t("progress", {
                  count: query.data?.completed_steps ?? 0,
                  total: 3,
                })}
          </p>
        </div>
        <Button
          disabled={mutation.isPending || query.isFetching}
          onClick={() =>
            query.isError ? void query.refetch() : mutation.mutate()
          }
          className="min-h-11 shrink-0 text-body"
        >
          {t(
            query.isError
              ? "retry"
              : query.data?.status === "NOT_STARTED"
                ? "start"
                : "resume",
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
