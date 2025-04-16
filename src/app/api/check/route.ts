import {NextRequest, NextResponse} from "next/server";
import {getUserRepository} from "@/lib/typeorm/db-utils";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // 更嚴格的 userId 驗證
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json({ error: '無效的用戶ID' }, { status: 400 });
    }

    const userRepo = await getUserRepository();

    // 檢查用戶是否存在
    const user = await userRepo.findOne({
      where: { id: parseInt(userId, 10) },
      select: ['id', 'name', 'line_user_id', 'phone', 'company', 'department']
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    return NextResponse.json({
      user,
      message: '用戶驗證成功'
    });

  } catch (error) {
    console.error('用戶狀態檢查錯誤:', error);
    return NextResponse.json({
      error: '伺服器錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
