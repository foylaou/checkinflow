// app/api/checkins/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCheckinRepository, getUserRepository, getEventRepository } from '@/lib/typeorm/db-utils';

export async function POST(request: NextRequest) {
  try {
    const { user_id, event_id, geolocation } = await request.json();

    // 驗證必要參數
    if (!user_id || !event_id) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    const userRepo = await getUserRepository();
    const eventRepo = await getEventRepository();
    const checkinRepo = await getCheckinRepository();

    // 檢查用戶是否存在
    const user = await userRepo.findOne({ where: { id: user_id } });
    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    // 檢查活動是否存在
    const event = await eventRepo.findOne({ where: { id: event_id } });
    if (!event) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 });
    }

    // 檢查是否已經簽到
    const existingCheckin = await checkinRepo.findOne({
      where: {
        user_id,
        event_id,
        is_valid: true
      }
    });

    if (existingCheckin) {
      return NextResponse.json({ error: '您已經簽到過了' }, { status: 400 });
    }

    // 創建簽到記錄
    const checkin = checkinRepo.create({
      user_id,
      event_id,
      geolocation: geolocation || null,
      checkin_time: new Date(),
      status: '出席', // 預設狀態
      is_valid: true
    });

    const savedCheckin = await checkinRepo.save(checkin);

    return NextResponse.json({
      success: true,
      message: '簽到成功',
      checkin: {
        id: savedCheckin.id,
        checkin_time: savedCheckin.checkin_time,
        status: savedCheckin.status
      }
    });

  } catch (error) {
    console.error('簽到錯誤:', error);
    return NextResponse.json({
      error: '伺服器錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
