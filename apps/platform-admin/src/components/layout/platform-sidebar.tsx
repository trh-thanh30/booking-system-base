"use client";

import { LogOut, PanelLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { getPlatformConfig } from "@/src/config/platform.config";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { useAuth } from "@/src/app/providers";

export function PlatformSidebar({
  collapsed,
  onNavigate,
  onToggle,
  showCollapseButton = true,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  onToggle?: () => void;
  showCollapseButton?: boolean;
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
    <TooltipProvider delayDuration={100} skipDelayDuration={100}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-border bg-surface transition-[width] duration-slow ease-[var(--ease-standard)]",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center gap-3 px-5",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BrandLogo className="size-4" />
          </div>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {config.brand.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {config.brand.description}
                </p>
              </div>
              {showCollapseButton ? (
                <Button
                  aria-label={tCommon("collapseSidebar")}
                  className="size-8"
                  onClick={onToggle}
                  size="icon"
                  variant="ghost"
                >
                  <PanelLeft className="size-4" />
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
        <nav
          aria-label={config.brand.name}
          className="flex-1 overflow-y-auto px-3 pb-3"
        >
          {config.sidebarSections.map((section) => (
            <div className="space-y-1" key={section.label}>
              {!collapsed ? (
                <p className="px-3 pb-2 pt-5 text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {section.label}
                </p>
              ) : (
                <div className="h-4" />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                const navigationItem = (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center rounded-lg text-sm font-medium transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      collapsed
                        ? "mx-auto size-10 justify-center px-0"
                        : "w-full gap-3 px-3",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted-hover hover:text-foreground",
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={onNavigate}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed ? (
                      <span className="truncate">{item.title}</span>
                    ) : null}
                  </Link>
                );

                if (!collapsed) return navigationItem;

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navigationItem}</TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
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
                  <p className="truncate text-sm font-medium text-foreground">
                    {user?.full_name ?? user?.username ?? "Super Admin"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email ?? "platform@example.com"}
                  </p>
                </div>
                <Button
                  aria-label={t("items.signOut")}
                  onClick={() => {
                    onNavigate?.();
                    void handleLogout();
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
