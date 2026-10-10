import type {
  BusinessSetupSummary,
  CreateServiceInput,
  ServiceDetail,
} from "@repo/shared";

export function setupQueryKey(
  tenantId: string | null | undefined,
  businessId: string | null,
) {
  return ["admin", "business-setup", tenantId, businessId] as const;
}

export function getSetupDestination(
  role: string,
  summary: Pick<BusinessSetupSummary, "status">,
) {
  return role === "OWNER" &&
    (summary.status === "NOT_STARTED" || summary.status === "IN_PROGRESS")
    ? "/admin/business-setup"
    : "/admin/dashboard";
}

export function getSetupEntryDestination(
  role: string,
  summary: Pick<BusinessSetupSummary, "status"> | undefined,
  query: {
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isError: boolean;
  },
) {
  if (role !== "OWNER") return "/admin/dashboard";
  if (
    !summary ||
    !query.isFetchedAfterMount ||
    query.isFetching ||
    query.isError
  )
    return null;
  return getSetupDestination(role, summary);
}

export function getSetupViewDestination(
  role: string,
  summary: Pick<BusinessSetupSummary, "status"> | undefined,
  query: Parameters<typeof getSetupEntryDestination>[2],
  hasAcceptedSummary: boolean,
) {
  return hasAcceptedSummary && summary
    ? getSetupDestination(role, summary)
    : getSetupEntryDestination(role, summary, query);
}

export async function completeFirstService(
  api: {
    getSummary: () => Promise<BusinessSetupSummary>;
    createService: (input: CreateServiceInput) => Promise<ServiceDetail>;
  },
  input: CreateServiceInput | null,
) {
  const current = await api.getSummary();
  if (current.steps.first_service) return current;
  if (!input) throw new Error("FIRST_SERVICE_REQUIRED");
  await api.createService({ ...input, status: "ACTIVE" });
  return api.getSummary();
}
