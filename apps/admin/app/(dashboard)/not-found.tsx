import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@repo/ui";
import { StatePanel } from "@/src/components/common/state-panel";

export default function DashboardNotFound() {
  return (
    <StatePanel
      action={
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      }
      description="The admin route does not exist or has not been added to the dashboard navigation yet."
      icon={SearchX}
      title="Admin page not found"
    />
  );
}
