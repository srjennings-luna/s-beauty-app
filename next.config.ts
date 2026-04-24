import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow Sanity Studio to embed the app in the Presentation preview iframe.
        // CSP frame-ancestors restricts embedding to Sanity Studio subdomains only.
        // X-Frame-Options is intentionally omitted — `ALLOW-FROM` is deprecated
        // and several browsers treat an unknown value as `DENY`, blocking the
        // iframe even when CSP allows it. Per spec, frame-ancestors supersedes
        // X-Frame-Options when both are present, so omitting it is the correct
        // choice for a Presentation-embeddable app.
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.sanity.studio",
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
