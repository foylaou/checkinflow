'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 使用 axios 發送登入請求
      const response = await axios.post('/api/auth/login',
        { username, password },  // 這是請求體
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // axios 成功響應直接返回 data
      const data = response.data;

      // 登入成功，導向儀表板
      router.push('/dashboard');
    } catch (error) {
      // axios 錯誤處理
      if (axios.isAxiosError(error) && error.response) {
        // 服務器返回的錯誤信息
        setError(error.response.data.error || '登入失敗');
      } else {
        // 其他錯誤
        setError(error instanceof Error ? error.message : '登入發生錯誤');
      }
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">CheckinFlow 管理員登入</h1>
          <p className="mt-2 text-gray-600">請輸入您的管理員帳號和密碼</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              帳號
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              登入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
