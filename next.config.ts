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
            value: 'public, max-age=86400', // 24小時快取
          },
          {
            key: 'X-Files-Debug', // 添加调试头
            value: 'Serving static files',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    try {
      // 确保 files 目录存在
      const filesPath = path.join(process.cwd(), 'files');
      const qrCodesPath = path.join(filesPath, 'qrcodes');

      console.log('Files path:', filesPath);
      console.log('QR Codes path:', qrCodesPath);

      // 创建目录并记录详细信息
      if (!fs.existsSync(filesPath)) {
        fs.mkdirSync(filesPath, { recursive: true });
        console.log('Created files directory');
      }

      if (!fs.existsSync(qrCodesPath)) {
        fs.mkdirSync(qrCodesPath, { recursive: true });
        console.log('Created qrcodes directory');
      }

      // 检查目录权限
      try {
        fs.accessSync(qrCodesPath, fs.constants.R_OK | fs.constants.W_OK);
        console.log('QR Codes directory is readable and writable');
      } catch (accessError) {
        console.error('Directory access error:', accessError);
      }

      // 添加文件路径别名
      config.resolve.alias['@files'] = filesPath;

    } catch (error) {
      console.error('Error in webpack configuration:', error);
    }

    // 处理 Node.js 模块相容性问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },


};

export default nextConfig;
