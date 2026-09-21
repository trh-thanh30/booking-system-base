import { ClipboardList } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export function AuthShell({ children, description, title }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
      <section className="hidden flex-1 border-r border-slate-200 bg-slate-950 p-10 text-white dark:border-slate-800 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-950">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Business Admin</p>
            <p className="text-xs text-slate-400">Tenant workspace</p>
          </div>
        </div>
        <div className="max-w-md">
          <p className="text-3xl font-semibold leading-tight tracking-normal">
            Work queues, teams, and access control for one business.
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Sign in with an admin or staff account to manage tenant operations.
          </p>
        </div>
      </section>
      <section className="flex w-full items-center justify-center px-4 py-10 lg:w-136">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
