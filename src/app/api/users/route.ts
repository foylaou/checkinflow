// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserRepository } from '@/lib/typeorm/db-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { line_user_id, name, phone, company, department } = body;

    if (!line_user_id || !name || !phone || !company || !department) {
      return NextResponse.json({ error: '所有欄位都是必填的' }, { status: 400 });
    }

    const userRepo = await getUserRepository();

    // 檢查用戶是否已存在
    const existingUser = await userRepo.findOne({ where: { line_user_id } });
    if (existingUser) {
      return NextResponse.json({ error: '此 LINE 帳號已註冊' }, { status: 409 });
    }

    // 創建新用戶
    const newUser = userRepo.create({
      line_user_id,
      name,
      phone,
      company,
      department
    });

    await userRepo.save(newUser);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('用戶註冊錯誤:', error);
    return NextResponse.json({ error: '註冊失敗' }, { status: 500 });
  }
}
