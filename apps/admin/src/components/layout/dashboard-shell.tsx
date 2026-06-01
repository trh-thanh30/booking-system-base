import type { ReactNode } from "react";
import { AppSidebar } from "@/src/components/layout/app-sidebar";
import { Header } from "@/src/components/layout/header";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">
        <AppSidebar />
      </div>
      <div className="lg:pl-72">
        <Header />
        <main className="mx-auto w-full max-w-[88rem] px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
