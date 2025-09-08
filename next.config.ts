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
};

export default nextConfig;
