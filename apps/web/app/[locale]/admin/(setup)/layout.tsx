import type { ReactNode } from "react";
import { BusinessSetupShell } from "@/src/components/layout/admin/business-setup-shell";

export default function SetupLayout({ children }: { children: ReactNode }) {
  return <BusinessSetupShell>{children}</BusinessSetupShell>;
}
