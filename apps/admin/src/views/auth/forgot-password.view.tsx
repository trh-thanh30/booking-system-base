"use client";

import { ArrowLeft, Mail, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { emailRequestSchema, type EmailRequestInput } from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { Link, useRouter } from "@/src/i18n/navigation";
import { authService } from "@/src/services/auth.service";
import { AuthShell } from "./components/auth-shell";

export function ForgotPasswordView() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<EmailRequestInput>({
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(input: EmailRequestInput) {
    const parsed = emailRequestSchema.safeParse(input);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path[0] as keyof EmailRequestInput | undefined;

      if (field && issue) {
        setError(field, { message: issue.message });
      }

      return;
    }

    try {
      const result = await authService.forgotPassword(parsed.data);
      toast.success(t("forgot.success"));
      router.replace(
        "/reset-password?sessionId=" + encodeURIComponent(result.sessionId),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("forgot.failed"));
    }
  }

  return (
    <AuthShell description={t("forgot.description")} title={t("forgot.title")}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          error={errors.email?.message}
          htmlFor="email"
          label={t("fields.email")}
        >
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              autoComplete="email"
              className="pl-9"
              id="email"
              type="email"
              {...register("email")}
            />
          </div>
        </FormField>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          <Send className="h-4 w-4" />
          {isSubmitting ? t("forgot.submitting") : t("forgot.submit")}
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
