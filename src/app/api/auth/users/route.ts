// /app/api/users/route.ts
import { NextResponse } from 'next/server';
import { AppDataSource } from "@/lib/typeorm/data-source";
import { Admin } from '@/lib/typeorm/entities/Admin';
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function GET(req: Request) {
  try {
    // 檢查當前用戶是否有權限
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未授權，請先登入' }, { status: 401 });
    }

    // 驗證 token
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as { id: number; username: string; role: string };
    } catch (tokenError) {
      console.error("JWT驗證失敗:", tokenError);
      return NextResponse.json({ error: '無效的令牌，請重新登入' }, { status: 401 });
    }

    if (!['系統管理員','管理員'].includes(decoded.role)) {
      return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    // 確保資料庫連接已初始化
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection initialized in users API");
    }

    // 獲取所有管理員資料
    const adminRepository = AppDataSource.getRepository(Admin);

    try {
      const admins = await adminRepository.find({
        select: ["id", "username", "name", "created_at"]
      });

      // 返回去除密碼的用戶列表
      return NextResponse.json(admins, { status: 200 });
    } catch (dbError) {
      console.error("數據庫查詢錯誤:", dbError);
      return NextResponse.json(
        { error: "獲取用戶列表時發生數據庫錯誤" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("獲取用戶列表時出錯:", error);
    return NextResponse.json(
      { error: "獲取用戶列表時發生錯誤" },
      { status: 500 }
    );
  }
}
