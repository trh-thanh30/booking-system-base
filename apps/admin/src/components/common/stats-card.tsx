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
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 p-6">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-100">
            {title}
          </CardTitle>
          <p className="pt-5 text-2xl font-bold tracking-normal text-slate-950 dark:text-slate-50">
            {value}
          </p>
        </div>
        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 px-6 pb-6 pt-0">
        <p className="min-w-0 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
