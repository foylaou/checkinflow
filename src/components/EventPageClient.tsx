// src/components/EventPageClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import CheckinSuccess from '@/components/CheckinSuccess';
import EventDetails from '@/components/EventDetails';
import CheckinForm from '@/components/CheckinForm';
import LineLoginButton from '@/components/LineLoginButton';

interface EventDetails {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  location_validation?: boolean;
  require_checkout?: boolean;
}

interface User {
  id: number;
  name: string;
}

interface EventPageClientProps {
  eventId: string;
}

export default function EventPageClient({ eventId }: EventPageClientProps) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkinStatus, setCheckinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isLineLoggedIn, setIsLineLoggedIn] = useState(false);

useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      // 同時檢查 localStorage 和 cookie
      const userIdFromLocalStorage = localStorage.getItem('userId');
      const userIdFromCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userId='))
        ?.split('=')[1];

      const userId = userIdFromLocalStorage || userIdFromCookie;

      if (userId) {
        try {
          const response = await fetch('/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });

          if (response.ok) {
            console.log(response);
            const userData = await response.json();
            setUser(userData.user);
            setIsLineLoggedIn(true);

            // 同步 localStorage 和 cookie
            localStorage.setItem('userId', userId);
            document.cookie = `userId=${userId}; path=/; max-age=${7 * 24 * 60 * 60}`;
          } else {
            // 清除所有登入痕跡
            localStorage.removeItem('userId');
            document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setIsLineLoggedIn(false);
          }
        } catch (verifyError) {
          console.error('用戶驗證失敗:', verifyError);
          localStorage.removeItem('userId');
          document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          setIsLineLoggedIn(false);
        }
      }
    } catch (error) {
      console.error('檢查登入狀態失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  checkLoginStatus();
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

  const _fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('無法獲取用戶資料');
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      localStorage.removeItem('userId');
      setIsLineLoggedIn(false);
    }
  };

    const handleLineLogin = () => {
      const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
      const callbackUrl = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL;

      if (!channelId || !callbackUrl) {
        setError('LINE 登入設定不完整，請聯絡管理員');
        return;
      }

      const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${callbackUrl}&state=${eventId}&scope=openid%20profile`;
      window.location.href = lineLoginUrl;
    };

  // 檢查活動是否在有效時間內
  const isEventAvailable = () => {
    if (!event) return false;
    const now = new Date();
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return now >= start && now <= end;
  };

  const handleCheckin = async () => {
    if (!user || !event) return;

    if (!isEventAvailable()) {
      setError('活動時間尚未開始或已結束，無法簽到');
      setCheckinStatus('error');
      return;
    }

    setCheckinStatus('loading');

    try {
      let geolocation = null;
      if (event.location_validation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          geolocation = `${position.coords.latitude},${position.coords.longitude}`;
        } catch (geoError) {
          Error(geoError as string)
          throw new Error('無法獲取位置資訊，請允許位置存取權限');
        }
      }

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
        const errorData = await response.json();
        throw new Error(errorData.error || '打卡失敗');
      }

      setCheckinStatus('success');
    } catch (error) {
      console.error('打卡錯誤:', error);
      setCheckinStatus('error');
      setError(error instanceof Error ? error.message : '打卡發生錯誤');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && checkinStatus !== 'error') {
    return <ErrorMessage message={error} />;
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

  if (checkinStatus === 'success') {
    return <CheckinSuccess eventName={event.name} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          {event.description && <p className="text-gray-600 mb-4">{event.description}</p>}

          <EventDetails
            startTime={event.start_time}
            endTime={event.end_time}
            location={event.location}
            requiresLocation={Boolean(event.location_validation)}
            isAvailable={isEventAvailable()}
          />

          {isLineLoggedIn && user ? (
            <CheckinForm
              userName={user.name}
              isAvailable={isEventAvailable()}
              onCheckin={handleCheckin}
              status={checkinStatus}
              error={error}
            />
          ) : (
            <LineLoginButton onLogin={handleLineLogin} />
          )}
        </div>
      </div>
    </div>
  );
}
