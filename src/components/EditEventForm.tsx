'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EventData {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number | null;
  event_type: string;
  location_validation: boolean;
  require_checkout: boolean;
  qrcode_url: string;
}

interface EditEventFormProps {
  eventId: string;
}

export default function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checkinCount, setCheckinCount] = useState(0);

  // 表單資料
  const [formData, setFormData] = useState<EventData>({
    id: 0,
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: null,
    event_type: '會議',
    location_validation: false,
    require_checkout: false,
    qrcode_url: ''
  });

  // 載入活動資料
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);

        if (!response.ok) {
          throw new Error('無法獲取活動資料');
        }

        const data = await response.json();

        // 格式化日期時間為 ISO 格式，用於 datetime-local 輸入
        const event = data.event;
        const formattedEvent = {
          ...event,
          start_time: formatDateForInput(event.start_time),
          end_time: formatDateForInput(event.end_time)
        };

        setFormData(formattedEvent);

        // 獲取簽到數量
        const statsResponse = await fetch(`/api/events/${eventId}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setCheckinCount(statsData.total || 0);
        }
      } catch (error) {
        console.error('獲取活動詳情錯誤:', error);
        setError(error instanceof Error ? error.message : '獲取活動資料失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // 格式化日期為輸入框所需格式
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // 格式為 "YYYY-MM-DDThh:mm"
  };

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
    } else if (name === 'max_participants') {
      // 處理人數限制，可以是數字或空值
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) : null
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // 驗證開始時間必須早於結束時間
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);

      if (endTime <= startTime) {
        throw new Error('結束時間必須晚於開始時間');
      }

      // 發送更新請求
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新活動失敗');
      }

      // 成功更新
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/event/${eventId}`);
      }, 1500);
    } catch (error) {
      console.error('更新活動錯誤:', error);
      setError(error instanceof Error ? error.message : '更新活動時發生錯誤');
    } finally {
      setSubmitting(false);
    }
  };

  // 刪除活動
  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '刪除活動失敗');
      }

      // 成功刪除，導航回儀表板
      router.push('/dashboard');
    } catch (error) {
      console.error('刪除活動錯誤:', error);
      setError(error instanceof Error ? error.message : '刪除活動時發生錯誤');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">編輯活動</h1>
        <Link
          href={`/dashboard/event/${eventId}`}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          返回活動詳情
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          活動已成功更新，即將返回活動頁面...
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
              value={formData.description || ''}
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
                value={formData.max_participants || ''}
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

          {/* QR Code 預覽 */}
          {formData.qrcode_url && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-md font-medium text-gray-700 mb-2">活動 QR Code</h3>
              <div className="flex justify-center">
                <img
                  src={formData.qrcode_url}
                  alt="活動 QR Code"
                  className="h-48 w-48 object-contain"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                此 QR Code 在更新活動後不會改變
              </p>
            </div>
          )}

          {/* 提交按鈕 */}
          <div className="pt-4 flex space-x-3">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? '更新中...' : '更新活動'}
            </button>

            <Link
              href={`/dashboard/event/${eventId}`}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
            >
              取消
            </Link>
          </div>

          {/* 刪除活動區塊 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">危險操作區</h3>

            {!showDeleteConfirm ? (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  刪除操作將永久移除此活動及其相關資訊，此操作無法撤銷。
                  {checkinCount > 0 && (
                    <span className="block mt-1 text-red-600">
                      此活動已有 {checkinCount} 人簽到，刪除活動將同時刪除所有簽到記錄！
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  刪除此活動
                </button>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <p className="text-red-700 font-medium mb-4">確定要刪除此活動嗎？</p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                      deleting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {deleting ? '刪除中...' : '確認刪除'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
