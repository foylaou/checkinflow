// /pages/api/logout.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", "", { maxAge: 0 }); // 清除 cookie
  return response;
}
