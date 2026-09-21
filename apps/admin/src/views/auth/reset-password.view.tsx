"use client";

import { ArrowLeft, KeyRound, LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { Link, useRouter } from "@/src/i18n/navigation";
import { authService } from "@/src/services/auth.service";
import { AuthShell } from "./components/auth-shell";

export function ResetPasswordView() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<ResetPasswordInput>({
    defaultValues: {
      code: "",
      confirmPassword: "",
      password: "",
      sessionId: "",
    },
  });

  async function onSubmit(input: ResetPasswordInput) {
    const parsed = resetPasswordSchema.safeParse(input);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0] as keyof ResetPasswordInput | undefined;

      if (field && issue) {
        setError(field, { message: issue.message });
      }

      return;
    }

    try {
      await authService.resetPassword(parsed.data);
      toast.success(t("reset.success"));
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("reset.failed"));
    }
  }

  return (
    <AuthShell description={t("reset.description")} title={t("reset.title")}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          error={errors.sessionId?.message}
          htmlFor="sessionId"
          label={t("fields.sessionId")}
        >
          <Input id="sessionId" {...register("sessionId")} />
        </FormField>
        <FormField
          error={errors.code?.message}
          htmlFor="code"
          label={t("fields.code")}
        >
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" id="code" {...register("code")} />
          </div>
        </FormField>
        <FormField
          error={errors.password?.message}
          htmlFor="password"
          label={t("fields.password")}
        >
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoComplete="new-password"
              className="pl-9"
              id="password"
              type="password"
              {...register("password")}
            />
          </div>
        </FormField>
        <FormField
          error={errors.confirmPassword?.message}
          htmlFor="confirmPassword"
          label={t("fields.confirmPassword")}
        >
          <Input
            autoComplete="new-password"
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
          />
        </FormField>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          <LockKeyhole className="h-4 w-4" />
          {isSubmitting ? t("reset.submitting") : t("reset.submit")}
        </Button>
        <Button asChild className="w-full" type="button" variant="ghost">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            {t("backToLogin")}
          </Link>
        </Button>
      </form>
    </AuthShell>
  );
}
