import type { ReactNode } from "react";
import { Shield } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export function AuthShell({ children, description, title }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh bg-background text-foreground">
      <section className="hidden flex-1 border-r border-border bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground text-primary shadow-sm">
            <Shield className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Platform Admin</p>
            <p className="text-xs text-primary-foreground/70">
              Super admin workspace
            </p>
          </div>
        </div>
        <div className="max-w-md">
          <p className="text-3xl font-semibold leading-tight tracking-normal">
            Platform controls stay separate from business operations.
          </p>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
            Manage tenants, internal operators, and system state without
            entering a tenant workspace.
          </p>
        </div>
      </section>
      <section className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-[34rem]">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
