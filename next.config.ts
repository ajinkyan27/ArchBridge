import type { NextConfig } from "next";

/**
 * Static export for S3 + CloudFront hosting.
 *
 * - `output: "export"` writes plain HTML/CSS/JS to `out/`; no Node.js server.
 * - `trailingSlash: true` emits `/services/index.html` so every route maps to a
 *   real object key. A CloudFront Function appends `index.html` to directory
 *   requests (see infrastructure/cloudfront/url-rewrite.js).
 * - Images are served as-is (there is no runtime image optimiser on S3).
 * - Cache Components is off: it needs a Node.js runtime and this site has no
 *   request-time data.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
