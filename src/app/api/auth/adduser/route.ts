// /pages/api/adduser.ts
import { NextResponse } from 'next/server';
import { AppDataSource } from "@/lib/typeorm/data-source";
import { Admin } from '@/lib/typeorm/entities/Admin';

import argon2 from "argon2";
import {cookies} from "next/headers";
import {verify} from "jsonwebtoken";

export interface UserForm {
    username: string;
    password: string;
    name: Auth;
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
type Auth = "系統管理員" | "管理員";

export async function POST(req: Request) {
    try {
        // 檢查當前用戶是否有權限
        const cookieStore =await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) {
          return NextResponse.json({ error: '未授權，請先登入' }, { status: 401 });
        }
        const decoded = verify(token, JWT_SECRET) as { id: number; username: string; role: string };
            // 檢查是否具有管理員角色
        if (!['系統管理員'].includes(decoded.role)) {
          return NextResponse.json({ error: '權限不足' }, { status: 403 });
        }

        // 解析請求體
        const body = await req.json() as UserForm;

        // 基本驗證
        if (!body.username || !body.password || !body.name) {
            return NextResponse.json(
                { error: "所有欄位都是必填的" },
                { status: 400 }
            );
        }

        // 檢查用戶名是否已存在
        const adminRepository = AppDataSource.getRepository(Admin);
        const existingAdmin = await adminRepository.findOne({
            where: { username: body.username }
        });

        if (existingAdmin) {
            return NextResponse.json(
                { error: "該用戶名已被使用" },
                { status: 409 }
            );
        }

        const hashedPassword = await argon2.hash(body.password, {
          type: argon2.argon2id,
          timeCost: 2,
          memoryCost: 32768,
          parallelism: 2
        });
        // 創建新管理員
        const newAdmin = new Admin();
        newAdmin.username = body.username;
        newAdmin.password = hashedPassword;
        newAdmin.name = body.name;

        // 保存到數據庫
        await adminRepository.save(newAdmin);

        // 返回成功響應（不包含密碼）
        const { password, ...adminWithoutPassword } = newAdmin;
        return NextResponse.json(
            {
                message: "管理員創建成功",
                admin: adminWithoutPassword
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("創建管理員時出錯:", error);
        return NextResponse.json(
            { error: "創建管理員時發生錯誤" },
            { status: 500 }
        );
    }
}
