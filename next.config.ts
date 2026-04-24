import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow Sanity Studio to embed the app in the Presentation preview iframe.
        // Sanity serves studios from TWO origins depending on how they're opened:
        //   https://<project>.sanity.studio   — deployed Studio (e.g. seeking-beauty)
        //   https://sanity.io/@<org>/studio/…  — Sanity's hosted workspace view
        // Both must be allowed as frame-ancestors, or Presentation's iframe
        // fails silently with 'Unable to connect'.
        //
        // X-Frame-Options is intentionally omitted — the deprecated `ALLOW-FROM`
        // form is treated as `DENY` by several browsers, blocking the frame
        // even when CSP frame-ancestors allows the origin.
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://*.sanity.studio https://sanity.io https://*.sanity.io",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
