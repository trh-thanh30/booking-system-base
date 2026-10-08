import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@repo/ui";

type StatCardProps = {
  description: string;
  icon: LucideIcon;
  title: string;
  value: string;
};

export function StatCard({
  description,
  icon: Icon,
  title,
  value,
}: StatCardProps) {
  return (
    <Card className="group min-w-0 overflow-hidden shadow-xs transition-[border-color,box-shadow] duration-normal hover:border-primary/40 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors duration-normal group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon aria-hidden="true" className="size-4" />
          </div>
        </div>
        <p className="mt-4 truncate border-t border-border pt-3 text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
