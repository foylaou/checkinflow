// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Event } from "./entities/Event";
import { User } from "./entities/User";
import { Admin } from "./entities/Admin";
import { Checkin } from "./entities/Checkin";
import * as dotenv from "dotenv";

// ✅ 載入 .env.local（會自動 fallback 到 .env）
dotenv.config({ path: ".env.local" }); // 可省略 path 預設也會讀取

console.log("📦 TypeORM 設定：", {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  entities: [Event.name, User.name, Admin.name,Checkin.name]
});
export const AppDataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "1433"),
  username: process.env.DB_USERNAME || "sa",
  password: process.env.DB_PASSWORD || "YourStrongPassword",
  database: process.env.DB_DATABASE || "checkinflow",
  synchronize: process.env.NODE_ENV !== "production", // 開發環境自動同步資料庫結構
  logging: process.env.NODE_ENV !== "production",
  entities: [Event, User, Admin, Checkin],
  options: {
    encrypt: true,                    // ✅ MSSQL 預設為加密，仍需保留
    trustServerCertificate: true     // ✅ 允許自簽憑證
  },
  extra: {
    // 連接池設置
    poolSize: 10,
  },
});

// 初始化連接
export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection initialized");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// 獲取已初始化的數據源
export const getDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    await initializeDatabase();
  }
  return AppDataSource;
};
