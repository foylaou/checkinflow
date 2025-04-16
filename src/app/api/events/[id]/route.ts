import { NextRequest, NextResponse } from 'next/server';
import { getEventRepository, getCheckinRepository } from '@/lib/typeorm/db-utils';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const eventId = segments[segments.indexOf('events') + 1];

    if (!eventId) {
      return NextResponse.json({ error: '無效的活動 ID' }, { status: 400 });
    }

    const eventRepo = await getEventRepository();
    const event = await eventRepo.findOne({ where: { id: eventId } });

    if (!event) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('獲取活動詳情錯誤:', error);
    return NextResponse.json({
      error: '獲取活動詳情失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const eventId = segments[segments.indexOf('events') + 1];

    if (!eventId) {
      return NextResponse.json({ error: '無效的活動 ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name, description, start_time, end_time, location,
      max_participants, event_type, location_validation,
      require_checkout
    } = body;

    // 驗證必要欄位
    if (!name || !start_time || !end_time) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    // 驗證時間
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (endDate <= startDate) {
      return NextResponse.json({ error: '結束時間必須晚於開始時間' }, { status: 400 });
    }

    const eventRepo = await getEventRepository();
    const event = await eventRepo.findOne({ where: { id: eventId } });

    if (!event) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    // 更新活動資訊
    event.name = name;
    event.description = description;
    event.start_time = startDate;
    event.end_time = endDate;
    event.location = location;
    event.max_participants = max_participants ? parseInt(max_participants.toString()) : undefined;
    event.event_type = event_type || '會議';
    event.location_validation = location_validation || false;
    event.require_checkout = require_checkout || false;

    await eventRepo.save(event);

    return NextResponse.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('更新活動錯誤:', error);
    return NextResponse.json({
      error: '更新活動失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const eventId = segments[segments.indexOf('events') + 1];

    if (!eventId) {
      return NextResponse.json({ error: '無效的活動 ID' }, { status: 400 });
    }

    const eventRepo = await getEventRepository();
    const checkinRepo = await getCheckinRepository();

    // 檢查活動是否存在
    const event = await eventRepo.findOne({ where: { id: eventId } });

    if (!event) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    // 檢查是否已有簽到記錄
    const checkinCount = await checkinRepo.count({
      where: {
        event: { id: eventId }
      }
    });

    if (checkinCount > 0) {
      return NextResponse.json({
        error: '此活動已有簽到記錄，無法刪除',
        checkinCount
      }, { status: 409 });
    }

    // 執行刪除
    await eventRepo.delete(eventId);

    return NextResponse.json({
      success: true,
      message: '活動已成功刪除'
    });
  } catch (error) {
    console.error('刪除活動錯誤:', error);
    return NextResponse.json({
      error: '刪除活動失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
