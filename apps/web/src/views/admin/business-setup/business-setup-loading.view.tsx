import { useTranslations } from "next-intl";
import { SetupLoadingSkeleton } from "./components/setup-loading-skeleton";

export function BusinessSetupLoadingView() {
  const t = useTranslations("BusinessSetup");
  return <SetupLoadingSkeleton label={t("loading")} />;
}
