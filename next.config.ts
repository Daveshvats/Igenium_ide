import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  output: 'standalone',
  
  // Optimize images
  images: {
    unoptimized: true,
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Use Node.js runtime for API routes to avoid Edge Runtime issues
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken'],
  },
};

export default nextConfig;
