// src/app/api/auth/line/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getUserRepository } from '@/lib/typeorm/db-utils';
import { User } from '@/lib/typeorm/entities/User';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
    }

    // 交換授權碼取得 access token
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.LINE_CALLBACK_URL || 'http://localhost:3000/api/auth/line/callback',
      client_id: process.env.LINE_CHANNEL_ID || '',
      client_secret: process.env.LINE_CHANNEL_SECRET || ''
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, id_token } = tokenResponse.data;

    // 解析 ID Token 獲取用戶資料
    const decoded = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
    const lineUserId = decoded.sub;

    // 檢查用戶是否已存在
    const userRepo = await getUserRepository();
    let user = await userRepo.findOne({ where: { line_user_id: lineUserId } });

    if (user) {
      // 用戶已存在，直接返回用戶資料
      return NextResponse.redirect(new URL(`/event?userId=${user.id}`, request.url));
    } else {
      // 用戶不存在，重定向到註冊頁面
      return NextResponse.redirect(new URL(`/register?lineId=${lineUserId}`, request.url));
    }
  } catch (error) {
    console.error('LINE 登入處理錯誤:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
