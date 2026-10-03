import type { Metadata } from "next";
import { AdminProviders } from "@/src/app/providers/admin/admin-providers";

export const metadata: Metadata = {
  title: "Business Admin | BookingBase",
  description: "Tenant workspace for business owners and staff",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProviders>{children}</AdminProviders>;
}
