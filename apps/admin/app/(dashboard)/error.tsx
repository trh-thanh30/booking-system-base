"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@repo/ui";
import { StatePanel } from "@/src/components/common/state-panel";

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <StatePanel
      action={
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      }
      description="The admin view could not be rendered. Retry the route or inspect the browser console and server logs."
      icon={AlertTriangle}
      title="Dashboard failed to load"
    />
  );
}
