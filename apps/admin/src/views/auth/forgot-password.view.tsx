"use client";

import { ArrowLeft, Mail, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { emailRequestSchema, type EmailRequestInput } from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { Link } from "@/src/i18n/navigation";
import { authService } from "@/src/services/auth.service";
import { AuthShell } from "./components/auth-shell";

export function ForgotPasswordView() {
  const t = useTranslations("Auth");
  const [sessionId, setSessionId] = useState<string | null>(null);
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
      setSessionId(result.sessionId);
      toast.success(t("forgot.success"));
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
        {sessionId ? (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="font-medium">{t("forgot.sessionTitle")}</p>
            <p className="mt-1 break-all text-slate-500 dark:text-slate-400">
              {sessionId}
            </p>
          </div>
        ) : null}
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
