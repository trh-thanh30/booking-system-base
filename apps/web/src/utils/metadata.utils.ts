import type { Metadata } from "next";
import { siteConfig } from "@/src/config/site.config";

export function createLandingMetadata(
  locale: string,
  path: "" | "/signup-business" = "",
): Metadata {
  const lang = locale === "en" ? "en" : "vi";
  const signup = path !== "";
  const title =
    lang === "vi"
      ? signup
        ? "Đăng ký doanh nghiệp | BookingBase"
        : "BookingBase — Đặt lịch trực tuyến cho doanh nghiệp"
      : signup
        ? "Business signup | BookingBase"
        : "BookingBase — Online booking for service businesses";
  const description =
    lang === "vi"
      ? signup
        ? "Tạo tài khoản Owner, xác minh email rồi thiết lập thông tin và địa chỉ doanh nghiệp trên BookingBase."
        : "Tạo trang đặt lịch mang thương hiệu riêng. Quản lý dịch vụ, nhân viên và lịch hẹn trên BookingBase."
      : signup
        ? "Create your Owner account, verify your email, then set up your business information and address on BookingBase."
        : "Create your branded booking page. Manage services, staff and appointments with BookingBase.";
  const canonical = `/${lang}${path}`;
  return {
    metadataBase: new URL(siteConfig.webUrl),
    title,
    description,
    applicationName: siteConfig.name,
    alternates: {
      canonical,
      languages: {
        vi: `/vi${path}`,
        en: `/en${path}`,
        "x-default": `/vi${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: canonical,
      locale: lang === "vi" ? "vi_VN" : "en_US",
      alternateLocale: lang === "vi" ? ["en_US"] : ["vi_VN"],
    },
    twitter: { card: "summary", title, description },
    robots: { index: !signup, follow: true },
  };
}
