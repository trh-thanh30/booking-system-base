"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@repo/hooks";
import {
  createInvitationSchema,
  PERMISSIONS,
  type CreateInvitationInput,
} from "@repo/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Skeleton,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import {
  AdminPage,
  AdminPageHeader,
  AdminStatsGrid,
} from "@/src/components/common/admin/admin-page";
import { AdminStatsCard } from "@/src/components/common/admin/admin-stats-card";
import { AdminDataTable } from "@/src/components/common/admin/admin-data-table";
import { StatePanel } from "@/src/components/common/state-panel";
import { useAuth } from "@/src/app/providers/admin";
import { authService } from "@/src/services/admin/auth.service";
import type { CreatedInvitation } from "@/src/services/admin/auth.service";
import { usersService } from "@/src/services/admin/users.service";
import { getUserColumns } from "./columns/users.columns";

function InviteUserDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createdInvitation, setCreatedInvitation] =
    useState<CreatedInvitation | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CreateInvitationInput>({
    defaultValues: {
      email: "",
      permission_keys: [],
      role: "STAFF",
    },
  });
  const createInvitationMutation = useMutation({
    mutationFn: authService.createInvitation,
    onSuccess(invitation) {
      setCreatedInvitation(invitation);
      reset({ email: "", permission_keys: [], role: "STAFF" });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Invitation created");
    },
    onError(error) {
      toast.error(error instanceof Error ? error.message : "Invite failed");
    },
  });

  async function copyInvitationLink() {
    if (!createdInvitation) {
      return;
    }

    const locale =
      window.location.pathname.split("/").filter(Boolean)[0] || "vi";
    const url = `${window.location.origin}/${locale}/admin/invitations/${createdInvitation.token}`;
    await navigator.clipboard.writeText(url);
    toast.success("Invitation link copied");
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setCreatedInvitation(null);
        }
      }}
      open={open}
    >
      <DialogContent>
        <DialogTitle>Invite user</DialogTitle>
        <DialogDescription>
          Create an invitation for staff to join this tenant workspace.
        </DialogDescription>
        {createdInvitation ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="text-sm font-medium">{createdInvitation.email}</p>
              <p className="mt-1 break-all text-xs leading-5 text-muted-foreground">
                {createdInvitation.token}
              </p>
            </div>
            <Button className="w-full" onClick={copyInvitationLink}>
              <Copy className="h-4 w-4" />
              Copy invitation link
            </Button>
          </div>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={handleSubmit((input) => {
              const parsed = createInvitationSchema.safeParse({
                ...input,
                permission_keys: input.permission_keys ?? [],
              });

              if (!parsed.success) {
                const issue = parsed.error.issues[0];
                const field = issue?.path[0] as
                  | keyof CreateInvitationInput
                  | undefined;

                if (field && issue) {
                  setError(field, { message: issue.message });
                }

                return;
              }

              createInvitationMutation.mutate(parsed.data);
            })}
          >
            <FormField
              error={errors.email?.message}
              htmlFor="invite-email"
              label="Email"
              required
            >
              <Input id="invite-email" type="email" {...register("email")} />
            </FormField>
            <FormField htmlFor="invite-role" label="Role" required>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                id="invite-role"
                {...register("role")}
              >
                <option value="STAFF">STAFF</option>
                <option value="OWNER">OWNER</option>
              </select>
            </FormField>
            <Button
              className="w-full"
              disabled={createInvitationMutation.isPending}
              type="submit"
            >
              <Plus className="h-4 w-4" />
              {createInvitationMutation.isPending
                ? "Creating invitation"
                : "Create invitation"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function UsersView() {
  const { can } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const usersQuery = useQuery({
    queryFn: usersService.listUsers,
    queryKey: ["users"],
  });
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
  const privilegedUsers = users.filter((user) => user.role === "OWNER").length;
  const canInvite = can(PERMISSIONS.STAFF.INVITE);
  const columns = getUserColumns();

  return (
    <AdminPage>
      <AdminPageHeader
        actions={
          canInvite ? (
            <Button onClick={() => setInviteOpen(true)}>
              <Plus className="size-4" />
              Invite user
            </Button>
          ) : null
        }
        description="Manage tenant users and invite staff into the admin workspace."
        eyebrow="Access"
        title="Users"
      />

      <AdminStatsGrid className="xl:grid-cols-3">
        <AdminStatsCard
          description="Can access this tenant"
          icon={Users}
          title="Total users"
          trend="Live"
          value={String(users.length)}
        />
        <AdminStatsCard
          description="Currently enabled"
          icon={UserCheck}
          title="Active users"
          trend={`${activeUsers}/${users.length || 0}`}
          value={String(activeUsers)}
        />
        <AdminStatsCard
          description="Admin role"
          icon={ShieldCheck}
          title="Privileged users"
          trend="Guarded"
          value={String(privilegedUsers)}
        />
      </AdminStatsGrid>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>User directory</CardTitle>
            <CardDescription>
              Users are loaded from the tenant-scoped API.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : usersQuery.isError || users.length === 0 ? (
            <StatePanel
              action={
                !usersQuery.isError && canInvite ? (
                  <Button className="mt-4" onClick={() => setInviteOpen(true)}>
                    <Plus className="size-4" />
                    Invite user
                  </Button>
                ) : usersQuery.isError ? (
                  <Button
                    onClick={() => void usersQuery.refetch()}
                    variant="outline"
                  >
                    Retry
                  </Button>
                ) : null
              }
              description={
                usersQuery.isError
                  ? "The users API could not be loaded. Check your permission or try again."
                  : "No users are visible for this tenant yet."
              }
              icon={Users}
              title={
                usersQuery.isError ? "Unable to load users" : "No users found"
              }
            />
          ) : (
            <AdminDataTable
              ariaLabel="Tenant users"
              columns={columns}
              data={users}
              getRowId={(user) => user.id}
            />
          )}
        </CardContent>
      </Card>

      <InviteUserDialog onOpenChange={setInviteOpen} open={inviteOpen} />
    </AdminPage>
  );
}
