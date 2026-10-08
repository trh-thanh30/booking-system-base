"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui";
import { AppSidebar } from "@/src/components/layout/admin/app-sidebar";

export function MobileSidebar() {
  const t = useTranslations("Common");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label={t("openNavigation")}
          className="lg:hidden"
          size="icon"
          variant="ghost"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[min(20rem,calc(100vw-2rem))] p-0">
        <SheetTitle className="sr-only">{t("openNavigation")}</SheetTitle>
        <AppSidebar collapsedOverride={false} showCollapseButton={false} />
      </SheetContent>
    </Sheet>
  );
}
