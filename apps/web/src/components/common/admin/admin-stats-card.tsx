import type { LucideIcon } from "lucide-react";
import { Card, CardContent, Skeleton } from "@repo/ui";

type AdminStatsCardProps = {
  description: string;
  icon: LucideIcon;
  title: string;
  trend?: string;
  value: string;
  loading?: boolean;
};

export function AdminStatsCard({
  description,
  icon: Icon,
  title,
  trend,
  value,
  loading = false,
}: AdminStatsCardProps) {
  return (
    <Card
      aria-busy={loading}
      className="group min-w-0 overflow-hidden shadow-xs transition-[border-color,box-shadow] duration-normal hover:border-primary-200 hover:shadow-md dark:hover:border-primary-800"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">
              {loading ? (
                <Skeleton
                  aria-hidden="true"
                  className="h-8 w-24 motion-reduce:animate-none"
                />
              ) : (
                value
              )}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors duration-normal group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon aria-hidden="true" className="size-4" />
          </div>
        </div>
        <div className="mt-4 flex min-w-0 items-center gap-2 border-t border-border pt-3">
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {description}
          </p>
          {loading ? (
            <Skeleton
              aria-hidden="true"
              className="h-4 w-16 motion-reduce:animate-none"
            />
          ) : trend ? (
            <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-caption font-semibold text-muted-foreground">
              {trend}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
