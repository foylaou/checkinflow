'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Event {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  location: string;
  qrcode_url: string;
  checkins: number;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 檢查管理員是否已登入
    const checkAdmin = async () => {
      try {
        const authResponse = await fetch('/api/auth/check');
        if (!authResponse.ok) {
          throw new Error('未登入或登入已過期');
        }

        // 獲取活動列表
        const eventsResponse = await fetch('/api/events');
        if (!eventsResponse.ok) {
          throw new Error('獲取活動列表失敗');
        }

        const data = await eventsResponse.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Dashboard 錯誤:', error);
        if (error instanceof Error && error.message === '未登入或登入已過期') {
          // 未登入，重定向到登入頁面
          router.push('/login');
        } else {
          setError('獲取資料時發生錯誤');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventActive = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">活動管理儀表板</h1>
        <div className="flex space-x-2">
          <Link
            href="/dashboard/create-event"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            創建新活動
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            登出
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2">載入中...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium">尚未創建任何活動</p>
          <p className="text-gray-500 mt-2">點擊「創建新活動」按鈕來開始</p>
          <Link
            href="/dashboard/create-event"
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            創建第一個活動
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg overflow-hidden shadow-md bg-white">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{event.name}</h2>
                  {isEventActive(event.start_time, event.end_time) && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">進行中</span>
                  )}
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">
                      {formatDateTime(event.start_time)} ~ {formatDateTime(event.end_time)}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600">{event.location}</span>
                  </div>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-600">簽到人數: {event.checkins}</span>
                  </div>
                </div>
              </div>

              <div className="border-t p-4 bg-gray-50 flex justify-between">
                <Link href={`/dashboard/event/${event.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  檢視活動
                </Link>

                <div className="flex space-x-3">
                  <Link href={`/dashboard/event/${event.id}/qrcode`} className="text-gray-600 hover:text-gray-800">
                    QR Code
                  </Link>
                  <Link href={`/dashboard/event/${event.id}/checkins`} className="text-green-600 hover:text-green-800">
                    簽到記錄
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
