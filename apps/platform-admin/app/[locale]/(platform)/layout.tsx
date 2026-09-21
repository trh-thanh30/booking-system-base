import type { ReactNode } from "react";
import { PlatformShell } from "@/src/components/layout";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return <PlatformShell>{children}</PlatformShell>;
}
