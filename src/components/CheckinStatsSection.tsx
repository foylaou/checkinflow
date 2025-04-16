import Link from 'next/link';
import {CheckinStats, EventDetail} from "@/app/dashboard/event/[id]/EventDetailPageContent";



interface CheckinStatsSectionProps {
  event: EventDetail;
   stats?: CheckinStats | null;
}

export default function CheckinStatsSection({
  event,
  stats
}: CheckinStatsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">簽到統計</h2>

      {stats ? (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">總簽到人數</span>
              <span className="text-2xl font-bold text-blue-700">{stats.total}</span>
            </div>
          </div>

          {event.require_checkout && (
            <>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">已簽到</span>
                  <span className="text-2xl font-bold text-green-700">{stats.checked_in}</span>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-orange-700">已簽退</span>
                  <span className="text-2xl font-bold text-orange-700">{stats.checked_out}</span>
                </div>
              </div>
            </>
          )}

          <Link
            href={`/dashboard/event/${event.id}/checkins`}
            className="block w-full text-center py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 mt-2"
          >
            查看詳細記錄
          </Link>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p>尚無簽到資料</p>
        </div>
      )}
    </div>
  );
}
