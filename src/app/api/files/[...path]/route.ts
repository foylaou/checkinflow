// src/app/api/files/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';


// 使用 App Router 約定的命名導出
export async function GET(request: NextRequest, context: any) {
  try {
    const filePath = context.params.path.join('/');
    const fullPath = path.join(process.cwd(), 'files', filePath);

    // 檢查 process.cwd()
    console.log('當前工作目錄:', process.cwd());

    // 檢查檔案是否存在
    const fileExists = fs.existsSync(fullPath);
    console.log(`檔案存在: ${fileExists}`);

    if (!fileExists) {
      console.error(`檔案不存在: ${fullPath}`);
      return NextResponse.json(
        { error: '檔案未找到' },
        { status: 404 }
      );
    }

    // 獲取檔案資訊
    const stat = fs.statSync(fullPath);
    console.log('檔案狀態:', {
      size: stat.size,
      isFile: stat.isFile(),
    });

    if (!stat.isFile()) {
      console.error(`不是檔案: ${fullPath}`);
      return NextResponse.json(
        { error: '不是檔案' },
        { status: 400 }
      );
    }

    // 確定檔案類型
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.pdf') contentType = 'application/pdf';

    console.log('設定內容類型:', contentType);

    // 讀取檔案
    const fileBuffer = fs.readFileSync(fullPath);

    // 創建響應
    const response = new NextResponse(fileBuffer);

    // 設定標頭
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Length', String(fileBuffer.length));
    response.headers.set('Cache-Control', 'public, max-age=86400');

    return response;
  } catch (error) {
    console.error('檔案 API 錯誤:', error);
    return NextResponse.json(
      {
        error: '內部伺服器錯誤',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

