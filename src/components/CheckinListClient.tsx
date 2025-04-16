'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
interface Checkin {
  id: number;
  user: {
    name: string;
    phone: string;
    company: string;
    department: string;
  };
  checkin_time: string;
  checkout_time?: string;
  status: string;
  geolocation?: string;
}

interface CheckinListClientProps {
  eventId: string;
}

export default function CheckinListClient({ eventId }: CheckinListClientProps) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/checkins`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '獲取簽到記錄失敗');
        }

        const data = await response.json();
        setCheckins(data.checkins);
        setLoading(false);
      } catch (error) {
        console.error('獲取簽到記錄錯誤:', error);
        setError(error instanceof Error ? error.message : '發生未知錯誤');
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [eventId]);
  // 導出 Excel
  const exportToExcel = () => {
    // 轉換數據為 Excel 所需格式
    const exportData = checkins.map(checkin => ({
      姓名: checkin.user.name,
      公司: checkin.user.company,
      部門: checkin.user.department,
      手機: checkin.user.phone,
      簽到時間: new Date(checkin.checkin_time).toLocaleString(),
      簽退時間: checkin.checkout_time
        ? new Date(checkin.checkout_time).toLocaleString()
        : '未簽退',
      狀態: checkin.status,
      地理位置: checkin.geolocation || '未記錄'
    }));

    // 創建工作表
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '簽到記錄');

    // 導出文件
    XLSX.writeFile(workbook, `簽到記錄_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 導出 CSV
  const exportToCSV = () => {
    const exportData = checkins.map(checkin => ({
      姓名: checkin.user.name,
      公司: checkin.user.company,
      部門: checkin.user.department,
      手機: checkin.user.phone,
      簽到時間: new Date(checkin.checkin_time).toLocaleString(),
      簽退時間: checkin.checkout_time
        ? new Date(checkin.checkout_time).toLocaleString()
        : '未簽退',
      狀態: checkin.status,
      地理位置: checkin.geolocation || '未記錄'
    }));

    const csv = Papa.unparse(exportData);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `簽到記錄_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
      <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">簽到記錄</h1>
          <div className="space-x-2">
              <button
                  onClick={exportToExcel}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                  匯出 Excel
              </button>
              <button
                  onClick={exportToCSV}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                  匯出 CSV
              </button>
          </div>
          {checkins.length === 0 ? (
              <div className="text-center text-gray-500">尚無簽到記錄</div>
          ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="w-full">
                      <thead className="bg-gray-100 border-b">
                      <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部門</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">簽到時間</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">簽退時間</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                      {checkins.map((checkin) => (
                          <tr key={checkin.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">{checkin.user.name}</td>
                              <td className="px-4 py-4 whitespace-nowrap">{checkin.user.company}</td>
                              <td className="px-4 py-4 whitespace-nowrap">{checkin.user.department}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                  {new Date(checkin.checkin_time).toLocaleString()}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                  {checkin.checkout_time
                                      ? new Date(checkin.checkout_time).toLocaleString()
                                      : '未簽退'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">{checkin.status}</td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
  );
}
