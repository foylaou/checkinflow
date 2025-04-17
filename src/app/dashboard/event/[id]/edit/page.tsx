import { use } from 'react';
import EditEventForm from '@/components/EditEventForm';

// 服務器組件，用於獲取事件數據並將其傳遞給客戶端組件
export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use<{ id: string }>(params);

  // 將 ID 傳遞給客戶端組件
  return <EditEventForm eventId={id} />;
}
