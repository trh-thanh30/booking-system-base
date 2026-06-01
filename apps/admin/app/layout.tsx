import type { Metadata } from "next";
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
