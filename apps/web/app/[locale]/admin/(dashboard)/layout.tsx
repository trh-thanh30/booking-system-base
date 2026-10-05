import type { ReactNode } from "react";
import { DashboardShell } from "@/src/components/layout/admin/dashboard-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
