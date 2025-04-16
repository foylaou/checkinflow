// 匯入 TypeORM 初始化設定
import { AppDataSource } from "../lib/typeorm/data-source";

// 初始化資料庫連線，供 CLI 指令（例如 migration:run / migration:generate）使用
AppDataSource.initialize()
  .then(() => {
    console.log("✅ 資料庫連線初始化成功！");
  })
  .catch((err) => {
    console.error("❌ 資料庫初始化失敗，錯誤如下：");
    console.error(err);

    // 若初始化失敗則直接結束執行，回傳失敗狀態碼給 CLI
    process.exit(1);
  });
