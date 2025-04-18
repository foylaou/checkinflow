'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {BaseStore} from "@/store/baseStore";

interface Event {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  qrcode_url: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events/public');

        if (!response.ok) {
          throw new Error('獲取活動失敗');
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('獲取活動錯誤:', error);
        setError('無法載入活動資訊');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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

  return (
<>
      {/* 主要內容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">近期活動</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            掃描以下活動的 QR Code 參與簽到，或使用 LINE 掃描活動現場的 QR Code 進行簽到。
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
              {error}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700">目前沒有進行中的活動</h3>
            <p className="text-gray-500 mt-2">請稍後再查看或聯絡活動主辦方</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                    {isEventActive(event.start_time, event.end_time) && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">進行中</span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  )}

                  <div className="space-y-2 mb-6">
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
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-3 border rounded-lg mb-2">
                      {event.qrcode_url ? (
                      <Image
                        src={`/files/qrcodes/event_qr_${event.id}.png`}
                        alt="活動 QR Code"
                        className="w-48 h-48"
                        width={300}
                        height={300}
                      />
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center bg-gray-100">
                          <span className="text-gray-500 text-sm">QR Code 未提供</span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/event/${event.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      開啟簽到頁面
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      </>
  );
}
