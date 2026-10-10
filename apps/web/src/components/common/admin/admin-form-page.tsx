import type { HTMLAttributes, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@/src/i18n/navigation";
import { AdminPage } from "./admin-page";

type AdminFormPageProps = {
  backHref: string;
  backLabel: string;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

type AdminFormSectionProps = HTMLAttributes<HTMLElement> & {
  description?: string;
  title: string;
};

type AdminFormActionsProps = HTMLAttributes<HTMLDivElement>;

export function AdminFormPage({
  backHref,
  backLabel,
  children,
  description,
  eyebrow,
  title,
}: AdminFormPageProps) {
  return (
    <AdminPage className="mx-auto w-full max-w-5xl">
      <header className="border-b border-border pb-6">
        <Link
          className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors duration-normal hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          href={backHref}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {backLabel}
        </Link>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </AdminPage>
  );
}

export function AdminFormSection({
  children,
  className,
  description,
  title,
  ...props
}: AdminFormSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs",
        className,
      )}
      {...props}
    >
      <div className="border-b border-border px-4 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

export function AdminFormActions({
  children,
  className,
  ...props
}: AdminFormActionsProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
