import { use } from 'react';
import RegisterClient from '@/app/register/page.client';

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ lineId?: string; eventId?: string }>;
}) {
  const { lineId, eventId } = use(searchParams);
  return <RegisterClient lineId={lineId} eventId={eventId} />;
}
