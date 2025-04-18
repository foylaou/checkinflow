// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { getAdminRepository } from '@/lib/typeorm/db-utils';

// JWT 密鑰，必須與登入 API 使用相同的密鑰
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function GET(_request: NextRequest) {
  try {
    // 從 cookies 中取得 token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    // 沒有令牌，返回未認證但狀態碼為 200
    if (!token) {
      return NextResponse.json({
        authenticated: false,
        message: '未授權，請先登入'
      }, { status: 200 });
    }

    try {
      // 驗證 token
      const decoded = verify(token, JWT_SECRET) as { id: number; username: string; role: string };

      // 從數據庫獲取管理員資訊
      const adminRepo = await getAdminRepository();
      const admin = await adminRepo.findOne({ where: { id: decoded.id } });

      if (!admin) {
        return NextResponse.json({
          authenticated: false,
          message: '找不到管理員帳號'
        }, { status: 200 });
      }

      // 返回管理員信息（不包含密碼）
      const { password: _, ...adminData } = admin;
      return NextResponse.json({
        authenticated: true,
        admin: adminData,
        role: decoded.role
      }, { status: 200 });
    } catch (tokenError) {
      // Token 驗證失敗，返回未認證但狀態碼為 200
      console.error('Token 驗證失敗:', tokenError);
      return NextResponse.json({
        authenticated: false,
        message: '身份驗證失敗'
      }, { status: 200 });
    }
  } catch (error) {
    console.error('驗證過程發生錯誤:', error);
    // 出現錯誤，返回未認證但狀態碼為 200
    return NextResponse.json({
      authenticated: false,
      message: '身份驗證過程中發生錯誤'
    }, { status: 200 });
  }
}
