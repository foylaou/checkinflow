// next.config.ts
import type { NextConfig } from "next";
const path = require('path');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['puppeteer-core', 'puppeteer'],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Add proper static file handling
  output: 'standalone',
  // Configure public directory to serve files
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/files/:path*',
        destination: '/api/files/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/files/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    if (isServer) {
      const TerserPlugin = require("terser-webpack-plugin");
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
          },
        }),
      ];
    }

    return config;
  },
};

export default nextConfig;
