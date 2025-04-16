// src/app/event/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EventDetails {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  location_validation?: boolean;
}

interface User {
  id: number;
  name: string;
}

export default function EventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkinStatus, setCheckinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isLineLoggedIn, setIsLineLoggedIn] = useState(false);

  const router = useRouter();
  const eventId = params.id;

  // 檢查用戶是否登入
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      // 已登入，獲取用戶資料
      fetchUserData(userId);
      setIsLineLoggedIn(true);
    } else {
      setLoading(false);
    }
  }, []);

  // 獲取活動詳情
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('無法獲取活動資訊');
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (error) {
        setError('獲取活動資訊失敗');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('無法獲取用戶資料');
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      // 用戶資料獲取失敗，清除 localStorage
      localStorage.removeItem('userId');
      setIsLineLoggedIn(false);
    }
  };

  const handleLineLogin = () => {
      if (process.env.NEXT_PUBLIC_LINE_CHANNEL_ID&&process.env.NEXT_PUBLIC_LINE_CALLBACK_URL) {
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_LINE_CALLBACK_URL)}&state=${eventId}&scope=profile`;
    window.location.href = lineLoginUrl;
    }
    // 重定向到 LINE 登入頁面
  };

  const handleCheckin = async () => {
    if (!user || !event) return;

    setCheckinStatus('loading');

    try {
      // 獲取地理位置（如果活動需要）
      let geolocation = null;
      if (event.location_validation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        geolocation = `${position.coords.latitude},${position.coords.longitude}`;
      }

      // 送出打卡請求
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          event_id: event.id,
          geolocation
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '打卡失敗');
      }

      setCheckinStatus('success');
    } catch (error) {
      console.error('打卡錯誤:', error);
      setCheckinStatus('error');
      setError(error instanceof Error ? error.message : '打卡發生錯誤');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">載入中...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md w-full text-center">
          <p className="font-bold">錯誤</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">活動不存在</h2>
          <p className="text-gray-600">找不到此活動或活動已刪除</p>
        </div>
      </div>
    );
  }

  // 打卡成功畫面
  if (checkinStatus === 'success') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-green-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">打卡成功！</h2>
          <p className="text-gray-600 mb-6">您已成功簽到「{event.name}」活動</p>
          <p className="text-sm text-gray-500">打卡時間: {new Date().toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <p className="text-gray-600 mb-4">{event.description}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium">活動時間</p>
                <p className="text-gray-600">
                  {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-medium">活動地點</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>
          </div>

          {isLineLoggedIn && user ? (
            // 已使用 LINE 登入
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">簽到人員</p>
                <p>{user.name}</p>
              </div>

              <button
                onClick={handleCheckin}
                disabled={checkinStatus === 'loading'}
                className={`w-full py-3 rounded-lg font-medium text-white ${
                  checkinStatus === 'loading' 
                    ? 'bg-gray-400' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {checkinStatus === 'loading' ? '處理中...' : '立即簽到'}
              </button>

              {checkinStatus === 'error' && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
                  {error || '簽到失敗，請重試'}
                </div>
              )}
            </div>
          ) : (
            // 未登入，顯示 LINE 登入按鈕
            <div className="text-center space-y-4">
              <p className="text-gray-600">請使用 LINE 帳號登入進行簽到</p>

              <button
                onClick={handleLineLogin}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.71v1.125h1.655c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.287c-.349 0-.632-.285-.632-.629V10.13c0-.346.283-.631.632-.631h2.287zM14.446 9.92c0-.188.274-.511.627-.511.354 0 .629.323.629.511V13.5c0 .188-.275.512-.629.512-.351 0-.627-.324-.627-.512V9.92zm-3.686 0v2.279l-1.568-2.117c-.076-.101-.151-.162-.226-.162h-.028c-.075 0-.151.061-.226.162L7.141 12.2V9.92c0-.188.274-.511.628-.511.351 0 .628.323.628.511v3.168c0 .246-.276.511-.628.511h-.05c-.051 0-.124-.02-.175-.071L5.57 11.365l-1.974 2.163c-.05.051-.124.071-.176.071h-.049c-.352 0-.629-.265-.629-.511V9.92c0-.188.276-.511.629-.511.352 0 .628.323.628.511V12.2l1.568-2.118c.076-.101.15-.162.226-.162h.026c.076 0 .15.061.227.162l1.569 2.118V9.92zm14.859-.631C23.801 4.276 18.533 0 12.236 0 5.498 0 0 4.641 0 10.385c0 5.126 4.552 9.429 10.697 10.241.416.091.984.276 1.128.635.129.326.084.832.042 1.159 0 0-.151 1.249-.184 1.515-.16.391-.274.775-.764.359-.211-.183-1.026-.84-1.765-1.444-4.918-4.013-8.06-7.896-8.06-13.466 0-5.086 5.083-9.22 11.35-9.22 6.268 0 11.35 4.134 11.35 9.22 0 5.125-3.405 9.525-8.027 11.214-.232.084-.343-.167-.232-.341.65-1.022 1.342-2.232 1.678-3.327.084-.276.433-.126.432-.126" />
                </svg>
                使用 LINE 登入
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
