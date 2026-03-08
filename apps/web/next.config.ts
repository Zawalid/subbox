import "@subbox/env/web";
import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return [
      // Proxy auth and tRPC through the web app so cookies are same-origin.
      // This avoids cross-domain cookie issues between web (:3001) and API (:3000).
      {
        source: "/api/auth/:path*",
        destination: `${API_URL}/api/auth/:path*`,
      },
      {
        source: "/trpc/:path*",
        destination: `${API_URL}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
