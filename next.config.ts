import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for production builds to avoid build issues
  experimental: {
    turbo: {
      // Only use Turbopack in development
      enabled: process.env.NODE_ENV === 'development',
    },
  },
  
  // Optimize for production
  output: 'standalone',
  
  // Disable telemetry
  telemetry: false,
  
  // Optimize images
  images: {
    unoptimized: true,
  },
  
  // Build optimizations
  swcMinify: true,
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
