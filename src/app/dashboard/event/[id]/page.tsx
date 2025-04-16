import {Suspense, use} from 'react';
import EventDetailPageContent from './EventDetailPageContent';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use<{ id: string }>(params);


  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EventDetailPageContent eventId={id} />
    </Suspense>
  );
}
