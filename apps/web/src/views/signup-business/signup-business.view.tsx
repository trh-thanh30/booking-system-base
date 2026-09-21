"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Building2, CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signupTenantSchema, type SignupTenantInput } from "@repo/shared";
import { Button, Input, Label } from "@repo/ui";
import { Link } from "@/src/i18n/navigation";
import { tenantsService } from "@/src/services/tenants.service";

function Field({
  error,
  id,
  label,
  children,
}: {
  error?: string;
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs leading-5 text-red-600">{error}</p> : null}
    </div>
  );
}

export function SignupBusinessView() {
  const [adminUrl, setAdminUrl] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<SignupTenantInput>({
    defaultValues: {
      default_business_name: "",
      default_business_slug: "",
      locale: "vi",
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
    mutationFn: tenantsService.signupTenant,
    onSuccess(result) {
      const adminBaseUrl =
        process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3002";
      setAdminUrl(`${adminBaseUrl}/vi/login`);
      toast.success(`${result.tenant.name} workspace created`);
    },
    onError(error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    },
  });

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase text-slate-500">
                Business signup
              </p>
              <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-normal sm:text-5xl">
                Create a booking workspace for your business.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Register a tenant, create the owner account, then continue to
                the business admin portal to configure services, staff and
                booking rules.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-white p-4">
                Tenant isolated
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-4">
                Owner role ready
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-4">
                Admin login enabled
              </div>
            </div>
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {adminUrl ? (
              <div className="flex min-h-96 flex-col justify-center text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h2 className="mt-4 text-xl font-semibold">
                  Workspace is ready
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Use the owner account you just created to log in to the
                  business admin portal.
                </p>
                <Button asChild className="mx-auto mt-6">
                  <a href={adminUrl}>
                    Open admin
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={handleSubmit((input) => {
                  const parsed = signupTenantSchema.safeParse({
                    ...input,
                    default_business_name:
                      input.default_business_name?.trim() || undefined,
                    default_business_slug:
                      input.default_business_slug?.trim() || undefined,
                    primary_domain: input.primary_domain?.trim() || undefined,
                    owner: {
                      ...input.owner,
                      full_name: input.owner.full_name?.trim() || undefined,
                      phone: input.owner.phone?.trim() || undefined,
                    },
                  });

                  if (!parsed.success) {
                    const issue = parsed.error.issues[0];
                    if (!issue) {
                      return;
                    }
                    const [root, child] = issue?.path ?? [];
                    if (root === "owner" && child) {
                      setError(`owner.${String(child)}` as never, {
                        message: issue.message,
                      });
                    } else if (root) {
                      setError(String(root) as keyof SignupTenantInput, {
                        message: issue?.message,
                      });
                    }
                    return;
                  }

                  signupMutation.mutate(parsed.data);
                })}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    error={errors.name?.message}
                    id="business-name"
                    label="Business name"
                  >
                    <Input id="business-name" {...register("name")} />
                  </Field>
                  <Field
                    error={errors.slug?.message}
                    id="business-slug"
                    label="Business slug"
                  >
                    <Input id="business-slug" {...register("slug")} />
                  </Field>
                </div>
                <Field
                  error={errors.primary_domain?.message}
                  id="business-domain"
                  label="Booking domain"
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
                    label="First business"
                  >
                    <Input
                      id="default-business-name"
                      placeholder="Same as account name"
                      {...register("default_business_name")}
                    />
                  </Field>
                  <Field
                    error={errors.default_business_slug?.message}
                    id="default-business-slug"
                    label="Business slug"
                  >
                    <Input
                      id="default-business-slug"
                      placeholder="Same as account slug"
                      {...register("default_business_slug")}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    error={errors.owner?.full_name?.message}
                    id="owner-name"
                    label="Owner name"
                  >
                    <Input id="owner-name" {...register("owner.full_name")} />
                  </Field>
                  <Field
                    error={errors.owner?.username?.message}
                    id="owner-username"
                    label="Username"
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
                    label="Email"
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
                    label="Phone"
                  >
                    <Input id="owner-phone" {...register("owner.phone")} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    error={errors.owner?.password?.message}
                    id="owner-password"
                    label="Password"
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
                    label="Confirm password"
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
                  {signupMutation.isPending
                    ? "Creating workspace"
                    : "Create workspace"}
                </Button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
