import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import path from 'path';
import * as fs from 'fs';

export function middleware(request: NextRequest) {
  // 处理文件请求的详细日志
  if (request.nextUrl.pathname.startsWith('/files/')) {
    const filePath = path.join(process.cwd(), request.nextUrl.pathname);

    console.log('Requested file path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));

    try {
      // 详细的文件信息
      const stats = fs.statSync(filePath);
      console.log('File stats:', {
        size: stats.size,
        mode: stats.mode,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      });
    } catch (error) {
      console.error('File stat error:', error);
    }

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      return NextResponse.next();
    }

    // 文件不存在时的详细日志
    console.error('File not found:', filePath);
    return new NextResponse(null, {
      status: 404,
      headers: {
        'X-Debug-Message': 'File not found'
      }
    });
  }
}

export const config = {
  matcher: '/files/:path*',
};
