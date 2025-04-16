import {NextRequest, NextResponse} from "next/server";
import axios from "axios";
import {getUserRepository} from "@/lib/typeorm/db-utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // 活動ID

    if (!code) {
      return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
    }

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

    const { id_token } = tokenResponse.data;
    const decoded = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
    const lineUserId = decoded.sub;

    const userRepo = await getUserRepository();
    const user = await userRepo.findOne({ where: { line_user_id: lineUserId } });

    // 確定重定向的 URL
    let redirectUrl;
    if (user) {
      // 已註冊用戶直接到活動頁面
      redirectUrl = `/event/${state || ''}`;
    } else {
      // 新用戶到註冊頁面
      redirectUrl = `/register?lineId=${lineUserId}&eventId=${state || ''}`;
    }

    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // 設置 cookie，包括在新用戶和已存在用戶的情況下
    if (user) {
      response.cookies.set('userId', user.id.toString(), {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7
      });
    }

    return response;
  } catch (error) {
    console.error('LINE 登入處理錯誤:', error);
    return NextResponse.json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
