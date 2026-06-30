import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  sassOptions: {
    // Let SCSS resolve `@use "styles/..."` from src/ (no webpack alias in sass).
    // `includePaths` for Next's legacy sass API; `loadPaths` for the modern one.
    includePaths: [path.join(process.cwd(), "src")],
    loadPaths: [path.join(process.cwd(), "src")],
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default withNextIntl(nextConfig);
