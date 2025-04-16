'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EventDetailHeader from "@/components/EventDetailHeader";
import EventDetailsSection from "@/components/EventDetailsSection";
import QRCodeSection from "@/components/QRCodeSection";
import CheckinStatsSection from "@/components/CheckinStatsSection";

export interface EventDetail {
  id: string;
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

export interface CheckinStats {
  total: number;
  checked_in: number;
  checked_out: number;
}
interface EventPageClientProps {
  eventId: string;
}
export default function EventDetailPageContent({ eventId }: EventPageClientProps) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        // 檢查登入狀態
        const authResponse = await fetch('/api/auth/check');
        if (!authResponse.ok) {
          throw new Error('未登入或登入已過期');
        }

        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (!eventResponse.ok) {
          throw new Error('獲取活動詳情失敗');
        }

        const eventData = await eventResponse.json();
        setEvent(eventData.event);

        // 獲取簽到統計
        const statsResponse = await fetch(`/api/events/${eventId}/stats`);
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
  }, [eventId, router]);

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
      <EventDetailHeader event={event} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EventDetailsSection event={event} />

        <div className="space-y-6">
          <QRCodeSection
            event={event}
            onDownload={() => {
              if (!event?.qrcode_url) return;
              const link = document.createElement('a');
              link.href = event.qrcode_url;
              link.download = `${event.name}-QRCode.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            onPrint={() => {
              const printWindow = window.open('', '_blank');
              if (!printWindow) return;

              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>${event.name} - QR Code</title>
                    <style>
                      body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                      img { max-width: 300px; height: auto; border: 1px solid #ddd; padding: 10px; }
                    </style>
                  </head>
                  <body>
                    <h1>${event.name}</h1>
                    <img src="${event.qrcode_url}" alt="活動 QR Code">
                    <script>
                      window.onload = function() {
                        window.print();
                        window.setTimeout(() => window.close(), 500);
                      };
                    </script>
                  </body>
                </html>
              `);

              printWindow.document.close();
            }}
          />

          <CheckinStatsSection
            event={event}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
}
