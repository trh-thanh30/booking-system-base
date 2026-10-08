"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, RefreshCw, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@repo/hooks";
import {
  createBusinessSchema,
  type BusinessContext,
  type CreateBusinessInput,
} from "@repo/shared";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import {
  AdminPage,
  AdminPageHeader,
  AdminStatsGrid,
} from "@/src/components/common/admin/admin-page";
import { AdminStatsCard } from "@/src/components/common/admin/admin-stats-card";
import { AdminTableContainer } from "@/src/components/common/admin/admin-table-container";
import { StatePanel } from "@/src/components/common/state-panel";
import { businessesService } from "@/src/services/admin/businesses.service";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CreateBusinessDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CreateBusinessInput>({
    defaultValues: {
      locale: "vi",
      name: "",
      settings: {},
      slug: "",
      timezone: "Asia/Ho_Chi_Minh",
    },
  });
  const createMutation = useMutation({
    mutationFn: businessesService.createBusiness,
    onSuccess() {
      reset({
        locale: "vi",
        name: "",
        settings: {},
        slug: "",
        timezone: "Asia/Ho_Chi_Minh",
      });
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast.success("Business created");
    },
    onError(error) {
      toast.error(
        error instanceof Error ? error.message : "Create business failed",
      );
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogTitle>Create business</DialogTitle>
        <DialogDescription>
          Add a business, branch, or brand under the current tenant account.
        </DialogDescription>
        <form
          className="mt-4 space-y-4"
          onSubmit={handleSubmit((input) => {
            const parsed = createBusinessSchema.safeParse(input);

            if (!parsed.success) {
              const issue = parsed.error.issues[0];
              const field = issue?.path[0] as keyof CreateBusinessInput;
              if (field && issue) {
                setError(field, { message: issue.message });
              }
              return;
            }

            createMutation.mutate(parsed.data);
          })}
        >
          <FormField
            error={errors.name?.message}
            htmlFor="business-name"
            label="Business name"
            required
          >
            <Input id="business-name" {...register("name")} />
          </FormField>
          <FormField
            error={errors.slug?.message}
            htmlFor="business-slug"
            label="Slug"
            required
          >
            <Input id="business-slug" {...register("slug")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              error={errors.timezone?.message}
              htmlFor="business-timezone"
              label="Timezone"
            >
              <Input id="business-timezone" {...register("timezone")} />
            </FormField>
            <FormField
              error={errors.locale?.message}
              htmlFor="business-locale"
              label="Locale"
            >
              <Input id="business-locale" {...register("locale")} />
            </FormField>
          </div>
          <Button
            className="w-full"
            disabled={createMutation.isPending}
            type="submit"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? "Creating business" : "Create business"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BusinessesView() {
  const [createOpen, setCreateOpen] = useState(false);
  const businessesQuery = useQuery({
    queryFn: businessesService.listBusinesses,
    queryKey: ["businesses"],
  });
  const businesses = useMemo(
    () => businessesQuery.data ?? [],
    [businessesQuery.data],
  );
  const activeBusinesses = businesses.filter(
    (business) => business.status === "ACTIVE",
  ).length;
  const defaultBusiness = businesses.find((business) => business.is_default);

  return (
    <AdminPage>
      <AdminPageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={businessesQuery.isFetching}
              onClick={() => void businessesQuery.refetch()}
              variant="outline"
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create business
            </Button>
          </div>
        }
        description="Manage branches, brands, or locations inside this tenant account."
        eyebrow="Tenant"
        title="Businesses"
      />
      <AdminStatsGrid className="xl:grid-cols-3">
        <AdminStatsCard
          description="Operational units"
          icon={Store}
          title="Businesses"
          loading={businessesQuery.isPending}
          trend="Tenant scoped"
          value={String(businesses.length)}
        />
        <AdminStatsCard
          description="Ready for booking setup"
          icon={Building2}
          title="Active"
          loading={businessesQuery.isPending}
          trend={`${activeBusinesses}/${businesses.length || 0}`}
          value={String(activeBusinesses)}
        />
        <AdminStatsCard
          description="Initial business for this tenant"
          icon={Store}
          title="Default"
          loading={businessesQuery.isPending}
          trend={defaultBusiness?.slug ?? "-"}
          value={defaultBusiness?.name ?? "-"}
        />
      </AdminStatsGrid>
      {businessesQuery.isLoading ? (
        <AdminTableContainer>
          <div className="space-y-3 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </AdminTableContainer>
      ) : businessesQuery.isError || businesses.length === 0 ? (
        <StatePanel
          action={
            businessesQuery.isError ? (
              <Button
                onClick={() => void businessesQuery.refetch()}
                variant="outline"
              >
                Retry
              </Button>
            ) : (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Create business
              </Button>
            )
          }
          description={
            businessesQuery.isError
              ? "The businesses API could not be loaded. Check your connection and try again."
              : "Create the first branch, brand, or location for this tenant."
          }
          icon={Store}
          title={
            businessesQuery.isError
              ? "Unable to load businesses"
              : "No businesses yet"
          }
        />
      ) : (
        <AdminTableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business: BusinessContext) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{business.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {business.slug}
                        </div>
                      </div>
                      {business.is_default ? (
                        <Badge variant="secondary">Default</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        business.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {business.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{business.timezone}</TableCell>
                  <TableCell>{business.locale}</TableCell>
                  <TableCell>{formatDate(business.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableContainer>
      )}
      <CreateBusinessDialog onOpenChange={setCreateOpen} open={createOpen} />
    </AdminPage>
  );
}
