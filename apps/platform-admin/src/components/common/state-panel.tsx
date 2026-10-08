import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";

type StatePanelProps = {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
  tone?: "default" | "danger";
};

export function StatePanel({
  action,
  description,
  icon: Icon,
  title,
  tone = "default",
}: StatePanelProps) {
  return (
    <Card className="border-dashed bg-surface shadow-xs">
      <CardContent className="flex min-h-64 flex-col items-center justify-center p-6 text-center sm:p-8">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-lg",
            tone === "danger"
              ? "bg-destructive/10 text-destructive"
              : "bg-accent text-accent-foreground",
          )}
        >
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

export function EmptyState(props: Omit<StatePanelProps, "tone">) {
  return <StatePanel {...props} />;
}
