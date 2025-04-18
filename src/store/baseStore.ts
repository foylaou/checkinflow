import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

// 建立 axios 實例
const api = axios.create({
  baseURL: '/api',  // API請求的基礎路徑
  timeout: 10000,   // 請求逾時設為10秒
})

// 定義管理員介面
interface Admin {
  id: number;
  username: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// 定義狀態介面
export interface BaseStoreState {
  role: string;
  isLoggedIn: boolean;                         // 是否登入
  initialized: boolean;                        // 是否已初始化
  admin: Admin | null;                         // 管理員資訊
  setIsLogin: (isLoggedIn: boolean) => void;   // 更新登入狀態
  setRole: (role: string) => void;             // 設置角色
  setAdmin: (admin: Admin | null) => void;     // 設置管理員資訊
  checkLogin: () => Promise<void>;             // 檢查登入狀態
  logout: () => Promise<void>;                 // 登出
}

// 建立 Zustand 狀態管理 store
export const BaseStore = create<BaseStoreState>()(
  persist(
    (set, get) => ({
      role: "",
      isLoggedIn: false,
      initialized: false,
      admin: null,

      setIsLogin: (isLoggedIn: boolean) => {
        set({ isLoggedIn })  // 設定登入狀態
      },

      setRole: (role: string) => {
        set({ role })  // 設定角色
      },

      setAdmin: (admin: Admin | null) => {
        set({ admin })  // 設定管理員資訊
      },

      checkLogin: async () => {
        // 如果當前處於服務器端渲染，不執行檢查
        if (typeof window === 'undefined') {
          return;
        }

        try {
          const response = await api.get("/auth/check", {
            // 允許所有狀態碼不拋出錯誤，我們將在代碼中處理
            validateStatus: function(status) {
              return status >= 200 && status < 600;
            }
          });

          if (response.status === 200 && response.data.authenticated === true) {
            // 成功驗證，更新所有相關狀態
            set({
              isLoggedIn: true,
              initialized: true,
              role: response.data.role,
              admin: response.data.admin || null
            });
          } else {
            // 未登入或驗證失敗
            set({
              isLoggedIn: false,
              initialized: true,
              role: "",
              admin: null
            });
          }
        } catch (error) {
          console.error("檢查登入狀態失敗:", error);
          // 發生錯誤時，將所有狀態重置
          set({
            isLoggedIn: false,
            initialized: true,
            role: "",
            admin: null
          });
        }
      },

      logout: async () => {
        try {
          await api.post("/logout");
          // 登出成功後重置狀態
          set({
            isLoggedIn: false,
            role: "",
            admin: null
          });
          return Promise.resolve();
        } catch (error) {
          console.error("登出失敗:", error);
          return Promise.reject(error);
        }
      }
    }),
    {
      name: 'base-store', // localStorage 的 key 名稱
      skipHydration: true, // 跳過自動水合，改為手動控制
    }
  )
);

// 在客戶端環境中手動初始化 store 水合
if (typeof window !== 'undefined') {
  // 確保我們是在客戶端
  const savedState = localStorage.getItem('base-store');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      const state = parsed.state;
      // 載入保存的狀態，但將 initialized 設為 false，確保還會調用 checkLogin
      BaseStore.setState({
        ...state,
        initialized: false
      });
    } catch (e) {
      console.error('解析存儲的狀態失敗:', e);
    }
  }

  // 初始化後立即檢查登入狀態
  BaseStore.getState().checkLogin();
}
