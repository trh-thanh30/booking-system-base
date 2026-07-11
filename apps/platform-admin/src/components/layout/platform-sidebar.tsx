"use client";

import { LogOut, PanelLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { getPlatformConfig } from "@/src/config/platform.config";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { useAuth } from "@/src/app/providers";

export function PlatformSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("Platform");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();
  const config = getPlatformConfig(t);
  const BrandLogo = config.brand.logo;
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950",
        collapsed ? "w-16" : "w-72",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-3 px-5",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950">
          <BrandLogo className="h-4 w-4" />
        </div>
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                {config.brand.name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {config.brand.description}
              </p>
            </div>
            <Button
              aria-label={tCommon("collapseSidebar")}
              className="h-8 w-8"
              onClick={onToggle}
              size="icon"
              variant="ghost"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {config.sidebarSections.map((section) => (
          <div className="space-y-1" key={section.label}>
            {!collapsed ? (
              <p className="px-3 pb-1 pt-4 text-xs font-medium text-slate-500 dark:text-slate-500">
                {section.label}
              </p>
            ) : (
              <div className="h-4" />
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center rounded-md text-sm font-medium transition-colors",
                    collapsed
                      ? "mx-auto h-9 w-9 justify-center px-0"
                      : "w-full gap-3 px-3",
                    active
                      ? "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
                  )}
                  href={item.href}
                  key={item.href}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed ? <span>{item.title}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center",
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
                  {user?.full_name ?? user?.username ?? "Super Admin"}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email ?? "platform@example.com"}
                </p>
              </div>
              <Button
                aria-label={t("items.signOut")}
                onClick={() => void handleLogout()}
                size="icon"
                variant="ghost"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
