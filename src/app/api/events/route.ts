import { NextRequest, NextResponse } from 'next/server';
import { getEventRepository } from '@/lib/typeorm/db-utils';
import QRCode from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';

// 日誌函數
function logWithTimestamp(message: string, ...args: any[]) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
}

// 確保目錄存在
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logWithTimestamp(`目錄創建成功: ${dirPath}`);
  } catch (error) {
    logWithTimestamp(`目錄創建失敗: ${dirPath}`, error);
    throw error;
  }
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

    await eventRepo.save(newEvent);

    // 生成 QR Code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const eventUrl = `${baseUrl}/event/${newEvent.id}`;

    // 確保 QR Code 目錄存在
    const qrCodeDir = path.join(process.cwd(), 'files', 'qrcodes');

    try {
      // 創建目錄（包括巢狀目錄）
      await ensureDirectoryExists(qrCodeDir);

      // 詳細目錄日誌
      logWithTimestamp('QR Code 目錄:', qrCodeDir);
      logWithTimestamp('當前工作目錄:', process.cwd());
    } catch (dirError) {
      logWithTimestamp('QR Code 目錄創建失敗:', dirError);
      return NextResponse.json({
        success: false,
        error: 'QR Code 目錄創建失敗',
        details: dirError instanceof Error ? dirError.message : String(dirError)
      }, { status: 500 });
    }

    // 生成 QR Code 並儲存為文件
    const qrCodeFileName = `event_qr_${newEvent.id}.png`;
    const qrCodeFilePath = path.join(qrCodeDir, qrCodeFileName);

    try {
      // 生成 QR Code 並儲存為文件
      await QRCode.toFile(qrCodeFilePath, eventUrl, {
        errorCorrectionLevel: 'H',
        width: 300
      });

      logWithTimestamp('QR Code 生成成功:', qrCodeFilePath);

      // 更新事件的 QR Code URL（存儲相對路徑）
      newEvent.qrcode_url = `/files/qrcodes/${qrCodeFileName}`;
      await eventRepo.save(newEvent);

      logWithTimestamp('事件 QR Code URL:', newEvent.qrcode_url);
    } catch (qrError) {
      logWithTimestamp('QR Code 生成錯誤:', qrError);

      // 即使 QR Code 生成失敗，仍返回活動信息
      return NextResponse.json({
        success: true,
        event: newEvent,
        error: 'QR Code 生成失敗',
        qrCodeError: qrError instanceof Error ? qrError.message : String(qrError)
      }, { status: 207 }); // 使用部分成功的狀態碼
    }

    return NextResponse.json({
      success: true,
      event: newEvent,
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
