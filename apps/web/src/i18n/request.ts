import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/src/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [messages, landingPageHome] = await Promise.all([
    import(`@/src/messages/${locale}.json`).then((module) => module.default),
    import(`@/src/messages/landing-page-home/${locale}.json`).then(
      (module) => module.default,
    ),
  ]);

  return {
    locale,
    messages: {
      ...messages,
      landing_page_home: landingPageHome,
    },
  };
});
