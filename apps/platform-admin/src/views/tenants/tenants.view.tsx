"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe2, Plus, RefreshCw, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createTenantSchema,
  type CreateTenantInput,
  type TenantListItem,
} from "@repo/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
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
import { FormField, PageHeader, StatCard } from "@/src/components/common";
import { tenantsService } from "@/src/services/tenants.service";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function primaryDomain(tenant: TenantListItem) {
  return (
    tenant.domains.find((domain) => domain.is_primary)?.host ??
    tenant.domains[0]?.host ??
    "-"
  );
}

function CreateTenantDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const queryClient = useQueryClient();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CreateTenantInput>({
    defaultValues: {
      locale: "vi",
      name: "",
      primary_domain: "",
      settings: {},
      slug: "",
      timezone: "Asia/Ho_Chi_Minh",
    },
  });
  const createMutation = useMutation({
    mutationFn: tenantsService.createTenant,
    onSuccess() {
      reset({
        locale: "vi",
        name: "",
        primary_domain: "",
        settings: {},
        slug: "",
        timezone: "Asia/Ho_Chi_Minh",
      });
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      toast.success("Tenant created");
    },
    onError(error) {
      toast.error(
        error instanceof Error ? error.message : "Create tenant failed",
      );
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogTitle>Create tenant</DialogTitle>
        <DialogDescription>
          Add a business workspace. Owner invitation can be handled from the
          business admin user screen after creation.
        </DialogDescription>
        <form
          className="mt-4 space-y-4"
          onSubmit={handleSubmit((input) => {
            const parsed = createTenantSchema.safeParse({
              ...input,
              primary_domain: input.primary_domain?.trim() || undefined,
            });

            if (!parsed.success) {
              const issue = parsed.error.issues[0];
              const field = issue?.path[0] as keyof CreateTenantInput;
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
            htmlFor="tenant-name"
            label="Business name"
          >
            <Input id="tenant-name" {...register("name")} />
          </FormField>
          <FormField
            error={errors.slug?.message}
            htmlFor="tenant-slug"
            label="Slug"
          >
            <Input id="tenant-slug" {...register("slug")} />
          </FormField>
          <FormField
            error={errors.primary_domain?.message}
            htmlFor="tenant-domain"
            label="Primary domain"
          >
            <Input
              id="tenant-domain"
              placeholder="demo.localhost"
              {...register("primary_domain")}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              error={errors.timezone?.message}
              htmlFor="tenant-timezone"
              label="Timezone"
            >
              <Input id="tenant-timezone" {...register("timezone")} />
            </FormField>
            <FormField
              error={errors.locale?.message}
              htmlFor="tenant-locale"
              label="Locale"
            >
              <Input id="tenant-locale" {...register("locale")} />
            </FormField>
          </div>
          <Button
            className="w-full"
            disabled={createMutation.isPending}
            type="submit"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? "Creating tenant" : "Create tenant"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TenantsView() {
  const t = useTranslations("Platform.tenants");
  const [createOpen, setCreateOpen] = useState(false);
  const tenantsQuery = useQuery({
    queryFn: tenantsService.listTenants,
    queryKey: ["platform-tenants"],
  });
  const tenants = useMemo(() => tenantsQuery.data ?? [], [tenantsQuery.data]);
  const activeTenants = tenants.filter(
    (tenant) => tenant.status === "ACTIVE",
  ).length;
  const totalUsers = tenants.reduce(
    (total, tenant) => total + tenant.users_count,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={tenantsQuery.isFetching}
              onClick={() => void tenantsQuery.refetch()}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create tenant
            </Button>
          </div>
        }
        description={t("description")}
        eyebrow="Platform"
        title={t("title")}
      />
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          description="Registered workspaces"
          icon={Building2}
          title="Tenants"
          value={String(tenants.length)}
        />
        <StatCard
          description="Ready for admin login"
          icon={Globe2}
          title="Active tenants"
          value={String(activeTenants)}
        />
        <StatCard
          description="Across all tenants"
          icon={Users}
          title="Tenant users"
          value={String(totalUsers)}
        />
      </section>
      <Card>
        <CardContent className="p-0">
          {tenantsQuery.isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
              <Building2 className="h-8 w-8 text-slate-500" />
              <h2 className="mt-4 text-base font-semibold">No tenants yet</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Create the first business workspace or wait for public business
                signup to add one.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-xs text-slate-500">
                        {tenant.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tenant.status === "ACTIVE" ? "default" : "secondary"
                        }
                      >
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{primaryDomain(tenant)}</TableCell>
                    <TableCell>{tenant.users_count}</TableCell>
                    <TableCell>{formatDate(tenant.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <CreateTenantDialog onOpenChange={setCreateOpen} open={createOpen} />
    </div>
  );
}
