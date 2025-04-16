import { NextRequest, NextResponse } from 'next/server';
import { getCheckinRepository, getEventRepository } from '@/lib/typeorm/db-utils';

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

    const checkinRepo = await getCheckinRepository();
    const checkins = await checkinRepo.find({
      where: { event: { id: eventId } },
      relations: ['user'], // 確保關聯用戶資訊被載入
      order: { checkin_time: 'DESC' }
    });

    return NextResponse.json({
      checkins: checkins.map(checkin => ({
        id: checkin.id,
        user: {
          name: checkin.user.name,
          phone: checkin.user.phone,
          company: checkin.user.company,
          department: checkin.user.department
        },
        checkin_time: checkin.checkin_time,
        checkout_time: checkin.checkout_time,
        status: checkin.status,
        geolocation: checkin.geolocation
      }))
    });

  } catch (error) {
    console.error('獲取簽到記錄錯誤:', error);
    return NextResponse.json({
      error: '獲取簽到記錄失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
