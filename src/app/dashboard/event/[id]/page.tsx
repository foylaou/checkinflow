'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface EventDetail {
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
  created_by: number;
  created_at: string;
}

interface CheckinStats {
  total: number;
  checked_in: number;
  checked_out: number;
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 檢查管理員是否已登入
    const checkAdminAndFetchData = async () => {
      try {
        // 檢查登入狀態
        const authResponse = await fetch('/api/auth/check');
        if (!authResponse.ok) {
          throw new Error('未登入或登入已過期');
        }

        // 獲取活動詳情
        const eventResponse = await fetch(`/api/events/${params.id}`);
        if (!eventResponse.ok) {
          throw new Error('獲取活動詳情失敗');
        }

        const eventData = await eventResponse.json();
        setEvent(eventData.event);

        // 獲取簽到統計
        const statsResponse = await fetch(`/api/events/${params.id}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('獲取數據錯誤:', error);
        if (error instanceof Error && error.message === '未登入或登入已過期') {
          router.push('/login');
        } else {
          setError('無法載入活動詳情');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [params.id, router]);

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventActive = () => {
    if (!event) return false;
    const now = new Date();
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return now >= start && now <= end;
  };

  const handleDownloadQRCode = () => {
    if (!event?.qrcode_url) return;

    // 創建一個臨時連結並觸發下載
    const link = document.createElement('a');
    link.href = event.qrcode_url;
    link.download = `${event.name}-QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintQRCode = () => {
    // 創建一個新窗口用於打印
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // 構建打印頁面內容
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${event?.name} - QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 20px;
              color: #666;
            }
            img {
              max-width: 300px;
              height: auto;
              border: 1px solid #ddd;
              padding: 10px;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${event?.name}</h1>
            <p>活動時間: ${formatDateTime(event?.start_time || '')} - ${formatDateTime(event?.end_time || '')}</p>
            <p>活動地點: ${event?.location || ''}</p>
            <img src="${event?.qrcode_url || ''}" alt="活動 QR Code">
            <p class="footer">掃描上方 QR Code 參與簽到</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          <Link href="/dashboard" className="text-red-600 underline mt-2 inline-block">
            返回儀表板
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
          <p>找不到活動</p>
          <Link href="/dashboard" className="text-yellow-600 underline mt-2 inline-block">
            返回儀表板
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          {isEventActive() && (
            <span className="ml-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              進行中
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/event/${event.id}/checkins`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            簽到記錄
          </Link>
          <Link
            href={`/dashboard/event/${event.id}/edit`}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            編輯活動
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 活動詳情 */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-5">
          <div>
            <h2 className="text-lg font-semibold border-b pb-2 mb-3">活動詳情</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium">活動時間</p>
                  <p className="text-gray-600">
                    {formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}
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

              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div>
                  <p className="font-medium">活動類型</p>
                  <p className="text-gray-600">{event.event_type}</p>
                </div>
              </div>

              {event.max_participants && (
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">人數限制</p>
                    <p className="text-gray-600">{event.max_participants} 人</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">創建時間</p>
                  <p className="text-gray-600">{formatDateTime(event.created_at)}</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="font-medium mr-2">簽到設定</p>
                  </div>
                </div>
                <div className="ml-7 mt-2 space-y-2">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${event.location_validation ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                    <p className="text-gray-600">位置驗證 {event.location_validation ? '已啟用' : '未啟用'}</p>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${event.require_checkout ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                    <p className="text-gray-600">簽退功能 {event.require_checkout ? '已啟用' : '未啟用'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-3">活動描述</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>
          )}
        </div>

        {/* QR Code 和簽到統計 */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">活動 QR Code</h2>

            <div className="flex flex-col items-center">
              {event.qrcode_url ? (
                <div className="bg-white p-2 border rounded mb-4">
                  <Image
                    src={`/qrcodes/event_qr_${event.id}.png`}
                    alt="活動 QR Code"
                    className="w-48 h-48"
                    width={300}
                    height={300}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 w-48 h-48 flex items-center justify-center mb-4">
                  <p className="text-gray-500">QR Code 未生成</p>
                </div>
              )}

              <div className="flex space-x-2 w-full">
                <button
                  onClick={handleDownloadQRCode}
                  disabled={!event.qrcode_url}
                  className={`flex-1 py-2 text-sm flex justify-center items-center ${
                    event.qrcode_url 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } rounded`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下載
                </button>

                <button
                  onClick={handlePrintQRCode}
                  disabled={!event.qrcode_url}
                  className={`flex-1 py-2 text-sm flex justify-center items-center ${
                    event.qrcode_url 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } rounded`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  列印
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>掃描 QR Code 參與簽到</p>
                <a
                  href={`${window.location.origin}/event/${event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 mt-1 block"
                >
                  查看簽到頁面
                </a>
              </div>
            </div>
          </div>

          {/* 簽到統計 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">簽到統計</h2>

            {stats ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">總簽到人數</span>
                    <span className="text-2xl font-bold text-blue-700">{stats.total}</span>
                  </div>
                </div>

                {event.require_checkout && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700">已簽到</span>
                        <span className="text-2xl font-bold text-green-700">{stats.checked_in}</span>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-orange-700">已簽退</span>
                        <span className="text-2xl font-bold text-orange-700">{stats.checked_out}</span>
                      </div>
                    </div>
                  </>
                )}

                <Link
                  href={`/dashboard/event/${event.id}/checkins`}
                  className="block w-full text-center py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 mt-2"
                >
                  查看詳細記錄
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>尚無簽到資料</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
