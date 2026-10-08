import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@repo/ui";

type StatePanelProps = {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
};

export function StatePanel({
  action,
  description,
  icon: Icon,
  title,
}: StatePanelProps) {
  return (
    <Card className="border-dashed bg-surface shadow-xs">
      <CardContent className="flex min-h-56 flex-col items-center justify-center p-6 text-center sm:p-8">
        <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
