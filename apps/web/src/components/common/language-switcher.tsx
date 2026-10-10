"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  cn,
} from "@repo/ui";
import { LANDING_LANGUAGES } from "@/src/utils/locale-switch.utils";
import { useLocaleSwitcher } from "@/src/hooks/use-locale-switcher";

export function LanguageSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "landing";
} = {}) {
  const t = useTranslations("Navigation");
  const { currentLanguage, locale, pending, selectLanguage } =
    useLocaleSwitcher();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        disabled={pending}
        aria-busy={pending}
        aria-label={t("language")}
        className={cn(
          "group inline-flex h-12 items-center gap-2.5 rounded-full border border-input hover:border-muted-foreground bg-surface px-4 text-sm font-bold text-foreground transition-all duration-200 shadow-xs cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-60 data-[state=open]:border-foreground data-[state=open]:bg-muted data-[state=open]:shadow-sm",
          className,
        )}
      >
        <div className="flex shrink-0 items-center gap-2">
          <span className="relative flex h-3.5 w-5 shrink-0 overflow-hidden rounded-xs shadow-xs ring-1 ring-foreground/10">
            <Image
              src={
                currentLanguage?.code === "vi"
                  ? "/flags/vi.svg"
                  : "/flags/en.svg"
              }
              alt=""
              width={20}
              height={14}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="whitespace-nowrap font-bold text-foreground">
            {currentLanguage?.label}
          </span>
        </div>
        <ChevronDown
          className="w-3.5 h-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-44 p-1.5 rounded-2xl border border-border bg-surface shadow-xl space-y-1 z-50"
      >
        {LANDING_LANGUAGES.map(({ code, label }) => {
          const isSelected = code === locale;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => selectLanguage(code)}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-colors outline-none",
                isSelected
                  ? variant === "landing"
                    ? "bg-accent text-accent-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary-hover focus:bg-primary-hover focus:text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-5 shrink-0 overflow-hidden rounded-xs shadow-xs ring-1 ring-foreground/15">
                  <Image
                    src={code === "vi" ? "/flags/vi.svg" : "/flags/en.svg"}
                    alt=""
                    width={20}
                    height={14}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span>{label}</span>
              </div>
              {isSelected && (
                <Check
                  className="w-4 h-4 shrink-0 text-current"
                  aria-hidden="true"
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
