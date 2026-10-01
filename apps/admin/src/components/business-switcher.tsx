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
import { useAuth } from "@/src/app/providers";
import { useAdminUiStore } from "@/src/app/stores/ui.store";

export function BusinessSwitcher() {
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
          className="max-w-32 justify-start px-3 md:max-w-60"
          variant="secondary"
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{activeBusiness.name}</span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Business</DropdownMenuLabel>
        {businesses.map((business) => {
          const active = business.id === activeBusiness.id;

          return (
            <DropdownMenuItem
              className="gap-2"
              key={business.id}
              onSelect={() => selectBusiness(business.id)}
            >
              <Building2 className="h-4 w-4 text-slate-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{business.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {business.slug}
                </p>
              </div>
              {active ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
