import type { NextConfig } from "next";
const config: NextConfig = {
  output: process.env.NEXT_STANDALONE === '1' ? 'standalone' : undefined,
  outputFileTracingIncludes: {
    "/*": ["./knowledge/**/*", "./legacy_paths.json"],
  },
  poweredByHeader: false,
};
export default config;
