import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/src/app/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking Admin",
  description: "Operational dashboard for the booking system base",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NextTopLoader
            color="#2563eb"
            crawlSpeed={180}
            easing="ease-out"
            height={3}
            shadow="0 0 10px rgba(37, 99, 235, 0.35)"
            showSpinner={false}
            speed={220}
            zIndex={2147483647}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
