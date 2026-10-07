import { useTranslations } from "next-intl";
import type { BookingTemplateId } from "@repo/shared";
import { cn } from "@repo/ui";

export function TemplatePreview({ id }: { id: BookingTemplateId }) {
  const t = useTranslations("BusinessSetup.template");
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-border bg-background text-foreground"
    >
      <div className="flex justify-between border-b border-border p-3">
        <span className="text-caption font-semibold">{t("businessName")}</span>
        <span className="text-caption text-primary">{t("book")}</span>
      </div>
      <div
        className={cn(
          "flex min-h-28 flex-col justify-center gap-2 p-4",
          id === "modern"
            ? "bg-primary/10"
            : id === "classic"
              ? "bg-muted"
              : "bg-background",
        )}
      >
        <div className="h-2 w-2/3 rounded bg-foreground/20" />
        <div className="h-2 w-1/2 rounded bg-foreground/10" />
        <span className="mt-2 w-fit rounded bg-primary px-3 py-1 text-caption text-primary-foreground">
          {t("book")}
        </span>
      </div>
      <div
        className={cn(
          "grid gap-2 p-3",
          id === "modern"
            ? "grid-cols-3"
            : id === "classic"
              ? "grid-cols-2"
              : "grid-cols-1",
        )}
      >
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="space-y-2 rounded border border-border p-2"
          >
            <div className="h-1.5 w-2/3 rounded bg-muted-foreground/20" />
            <div className="h-1.5 w-1/2 rounded bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
