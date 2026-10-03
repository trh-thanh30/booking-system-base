import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Card, CardContent } from "@repo/ui";

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
    <Card className="border-dashed">
      <CardContent className="flex min-h-56 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground dark:text-muted-foreground">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground dark:text-muted-foreground">
          {description}
        </p>
        {action ? (
          <div className="mt-4">{action}</div>
        ) : (
          <Button className="mt-4">Create item</Button>
        )}
      </CardContent>
    </Card>
  );
}
