import Link from 'next/link';
import { isEventActive } from '@/utils/eventUtils';
import {EventDetail} from "@/app/dashboard/event/[id]/EventDetailPageContent";



interface EventDetailHeaderProps {
  event: EventDetail;
}

export default function EventDetailHeader({ event }: EventDetailHeaderProps) {
  return (
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
        {isEventActive(event) && (
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
  );
}
