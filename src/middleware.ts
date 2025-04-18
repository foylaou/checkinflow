// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // 使用 jose 替代 jsonwebtoken

// JWT 密鑰，確保與你的應用程序中使用的相同
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// 轉換 JWT_SECRET 為 UInt8Array，這是 jose 庫所需的格式
const secretKey = new TextEncoder().encode(JWT_SECRET);

// 需要登入才能訪問的路由前綴列表
const PROTECTED_ROUTES = ['/dashboard', '/user'];

export async function middleware(request: NextRequest) {
  // 處理檔案請求
  if (request.nextUrl.pathname.startsWith('/files/')) {
    console.log('檔案請求:', request.nextUrl.pathname);
    // 重定向到 pages/api 路由
    const apiUrl = request.nextUrl.clone();
    apiUrl.pathname = `/api${request.nextUrl.pathname}`;
    console.log('重定向到:', apiUrl.pathname);
    return NextResponse.rewrite(apiUrl);
  }

  // 檢查當前請求路徑是否需要保護
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // 如果是保護路由，則檢查登入狀態
  if (isProtectedRoute) {
    // 從 Cookie 獲取身份驗證令牌
    const authToken = request.cookies.get('auth_token')?.value;

    // 如果沒有令牌，重定向到登入頁面
    if (!authToken) {
      const url = new URL('/login', request.url);
      // 保存原始訪問URL以便登入後重定向回來
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    try {
      // 驗證令牌 (使用 jose 庫)
      await jwtVerify(authToken, secretKey);

      // 令牌有效，允許繼續訪問
      return NextResponse.next();
    } catch (error) {
      // 令牌無效，重定向到登入頁面
      console.error('令牌驗證失敗:', error);
      const url = new URL('/login', request.url);
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // 對於非保護路由，允許訪問
  return NextResponse.next();
}

// 更新配置以匹配所有需要處理的路由
export const config = {
  matcher: [
    '/files/:path*',
    '/dashboard/:path*',
    '/user/:path*',
  ],
};
