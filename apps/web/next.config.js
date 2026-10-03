import createNextIntlPlugin from "next-intl/plugin";
import process from "node:process";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isolate verification builds when a developer's next dev is already running.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
  transpilePackages: ["@repo/ui", "@repo/shared"],
};

export default withNextIntl(nextConfig);
