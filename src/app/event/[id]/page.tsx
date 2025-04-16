// src/app/event/[id]/page.tsx
import { use } from 'react';
import EventPageClient from "@/components/EventPageClient";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  // 先顯式類型轉換，然後使用 use() 函數解包 params
  const { id } = use<{ id: string }>(params);

  // 傳遞解包後的 id 給客戶端組件
  return <EventPageClient eventId={id} />;
}
