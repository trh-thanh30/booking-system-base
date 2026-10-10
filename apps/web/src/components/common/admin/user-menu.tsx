"use client";

import { Check, Languages, LogOut, Moon, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useAuth } from "@/src/app/providers/admin";
import { Link } from "@/src/i18n/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@repo/hooks";
import { buildAdminBaseUrl } from "@/src/lib/admin/admin-workspace-url";
import { useLocaleSwitcher } from "@/src/hooks/use-locale-switcher";
import { LANDING_LANGUAGES } from "@/src/utils/locale-switch.utils";

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
  const tCommon = useTranslations("Common");
  const { logout, user } = useAuth();
  const tAuth = useTranslations("Auth");
  const { resolvedTheme, setTheme } = useTheme();
  const { currentLanguage, pending, selectLanguage } = useLocaleSwitcher();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const displayName = user?.full_name ?? user?.username ?? "Admin";
  const email = user?.email ?? "";
  const initials = getInitials(displayName) || "AD";
  const darkMode = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

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
          className="size-10 p-1"
          variant="ghost"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 py-2">
            <Languages aria-hidden="true" className="size-4 shrink-0" />
            <span>{tCommon("language")}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {currentLanguage.label}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {LANDING_LANGUAGES.map(({ code, label }) => (
              <DropdownMenuItem
                className="flex items-center gap-2 py-2"
                disabled={pending}
                key={code}
                onSelect={() => selectLanguage(code)}
              >
                <span className="relative flex h-3.5 w-5 shrink-0 overflow-hidden rounded-xs ring-1 ring-foreground/10">
                  <Image
                    alt=""
                    className="h-full w-full object-cover"
                    height={14}
                    src={code === "vi" ? "/flags/vi.svg" : "/flags/en.svg"}
                    width={20}
                  />
                </span>
                <span>{label}</span>
                {code === locale ? (
                  <Check aria-hidden="true" className="ml-auto size-4" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          className="flex items-center gap-2 py-2"
          onSelect={(event) => {
            event.preventDefault();
            setTheme(darkMode ? "light" : "dark");
          }}
        >
          <Moon aria-hidden="true" className="size-4 shrink-0" />
          <span>{tCommon("darkMode")}</span>
          <span
            aria-hidden="true"
            className={cn(
              "ml-auto inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
              darkMode ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "size-4 rounded-full bg-background shadow-sm transition-transform",
                darkMode && "translate-x-4",
              )}
            />
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors",
            "text-foreground hover:bg-muted",
          )}
        >
          <Link
            className="flex w-full items-center gap-2"
            href="/admin/settings"
          >
            <Settings aria-hidden="true" className="size-4 shrink-0" />
            <span>{t("items.settings")}</span>
          </Link>
        </DropdownMenuItem>
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
