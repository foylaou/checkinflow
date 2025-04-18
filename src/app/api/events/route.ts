import { NextRequest, NextResponse } from 'next/server';
import { getEventRepository } from '@/lib/typeorm/db-utils';
import QRCode from 'qrcode';
import { saveFile } from '@/lib/storage';

// 日誌函數
function logWithTimestamp(message: string, ...args: any[]) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
}

// 獲取所有活動（保持不變）
export async function GET(request: NextRequest) {
  try {
    const eventRepo = await getEventRepository();

    const events = await eventRepo.find({
      order: {
        start_time: 'DESC'
      }
    });

    const formattedEvents = await Promise.all(events.map(async (event) => {
      const checkinCount = await eventRepo.manager.count('checkins', {
        where: {
          event_id: event.id
        }
      });

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        qrcode_url: event.qrcode_url,
        created_by: event.created_by,
        checkins: checkinCount
      };
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    logWithTimestamp('獲取活動錯誤:', error);
    return NextResponse.json({
      error: '獲取活動失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 創建新活動
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, description, start_time, end_time, location,
      max_participants, event_type, location_validation,
      require_checkout, created_by
    } = body;

    // 驗證必要欄位
    if (!name || !start_time || !end_time || !created_by) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    // 驗證時間
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (endDate <= startDate) {
      return NextResponse.json({ error: '結束時間必須晚於開始時間' }, { status: 400 });
    }

    const eventRepo = await getEventRepository();

    // 創建新活動
    const newEvent = eventRepo.create({
      name,
      description,
      start_time: startDate,
      end_time: endDate,
      location,
      max_participants: max_participants ? parseInt(max_participants) : undefined,
      event_type: event_type || '會議',
      location_validation: location_validation || false,
      require_checkout: require_checkout || false,
      created_by
    });

    const savedEvent = await eventRepo.save(newEvent);

    // 生成 QR Code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const eventUrl = `${baseUrl}/event/${savedEvent.id}`;

    try {
      // 生成 QR Code 並轉換為 Buffer
      const qrCodeBuffer = await generateQRCodeBuffer(eventUrl);

      // 使用通用的儲存服務保存檔案
      const qrCodeFileName = `event_qr_${savedEvent.id}.png`;
      const qrCodeUrl = await saveFile(qrCodeFileName, qrCodeBuffer, 'qrcodes');

      logWithTimestamp('QR Code 生成成功，URL:', qrCodeUrl);

      // 更新事件的 QR Code URL
      savedEvent.qrcode_url = qrCodeUrl;
      await eventRepo.save(savedEvent);
    } catch (qrError) {
      logWithTimestamp('QR Code 生成錯誤:', qrError);

      // 即使 QR Code 生成失敗，仍返回活動信息
      return NextResponse.json({
        success: true,
        event: savedEvent,
        error: 'QR Code 生成失敗',
        qrCodeError: qrError instanceof Error ? qrError.message : String(qrError)
      }, { status: 207 }); // 使用部分成功的狀態碼
    }

    return NextResponse.json({
      success: true,
      event: savedEvent,
      eventUrl
    });
  } catch (error) {
    logWithTimestamp('創建活動錯誤:', error);
    return NextResponse.json({
      error: '活動創建失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 輔助函數：生成 QR Code 並返回 Buffer
async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 1
    }, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}
