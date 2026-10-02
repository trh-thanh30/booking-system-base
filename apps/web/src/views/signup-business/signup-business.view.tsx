"use client";

import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Building2, CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@repo/hooks";
import { HttpClientError, type RegisterOwnerInput } from "@repo/shared";
import { Button, Input } from "@repo/ui";
import { Link } from "@/src/i18n/navigation";
import { authService } from "@/src/services/auth.service";
import { RegistrationField as Field } from "./components/registration-field";
import {
  getAdminVerificationUrl,
  parseOwnerRegistration,
} from "./utils/registration.utils";

export function SignupBusinessView() {
  const { toast } = useToast();
  const locale = useLocale();
  const t = useTranslations("SignupBusiness");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterOwnerInput>({
    defaultValues: {
      default_business_name: "",
      default_business_slug: "",
      locale,
      name: "",
      owner: {
        confirmPassword: "",
        email: "",
        full_name: "",
        password: "",
        phone: "",
        username: "",
      },
      primary_domain: "",
      settings: {},
      slug: "",
      timezone: "Asia/Ho_Chi_Minh",
    },
  });
  const signupMutation = useMutation({
    retry: false,
    async mutationFn(input: RegisterOwnerInput) {
      const baseUrl =
        process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3002";
      // Validate configuration before creating an account to avoid a duplicate registration after a broken handoff.
      getAdminVerificationUrl(baseUrl, locale, "");
      const result = await authService.registerOwner(input);
      return getAdminVerificationUrl(baseUrl, locale, result.sessionId);
    },
    onSuccess(url) {
      setVerificationUrl(url);
      toast.success(t("success"));
      window.location.assign(url);
    },
    onError(error) {
      setSubmitError(
        t(
          error instanceof HttpClientError && error.status === 429
            ? "rateLimited"
            : "failed",
        ),
      );
    },
  });

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Link>
          </Button>
        </div>
        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase text-muted-foreground">
                {t("eyebrow")}
              </p>
              <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-normal sm:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                {t("description")}
              </p>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-md border border-border bg-card p-4">
                {t("tenantIsolated")}
              </div>
              <div className="rounded-md border border-border bg-card p-4">
                {t("ownerReady")}
              </div>
              <div className="rounded-md border border-border bg-card p-4">
                {t("verification")}
              </div>
            </div>
          </section>
          <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
            {verificationUrl ? (
              <div className="flex min-h-96 flex-col justify-center text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
                <h2 className="mt-4 text-xl font-semibold">
                  {t("checkEmail")}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {t("successDescription")}
                </p>
                <Button asChild className="mx-auto mt-6">
                  <a href={verificationUrl}>
                    {t("verifyEmail")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={handleSubmit((input) => {
                  setSubmitError(null);
                  const parsed = parseOwnerRegistration(input);

                  if (!parsed.success) {
                    const issue = parsed.error.issues[0];
                    if (!issue) {
                      return;
                    }
                    const [root, child] = issue?.path ?? [];
                    if (root === "owner" && child) {
                      setError(`owner.${String(child)}` as never, {
                        message: t("invalidField"),
                      });
                    } else if (root) {
                      setError(String(root) as keyof RegisterOwnerInput, {
                        message: t("invalidField"),
                      });
                    }
                    return;
                  }

                  signupMutation.mutate(parsed.data);
                })}
              >
                {submitError ? (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {submitError}
                  </p>
                ) : null}
                <fieldset
                  className="space-y-5"
                  disabled={signupMutation.isPending}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      error={errors.name?.message}
                      id="business-name"
                      label={t("fields.name")}
                    >
                      <Input id="business-name" {...register("name")} />
                    </Field>
                    <Field
                      error={errors.slug?.message}
                      id="business-slug"
                      label={t("fields.slug")}
                    >
                      <Input id="business-slug" {...register("slug")} />
                    </Field>
                  </div>
                  <Field
                    error={errors.primary_domain?.message}
                    id="business-domain"
                    label={t("fields.domain")}
                  >
                    <Input
                      id="business-domain"
                      placeholder="demo.localhost"
                      {...register("primary_domain")}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      error={errors.default_business_name?.message}
                      id="default-business-name"
                      label={t("fields.defaultBusiness")}
                    >
                      <Input
                        id="default-business-name"
                        placeholder={t("sameName")}
                        {...register("default_business_name")}
                      />
                    </Field>
                    <Field
                      error={errors.default_business_slug?.message}
                      id="default-business-slug"
                      label={t("fields.slug")}
                    >
                      <Input
                        id="default-business-slug"
                        placeholder={t("sameSlug")}
                        {...register("default_business_slug")}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      error={errors.owner?.full_name?.message}
                      id="owner-name"
                      label={t("fields.fullName")}
                    >
                      <Input id="owner-name" {...register("owner.full_name")} />
                    </Field>
                    <Field
                      error={errors.owner?.username?.message}
                      id="owner-username"
                      label={t("fields.username")}
                    >
                      <Input
                        id="owner-username"
                        {...register("owner.username")}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      error={errors.owner?.email?.message}
                      id="owner-email"
                      label={t("fields.email")}
                    >
                      <Input
                        id="owner-email"
                        type="email"
                        {...register("owner.email")}
                      />
                    </Field>
                    <Field
                      error={errors.owner?.phone?.message}
                      id="owner-phone"
                      label={t("fields.phone")}
                    >
                      <Input id="owner-phone" {...register("owner.phone")} />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      error={errors.owner?.password?.message}
                      id="owner-password"
                      label={t("fields.password")}
                    >
                      <Input
                        id="owner-password"
                        type="password"
                        {...register("owner.password")}
                      />
                    </Field>
                    <Field
                      error={errors.owner?.confirmPassword?.message}
                      id="owner-confirm-password"
                      label={t("fields.confirmPassword")}
                    >
                      <Input
                        id="owner-confirm-password"
                        type="password"
                        {...register("owner.confirmPassword")}
                      />
                    </Field>
                  </div>
                  <Button
                    className="w-full"
                    disabled={signupMutation.isPending}
                    type="submit"
                  >
                    {signupMutation.isPending ? t("submitting") : t("submit")}
                  </Button>
                </fieldset>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
