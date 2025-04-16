import { formatDateTime } from '@/utils/dateUtils';
import {EventDetail} from "@/app/dashboard/event/[id]/EventDetailPageContent";


interface EventDetailsSectionProps {
  event: EventDetail;
}

export default function EventDetailsSection({ event }: EventDetailsSectionProps) {
  return (
    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-5">
      <div>
        <h2 className="text-lg font-semibold border-b pb-2 mb-3">活動詳情</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div>
              <p className="font-medium">活動地點</p>
              <p className="text-gray-600">{event.location}</p>
            </div>
          </div>

          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <div>
              <p className="font-medium">活動類型</p>
              <p className="text-gray-600">{event.event_type}</p>
            </div>
          </div>

          {event.max_participants && (
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <div>
                <p className="font-medium">人數限制</p>
                <p className="text-gray-600">{event.max_participants} 人</p>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="font-medium">創建時間</p>
              <p className="text-gray-600">{formatDateTime(event.created_at)}</p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
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
  );
}
