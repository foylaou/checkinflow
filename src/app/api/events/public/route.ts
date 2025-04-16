import { NextRequest, NextResponse } from 'next/server';
import { getEventRepository } from '@/lib/typeorm/db-utils';

export async function GET(_request: NextRequest) {
  try {
    const eventRepo = await getEventRepository();

    // 獲取當前和未來的公開活動
    const currentDate = new Date();

    // 直接使用基本查詢，避免文本類型的排序問題
    const events = await eventRepo.createQueryBuilder('event')
      .where('event.end_time >= :currentDate', { currentDate })
      .orderBy('event.start_time', 'ASC')
      .getMany();

    // 格式化數據，僅返回需要的欄位
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      qrcode_url: event.qrcode_url
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('獲取公開活動錯誤:', error);
    return NextResponse.json({
      error: '獲取活動列表失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
