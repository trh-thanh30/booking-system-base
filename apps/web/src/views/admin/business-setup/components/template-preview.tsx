import { useTranslations } from "next-intl";
import Image from "next/image";

export function TemplatePreview() {
  const t = useTranslations("BusinessSetup.template");
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-lg border border-border"
    >
      <Image
        src="/nail-salon/ver1.webp"
        alt=""
        width={640}
        height={360}
        sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
        className="aspect-video w-full object-cover"
      />
      <span className="absolute bottom-3 left-3 rounded bg-background px-2 py-1 text-caption font-medium text-foreground">
        {t("demoBadge")}
      </span>
    </div>
  );
}
