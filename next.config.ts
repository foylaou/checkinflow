import type { NextConfig } from "next";
const path = require('path');
const fs = require('fs');

const nextConfig: NextConfig = {
  reactStrictMode: true,

  serverExternalPackages: ['puppeteer-core', 'puppeteer'],

  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },

  async rewrites() {
    return [
      {
        source: '/files/:path*',
        destination: '/files/:path*',
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
          {
            key: 'X-Files-Debug',
            value: 'Serving static files',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    try {
      const filesPath = path.join(process.cwd(), 'files');
      const qrCodesPath = path.join(filesPath, 'qrcodes');

      console.log('Files path:', filesPath);
      console.log('QR Codes path:', qrCodesPath);

      if (!fs.existsSync(filesPath)) {
        fs.mkdirSync(filesPath, { recursive: true });
        console.log('Created files directory');
      }

      if (!fs.existsSync(qrCodesPath)) {
        fs.mkdirSync(qrCodesPath, { recursive: true });
        console.log('Created qrcodes directory');
      }

      try {
        fs.accessSync(qrCodesPath, fs.constants.R_OK | fs.constants.W_OK);
        console.log('QR Codes directory is readable and writable');
      } catch (accessError) {
        console.error('Directory access error:', accessError);
      }

      config.resolve.alias['@files'] = filesPath;

    } catch (error) {
      console.error('Error in webpack configuration:', error);
    }

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
