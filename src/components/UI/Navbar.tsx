"use client"
import Link from "next/link";
import { BaseStore } from "@/store/baseStore";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { isLoggedIn, initialized, role, checkLogin } = BaseStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 只在客戶端環境執行
    if (typeof window !== 'undefined') {
      checkLogin();
    }
  }, []);

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      checkLogin();
      router.push("/");
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  const AdminLinks = () => {
    return (
      <div className="hidden md:flex items-center space-x-4">
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-150 ease-in-out shadow-sm"
        >
          儀表板
        </Link>

          <Link
            href="/user"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-150 ease-in-out shadow-sm"
          >
            人員管理
          </Link>

        <button
          onClick={() => logout()}
          className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-150 ease-in-out shadow-sm"
        >
          登出
        </button>
      </div>
    );
  };

  const MobileMenu = () => {
    return (
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-16 right-0 left-0 bg-white shadow-lg z-10`}>
        <div className="px-4 py-3 space-y-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-center"
              >
                儀表板
              </Link>
              {/* 只有系統管理者可以看到人員管理連結 */}

                <Link
                  href="/user"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-center"
                >
                  人員管理
                </Link>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md text-center"
              >
                登出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-center"
            >
              管理員登入
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 導航欄 */}
      <nav className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center relative">
          <Link href="/" className="flex items-center group">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600 group-hover:text-indigo-700 transition duration-150">
                CheckinFlow
              </h1>
              <span className="ml-2 text-gray-500 hidden sm:inline">活動簽到系統</span>
            </div>
          </Link>

          {/* 只在初始化完成後顯示內容，避免水合不一致 */}
          {initialized ? (
            <>
              {/* 桌面選單 */}
              {isLoggedIn ? (
                <AdminLinks />
              ) : (
                <div className="hidden md:block">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-150 ease-in-out shadow-sm"
                  >
                    管理員登入
                  </Link>
                </div>
              )}

              {/* 行動裝置選單按鈕 */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">開啟選單</span>
                  {mobileMenuOpen ? (
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>

              {/* 行動裝置選單 */}
              <MobileMenu />
            </>
          ) : (
            // 在初始化過程中顯示佔位元素
            <div className="h-10 w-32"></div>
          )}
        </div>
      </nav>
    </>
  );
}
