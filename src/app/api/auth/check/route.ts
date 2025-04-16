import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { getAdminRepository } from '@/lib/typeorm/db-utils';

// JWT 密鑰，必須與登入 API 使用相同的密鑰
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function GET(request: NextRequest) {
  try {
    // 從 cookies 中取得 token
    const cookieStore =await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未授權，請先登入' }, { status: 401 });
    }

    // 驗證 token
    const decoded = verify(token, JWT_SECRET) as { id: number; username: string; role: string };

    // 檢查是否具有管理員角色
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    // 從數據庫獲取管理員資訊
    const adminRepo = await getAdminRepository();
    const admin = await adminRepo.findOne({ where: { id: decoded.id } });

    if (!admin) {
      return NextResponse.json({ error: '找不到管理員帳號' }, { status: 404 });
    }

    // 返回管理員信息（不包含密碼）
    const { password: _, ...adminData } = admin;
    return NextResponse.json({
      authenticated: true,
      admin: adminData
    });
  } catch (error) {
    console.error('驗證錯誤:', error);
    return NextResponse.json({ error: '身份驗證失敗' }, { status: 401 });
  }
}
