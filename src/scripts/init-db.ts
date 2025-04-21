// scripts/init-db.cjs
import "reflect-metadata"; // ✅
import { initializeDatabase } from "../lib/typeorm/data-source";
import { Admin } from "../lib/typeorm/entities/Admin";
import argon2 from "argon2";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // 可省略 path 預設也會讀取
const initializeAdminAccount = async () => {
  try {
    // 初始化數據庫連接
    const dataSource = await initializeDatabase();
    const adminRepository = dataSource.getRepository(Admin);

    // 檢查是否已存在管理員
    const adminCount = await adminRepository.count();
    if (adminCount > 0) {
      console.log("管理員帳號已存在，不進行初始化");
      return;
    }

    const defaultAdmin = new Admin();
    defaultAdmin.username =  process.env.USERNAME||"admin";
    const hashedPassword = await argon2.hash(process.env.PASSWORD||"admin1532698", {
      type: argon2.argon2id,
      timeCost: 2,
      memoryCost: 32768,
      parallelism: 2
    });
    defaultAdmin.password = hashedPassword;
    defaultAdmin.name = "系統管理員";

    await adminRepository.save(defaultAdmin);
    console.log("初始管理員帳號創建成功");

  } catch (error) {
    console.error("初始化管理員帳號失敗:", error);
  } finally {
    process.exit(0);
  }
};

// 執行初始化
initializeAdminAccount();
