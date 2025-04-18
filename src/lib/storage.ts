// lib/storage.ts
import fs from 'fs/promises';
import path from 'path';

// 確保目錄存在
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`目錄創建成功: ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`目錄創建失敗: ${dirPath}`, error);
    throw error;
  }
}

/**
 * 保存檔案到儲存系統
 * @param fileName 檔案名稱
 * @param content 檔案內容 (Buffer)
 * @param directory 子目錄名稱
 * @returns 檔案的訪問 URL
 */
export async function saveFile(fileName: string, content: Buffer, directory: string = 'qrcodes') {
  // 檢查環境變數，判斷使用本地儲存還是外部儲存
  const storageType = process.env.STORAGE_TYPE || 'local';

  if (storageType === 'local') {
    // 本地開發環境：儲存至檔案系統
    const dir = path.join(process.cwd(), 'files', directory);

    // 確保目錄存在
    await ensureDirectoryExists(dir);

    // 儲存檔案
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, content);

    // 返回相對 URL 路徑
    return `/files/${directory}/${fileName}`;
  } else {
    // 生產環境：儲存至外部服務
    console.log(`使用外部儲存，儲存檔案: ${directory}/${fileName}`);

    // 根據你選擇的外部儲存服務，實現相應的上傳邏輯

    // 如果使用 AWS S3
    if (process.env.STORAGE_SERVICE === 's3') {
      try {
        // 這裡需要安裝 AWS SDK：npm install @aws-sdk/client-s3
        const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

        const s3Client = new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
        });

        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${directory}/${fileName}`,
          Body: content,
          ContentType: 'image/png'
        }));

        // 如果配置了 CloudFront 或自定義網域
        if (process.env.EXTERNAL_STORAGE_URL) {
          return `${process.env.EXTERNAL_STORAGE_URL}/${directory}/${fileName}`;
        }

        // 標準 S3 URL
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${directory}/${fileName}`;
      } catch (error) {
        console.error('S3 上傳失敗:', error);
        throw error;
      }
    }

    // 如果使用其他儲存服務，例如 Firebase Storage
    if (process.env.STORAGE_SERVICE === 'firebase') {
      // Firebase Storage 實現...
      // 需要安裝 firebase-admin: npm install firebase-admin
      throw new Error('Firebase 儲存尚未實現');
    }

    // 臨時解決方案：如果未配置外部儲存，退回到本地儲存
    console.warn('警告: 未配置外部儲存服務，退回到本地儲存');

    // 和本地環境相同的實現
    const dir = path.join(process.cwd(), 'files', directory);
    await ensureDirectoryExists(dir);
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, content);

    return `/files/${directory}/${fileName}`;
  }
}

/**
 * 從儲存系統獲取檔案
 * @param filePath 檔案路徑
 * @returns 檔案內容的 Buffer，如果檔案不存在則返回 null
 */
export async function getFile(filePath: string) {
  // 移除開頭的斜線
  filePath = filePath.replace(/^\/+/, '');

  // 檢查環境變數，判斷使用本地儲存還是外部儲存
  const storageType = process.env.STORAGE_TYPE || 'local';

  if (storageType === 'local') {
    // 本地開發環境：從檔案系統讀取
    try {
      const fullPath = path.join(process.cwd(), filePath);
      return await fs.readFile(fullPath);
    } catch (error) {
      console.error(`讀取檔案失敗: ${filePath}`, error);
      return null;
    }
  } else {
    // 生產環境：從外部服務讀取
    console.log(`使用外部儲存，讀取檔案: ${filePath}`);

    // 如果使用 AWS S3
    if (process.env.STORAGE_SERVICE === 's3') {
      try {
        const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

        const s3Client = new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
        });

        // 移除開頭的 'files/'
        const s3Key = filePath.replace(/^files\//, '');

        const response = await s3Client.send(new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: s3Key
        }));

        // 將 S3 響應轉換為 Buffer
        const chunks = [];
        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }

        return Buffer.concat(chunks);
      } catch (error) {
        console.error('S3 讀取失敗:', error);
        return null;
      }
    }

    // 如果使用外部 URL
    if (process.env.EXTERNAL_STORAGE_URL) {
      try {
        // 移除開頭的 'files/'
        const externalPath = filePath.replace(/^files\//, '');
        const url = `${process.env.EXTERNAL_STORAGE_URL}/${externalPath}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP 錯誤 ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (error) {
        console.error('外部儲存讀取失敗:', error);
        return null;
      }
    }

    // 臨時解決方案：如果未配置外部儲存，退回到本地讀取
    console.warn('警告: 未配置外部儲存服務，退回到本地讀取');

    try {
      const fullPath = path.join(process.cwd(), filePath);
      return await fs.readFile(fullPath);
    } catch (error) {
      console.error(`讀取檔案失敗: ${filePath}`, error);
      return null;
    }
  }
}
