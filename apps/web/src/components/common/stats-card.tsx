import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

type StatsCardProps = {
  title: string;
  value: string;
  description: string;
  trend: string;
  icon: LucideIcon;
};

export function StatsCard({
  description,
  icon: Icon,
  title,
  value,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
        <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="text-2xl font-bold tracking-tight text-foreground dark:text-muted-foreground">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            {description}
          </p>
          {trend && (
            <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-muted dark:text-muted-foreground">
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
