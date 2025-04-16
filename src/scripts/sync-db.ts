import "reflect-metadata";
import { initializeDatabase } from "../lib/typeorm/data-source";

const syncDatabase = async () => {
  try {
    // 初始化數據庫連接
    const dataSource = await initializeDatabase();

    // 確保數據庫結構同步（相當於 synchronize: true）
    // 警告：此操作在生產環境可能危險，可能導致數據丟失
    await dataSource.synchronize();

    console.log("數據庫結構同步成功");
  } catch (error) {
    console.error("數據庫結構同步失敗:", error);
  } finally {
    process.exit(0);
  }
};

// 執行同步
syncDatabase();
