'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);

  // 表單資料
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: '',
    event_type: '會議',
    location_validation: false,
    require_checkout: false
  });

  // 檢查管理員是否已登入
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (!response.ok) {
          throw new Error('未登入或登入已過期');
        }

        setAdminId(data.admin.id);
      } catch (error) {
        // 重定向到登入頁面
        Error(error as string);
        router.push('/login');
      }
    };

    checkAdmin();
  }, [router]);

  // 處理表單欄位變更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // 處理複選框
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminId) {
      setError('管理員身份驗證失敗，請重新登入');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 準備提交的資料
      const eventData = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        created_by: adminId
      };

      // 送出 API 請求
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '建立活動失敗');
      }

      // 成功建立活動後導航到儀表板
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : '建立活動時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">建立新活動</h1>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          返回儀表板
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-6">
          {/* 活動名稱 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              活動名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 活動描述 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              活動描述
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 活動時間 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                開始時間 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                required
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                結束時間 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                required
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 活動地點 */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              活動地點 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 活動類型和人數限制 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
                活動類型
              </label>
              <select
                id="event_type"
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="會議">會議</option>
                <option value="研討會">研討會</option>
                <option value="工作坊">工作坊</option>
                <option value="課程">課程</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-1">
                人數限制 (選填)
              </label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                min="1"
                value={formData.max_participants}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 簽到設定 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="location_validation"
                name="location_validation"
                checked={formData.location_validation}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="location_validation" className="ml-2 block text-sm text-gray-700">
                啟用位置驗證 (防止遠端打卡)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="require_checkout"
                name="require_checkout"
                checked={formData.require_checkout}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="require_checkout" className="ml-2 block text-sm text-gray-700">
                需要簽退 (記錄離開時間)
              </label>
            </div>
          </div>

          {/* 提交按鈕 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? '處理中...' : '建立活動'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
