"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, KeyRound, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  acceptInvitationSchema,
  type AcceptInvitationInput,
} from "@repo/shared";
import { Badge, Button, Input, Skeleton } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { StatePanel } from "@/src/components/common/state-panel";
import { Link, useRouter } from "@/src/i18n/navigation";
import { authService } from "@/src/services/auth.service";
import { AuthShell } from "./components/auth-shell";

export function AcceptInvitationView({ token }: { token: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const invitationQuery = useQuery({
    queryFn: () => authService.getInvitation(token),
    queryKey: ["auth", "invitation", token],
  });
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<AcceptInvitationInput>({
    defaultValues: {
      confirmPassword: "",
      full_name: "",
      password: "",
      token,
      username: "",
    },
  });

  async function onSubmit(input: AcceptInvitationInput) {
    const parsed = acceptInvitationSchema.safeParse(input);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0] as keyof AcceptInvitationInput | undefined;

      if (field && issue) {
        setError(field, { message: issue.message });
      }

      return;
    }

    try {
      await authService.acceptInvitation(parsed.data);
      toast.success(t("invitation.success"));
      router.replace("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("invitation.failed"),
      );
    }
  }

  if (invitationQuery.isLoading) {
    return (
      <AuthShell
        description={t("invitation.description")}
        title={t("invitation.title")}
      >
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </AuthShell>
    );
  }

  if (invitationQuery.isError || !invitationQuery.data) {
    return (
      <AuthShell
        description={t("invitation.description")}
        title={t("invitation.title")}
      >
        <StatePanel
          action={
            <Button asChild variant="secondary">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                {t("backToLogin")}
              </Link>
            </Button>
          }
          description={t("invitation.notFoundDescription")}
          icon={KeyRound}
          title={t("invitation.notFoundTitle")}
        />
      </AuthShell>
    );
  }

  const invitation = invitationQuery.data;
  const disabled = Boolean(invitation.accepted_at) || invitation.is_expired;

  return (
    <AuthShell
      description={t("invitation.description")}
      title={t("invitation.title")}
    >
      <div className="mb-5 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{invitation.email}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {invitation.tenant.name}
            </p>
          </div>
          <Badge variant={disabled ? "warning" : "success"}>
            {disabled ? t("invitation.unavailable") : invitation.role}
          </Badge>
        </div>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register("token")} />
        <FormField
          error={errors.username?.message}
          htmlFor="username"
          label={t("fields.username")}
        >
          <Input
            autoComplete="username"
            disabled={disabled}
            id="username"
            {...register("username")}
          />
        </FormField>
        <FormField
          error={errors.full_name?.message}
          htmlFor="full_name"
          label={t("fields.fullName")}
        >
          <Input
            disabled={disabled}
            id="full_name"
            {...register("full_name")}
          />
        </FormField>
        <FormField
          error={errors.password?.message}
          htmlFor="password"
          label={t("fields.password")}
        >
          <Input
            autoComplete="new-password"
            disabled={disabled}
            id="password"
            type="password"
            {...register("password")}
          />
        </FormField>
        <FormField
          error={errors.confirmPassword?.message}
          htmlFor="confirmPassword"
          label={t("fields.confirmPassword")}
        >
          <Input
            autoComplete="new-password"
            disabled={disabled}
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
          />
        </FormField>
        <Button
          className="w-full"
          disabled={disabled || isSubmitting}
          type="submit"
        >
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? t("invitation.submitting") : t("invitation.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
