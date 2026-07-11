"use client";

import { Lock, LogIn, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { useAuth } from "@/src/app/providers";
import { Link, useRouter } from "@/src/i18n/navigation";
import { AuthShell } from "./components/auth-shell";

export function LoginView() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { login } = useAuth();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInput>({
    defaultValues: {
      password: "",
      usernameOrEmail: "",
    },
  });

  async function onSubmit(input: LoginInput) {
    const parsed = loginSchema.safeParse(input);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0] as keyof LoginInput | undefined;

      if (field && issue) {
        setError(field, { message: issue.message });
      }

      return;
    }

    try {
      await login(parsed.data);
      toast.success(t("login.success"));
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("login.failed"));
    }
  }

  return (
    <AuthShell description={t("login.description")} title={t("login.title")}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          error={errors.usernameOrEmail?.message}
          htmlFor="usernameOrEmail"
          label={t("fields.usernameOrEmail")}
        >
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoComplete="username"
              className="pl-9"
              id="usernameOrEmail"
              {...register("usernameOrEmail")}
            />
          </div>
        </FormField>
        <FormField
          error={errors.password?.message}
          htmlFor="password"
          label={t("fields.password")}
        >
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoComplete="current-password"
              className="pl-9"
              id="password"
              type="password"
              {...register("password")}
            />
          </div>
        </FormField>
        <div className="flex items-center justify-between">
          <Link
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
            href="/forgot-password"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          <LogIn className="h-4 w-4" />
          {isSubmitting ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
