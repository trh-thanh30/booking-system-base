"use client";

import { Building2, Check, ChevronDown } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui";
import { useAuth } from "@/src/app/providers/admin";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { useTranslations } from "next-intl";

export function BusinessSwitcher() {
  const t = useTranslations("Common");
  const tDashboard = useTranslations("DashboardConfig");
  const { user, selectBusiness } = useAuth();
  const businesses = user?.businesses ?? [];
  const activeBusinessId = useAdminUiStore((state) => state.activeBusinessId);

  if (businesses.length === 0) {
    return null;
  }

  const activeBusiness =
    businesses.find((business) => business.id === activeBusinessId) ??
    businesses.find((business) => business.is_default) ??
    businesses[0];

  if (!activeBusiness) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("businessSwitcher")}
          className="w-40 justify-start bg-background px-3 sm:w-56 lg:w-64 xl:w-80"
          variant="secondary"
        >
          <Building2 className="size-4 shrink-0 text-primary" />
          <span className="truncate">{activeBusiness.name}</span>
          <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{tDashboard("items.businesses")}</DropdownMenuLabel>
        {businesses.map((business) => {
          const active = business.id === activeBusiness.id;

          return (
            <DropdownMenuItem
              className="gap-2"
              key={business.id}
              onSelect={() => selectBusiness(business.id)}
            >
              <Building2 className="size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{business.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {business.slug}
                </p>
              </div>
              {active ? (
                <>
                  <span className="sr-only">{t("selected")}</span>
                  <Check aria-hidden="true" className="size-4 text-primary" />
                </>
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
