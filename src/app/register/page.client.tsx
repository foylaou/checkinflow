'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/RegisterForm';
import LineLoginInfo from '@/components/LineLoginInfo';

interface RegisterClientProps {
  lineId?: string;
  eventId?: string;
}

export default function RegisterClient({ lineId, eventId }: RegisterClientProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

const handleRegister = async (formData: {
  name: string;
  phone: string;
  company: string;
  department: string;
}) => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line_user_id: lineId,
        ...formData
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '註冊失敗');
    }

    // 設置 cookie
    document.cookie = `userId=${result.user.id}; path=/; max-age=${7 * 24 * 60 * 60}`;

    // 如果有指定活動，導向活動頁面
    if (eventId) {
      router.push(`/event/${eventId}`);
    } else {
      router.push('/dashboard');
    }
  } catch (error) {
    setError(error instanceof Error ? error.message : '發生未知錯誤');
  }
};

  // 如果沒有 lineId，可能需要重定向或顯示錯誤
  if (!lineId) {
    return <div>無效的登入狀態，請重新登入</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">完成註冊</h1>

      <LineLoginInfo lineId={lineId} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}
