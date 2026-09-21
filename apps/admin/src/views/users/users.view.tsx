"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createInvitationSchema,
  PERMISSIONS,
  type CreateInvitationInput,
  type UserSummary,
} from "@repo/shared";
import {
  Avatar,
  AvatarFallback,
  Badge,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { PageHeader } from "@/src/components/common/page-header";
import { StatsCard } from "@/src/components/common/stats-card";
import { useAuth } from "@/src/app/providers";
import { authService } from "@/src/services/auth.service";
import type { CreatedInvitation } from "@/src/services/auth.service";
import { usersService } from "@/src/services/users.service";

function getInitials(user: UserSummary) {
  const name = user.full_name ?? user.username;

  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.email.slice(0, 2).toUpperCase()
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function InviteUserDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
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
    const url = `${window.location.origin}/${locale}/invitations/${createdInvitation.token}`;
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
            <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-sm font-medium">{createdInvitation.email}</p>
              <p className="mt-1 break-all text-xs leading-5 text-slate-500 dark:text-slate-400">
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
            >
              <Input id="invite-email" type="email" {...register("email")} />
            </FormField>
            <FormField htmlFor="invite-role" label="Role">
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
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

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          canInvite ? (
            <Button onClick={() => setInviteOpen(true)}>
              <Plus className="h-4 w-4" />
              Invite user
            </Button>
          ) : null
        }
        description="Manage tenant users and invite staff into the admin workspace."
        eyebrow="Access"
        title="Users"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard
          description="Can access this tenant"
          icon={Users}
          title="Total users"
          trend="Live"
          value={String(users.length)}
        />
        <StatsCard
          description="Currently enabled"
          icon={UserCheck}
          title="Active users"
          trend={`${activeUsers}/${users.length || 0}`}
          value={String(activeUsers)}
        />
        <StatsCard
          description="Admin role"
          icon={ShieldCheck}
          title="Privileged users"
          trend="Guarded"
          value={String(privilegedUsers)}
        />
      </section>

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
            <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-50">
                {usersQuery.isError ? "Unable to load users" : "No users found"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {usersQuery.isError
                  ? "The users API could not be loaded. Check your permission or try again."
                  : "No users are visible for this tenant yet."}
              </p>
              {!usersQuery.isError && canInvite ? (
                <Button className="mt-4" onClick={() => setInviteOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Invite user
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead aria-label="Actions" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-950 dark:text-slate-50">
                                {user.full_name ?? user.username}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "ACTIVE" ? "success" : "warning"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-label={`Open actions for ${user.email}`}
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem disabled>
                                Edit profile
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                Manage permissions
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteUserDialog onOpenChange={setInviteOpen} open={inviteOpen} />
    </div>
  );
}
