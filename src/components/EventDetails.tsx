// src/components/EventDetails.tsx
interface EventDetailsProps {
  startTime: string;
  endTime: string;
  location: string;
  requiresLocation: boolean;
  isAvailable: boolean;
}

export default function EventDetails({
  startTime,
  endTime,
  location,
  requiresLocation,
  isAvailable
}: EventDetailsProps) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div>
          <p className="font-medium">活動時間</p>
          <p className="text-gray-600">
            {new Date(startTime).toLocaleString()} - {new Date(endTime).toLocaleString()}
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
          <p className="text-gray-600">{location}</p>
        </div>
      </div>

      {requiresLocation && (
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-yellow-700">此活動需要位置驗證</p>
          </div>
        </div>
      )}

      {!isAvailable && (
        <div className="mt-2 bg-yellow-50 p-3 rounded-lg">
          <p className="text-yellow-700 text-sm">
            {new Date() < new Date(startTime)
              ? '此活動尚未開始，無法簽到'
              : '此活動已結束，無法簽到'}
          </p>
        </div>
      )}
    </div>
  );
}
