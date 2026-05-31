import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin App",
  description: "Admin app shell for the monorepo base",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
