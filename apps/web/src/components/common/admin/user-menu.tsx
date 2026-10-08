"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useAuth } from "@/src/app/providers/admin";
import { Link } from "@/src/i18n/navigation";
import { useState } from "react";
import { useToast } from "@repo/hooks";
import { buildAdminBaseUrl } from "@/src/lib/admin/admin-workspace-url";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu() {
  const { toast } = useToast();
  const locale = useLocale();
  const t = useTranslations("DashboardConfig");
  const { logout, user } = useAuth();
  const tAuth = useTranslations("Auth");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = user?.full_name ?? user?.username ?? "Admin";
  const email = user?.email ?? "";
  const initials = getInitials(displayName) || "AD";
  const menuItems = [
    {
      href: "/admin/settings",
      icon: User,
      label: t("items.profile"),
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: t("items.settings"),
    },
  ];

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      toast.error(tAuth("logoutFailed"));
    } finally {
      window.location.replace(
        buildAdminBaseUrl({ locale, pathname: "/admin/login" }),
      );
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("items.profile")}
          className="h-10 gap-2 px-1.5 sm:px-2"
          variant="ghost"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              asChild
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors",
                "text-foreground hover:bg-muted",
              )}
              key={item.label}
            >
              <Link href={item.href} className="flex w-full items-center gap-2">
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem
          disabled={isLoggingOut}
          className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm text-danger-600 outline-none transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950/50"
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
        >
          <LogOut className="size-4 shrink-0" />
          <span>{t("items.signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
