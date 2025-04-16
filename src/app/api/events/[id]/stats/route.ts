import { NextRequest, NextResponse } from 'next/server';
import { getCheckinRepository, getEventRepository } from '@/lib/typeorm/db-utils';
import { IsNull, Not } from 'typeorm'; // 引入 TypeORM 的操作符

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: '無效的活動 ID' }, { status: 400 });
    }

    // 確認活動存在
    const eventRepo = await getEventRepository();
    const event = await eventRepo.findOne({ where: { id: eventId } });

    if (!event) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    // 獲取簽到資料
    const checkinRepo = await getCheckinRepository();

    // 總簽到人數
    const total = await checkinRepo.count({ where: { event_id: eventId } });

    // 如果活動需要簽退，獲取更詳細的統計
    let checked_in = 0;
    let checked_out = 0;

    if (event.require_checkout) {
      // 已簽到但尚未簽退的人數
      checked_in = await checkinRepo.count({
        where: {
          event_id: eventId,
          checkout_time: IsNull() // 使用 IsNull 操作符
        }
      });

      // 已簽退的人數
      checked_out = await checkinRepo.count({
        where: {
          event_id: eventId,
          checkout_time: Not(IsNull()) // 使用 Not(IsNull()) 操作符
        }
      });
    }

    return NextResponse.json({
      total,
      checked_in,
      checked_out
    });
  } catch (error) {
    console.error('獲取活動統計錯誤:', error);
    return NextResponse.json({
      error: '獲取活動統計失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
