// scripts/init-db.cjs
import "reflect-metadata"; // ✅
import { initializeDatabase } from "../lib/typeorm/data-source";
import { Admin } from "../lib/typeorm/entities/Admin";
import argon2 from "argon2";

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

    // 創建默認管理員帳號
    const defaultAdmin = new Admin();
    defaultAdmin.username = "foylaou0326";
    const hashedPassword = await argon2.hash("t0955787053S", {
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
