import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";

type PageHeaderProps = {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PlatformPage({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-6 pb-8", className)} {...props} />;
}

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-primary"
            />
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
      </div>
      {actions ? <PageActions>{actions}</PageActions> : null}
    </header>
  );
}

export function PageActions({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function PlatformStatsGrid({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
      {...props}
    />
  );
}
