import { ClipboardList } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export function AuthShell({ children, description, title }: AuthShellProps) {
  const t = useTranslations("Auth");
  return (
    <main className="flex min-h-dvh bg-background text-foreground">
      <section className="hidden flex-1 border-r border-border bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Business Admin</p>
            <p className="text-xs text-primary-foreground/80">
              {t("shell.workspace")}
            </p>
          </div>
        </div>
        <div className="max-w-md">
          <p className="text-3xl font-semibold leading-tight tracking-normal">
            {t("shell.title")}
          </p>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/80">
            {t("shell.description")}
          </p>
        </div>
      </section>
      <section className="flex w-full items-center justify-center px-4 py-10 lg:w-136">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
