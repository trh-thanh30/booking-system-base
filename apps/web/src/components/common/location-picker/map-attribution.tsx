"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { mapConfig } from "@/src/config/map.config";

export function MapAttribution({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Map");
  return (
    <div className="absolute bottom-2 right-2 z-[400]">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative size-7 rounded-full bg-card shadow-sm after:absolute after:-inset-2 after:rounded-full after:content-['']"
            aria-label={t("attribution")}
          >
            <Info
              className="size-4 fill-foreground text-card"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-64 max-w-[calc(100vw-2rem)] space-y-2 p-4 text-sm [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <p className="font-semibold">{t("attribution")}</p>
          <div dangerouslySetInnerHTML={{ __html: mapConfig.attribution }} />
          <p>
            <a
              href="https://github.com/mledoze/countries"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("countryData")}
            </a>
          </p>
          <p>
            <a
              href="https://leafletjs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leaflet
            </a>
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
