import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import {
  AuthProvider,
  QueryProvider,
  ThemeProvider,
} from "@/src/app/providers";
import { routing } from "@/src/i18n/routing";
import "../globals.css";

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
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <NextTopLoader
                  color="#0f172a"
                  crawlSpeed={180}
                  easing="ease-out"
                  height={3}
                  shadow="0 0 10px rgba(15, 23, 42, 0.35)"
                  showSpinner={false}
                  speed={220}
                  zIndex={2147483647}
                />
                {children}
                <Toaster richColors />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
