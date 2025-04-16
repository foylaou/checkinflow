import { NextRequest, NextResponse } from 'next/server';
import { getUserRepository } from '@/lib/typeorm/db-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { line_user_id, name, phone, company, department } = body;

    // 更詳細的驗證
    if (!line_user_id) {
      return NextResponse.json({ error: 'LINE User ID 不能為空' }, { status: 400 });
    }

    // 去除空白並再次驗證
    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();
    const trimmedCompany = company?.trim();
    const trimmedDepartment = department?.trim();

    // 檢查每個欄位是否為空
    if (!trimmedName) {
      return NextResponse.json({ error: '姓名不能為空' }, { status: 400 });
    }

    if (!trimmedPhone) {
      return NextResponse.json({ error: '電話不能為空' }, { status: 400 });
    }

    // 手機號碼格式驗證（台灣手機號碼）
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return NextResponse.json({ error: '請輸入有效的手機號碼（09開頭，共10碼）' }, { status: 400 });
    }

    if (!trimmedCompany) {
      return NextResponse.json({ error: '公司不能為空' }, { status: 400 });
    }

    if (!trimmedDepartment) {
      return NextResponse.json({ error: '部門不能為空' }, { status: 400 });
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
      name: trimmedName,
      phone: trimmedPhone,
      company: trimmedCompany,
      department: trimmedDepartment
    });

    await userRepo.save(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        company: newUser.company,
        department: newUser.department
      }
    });
  } catch (error) {
    console.error('用戶註冊錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤，請稍後再試' }, { status: 500 });
  }
}
