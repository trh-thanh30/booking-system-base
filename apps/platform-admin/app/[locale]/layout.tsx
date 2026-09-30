import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@repo/ui/sonner";
import {
  AuthProvider,
  QueryProvider,
  ThemeProvider,
} from "@/src/app/providers";
import { routing } from "@/src/i18n/routing";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Platform Admin",
  description: "Super admin portal for the booking platform",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      className={plusJakartaSans.variable}
      lang={locale}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <NextTopLoader
                  color="var(--color-primary)"
                  crawlSpeed={180}
                  easing="ease-out"
                  height={3}
                  shadow="0 0 10px color-mix(in srgb, var(--color-primary) 35%, transparent)"
                  showSpinner={false}
                  speed={220}
                  zIndex={2147483647}
                />
                {children}
                <Toaster />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
