import { Urbanist } from "next/font/google";
import "@/src/views/nail-landing-v2/nail-landing-v2.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function NailSalonV2Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${urbanist.variable} nail-salon-v2 antialiased`}>
      {children}
    </div>
  );
}
