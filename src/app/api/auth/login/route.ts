import { NextRequest, NextResponse } from 'next/server';
import { getAdminRepository } from '@/lib/typeorm/db-utils';
import * as argon2 from 'argon2';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

// JWT 密鑰，建議設置在環境變數中
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 驗證請求體
    if (!username || !password) {
      return NextResponse.json({ error: '請提供用戶名和密碼' }, { status: 400 });
    }

    // 取得管理員資料庫
    const adminRepo = await getAdminRepository();
    const admin = await adminRepo.findOne({
      where: { username }
    });

    // 檢查管理員是否存在
    if (!admin) {
      return NextResponse.json({ error: '用戶名或密碼不正確' }, { status: 401 });
    }

    // 驗證密碼
    const passwordValid = await argon2.verify(admin.password, password);
    if (!passwordValid) {
      return NextResponse.json({ error: '用戶名或密碼不正確' }, { status: 401 });
    }

    // 生成 JWT
    const token = sign(
      { id: admin.id, username: admin.username, role: admin.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 設置 cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 小時
      path: '/',
      sameSite: 'strict'
    });

    // 返回成功信息，不包含密碼
    delete (admin as any).password;
    return NextResponse.json({
      success: true,
      message: '登入成功',
      admin
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    return NextResponse.json({ error: '登入處理失敗' }, { status: 500 });
  }
}
