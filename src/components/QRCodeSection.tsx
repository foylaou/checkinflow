import Image from 'next/image';
import Link from 'next/link';
import {EventDetail} from "@/app/dashboard/event/[id]/EventDetailPageContent";


interface QRCodeSectionProps {
  event: EventDetail;
  onDownload: () => void;
  onPrint: () => void;
}

export default function QRCodeSection({
  event,
  onDownload,
  onPrint
}: QRCodeSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">活動 QR Code</h2>

      <div className="flex flex-col items-center">
        {event.qrcode_url ? (
          <div className="bg-white p-2 border rounded mb-4">
            <Image
              src={`/files/qrcodes/event_qr_${event.id}.png`}
              alt="活動 QR Code"
              className="w-48 h-48"
              width={300}
              height={300}
            />
          </div>
        ) : (
          <div className="bg-gray-100 w-48 h-48 flex items-center justify-center mb-4">
            <p className="text-gray-500">QR Code 未生成</p>
          </div>
        )}

        <div className="flex space-x-2 w-full">
          <button
            onClick={onDownload}
            disabled={!event.qrcode_url}
            className={`flex-1 py-2 text-sm flex justify-center items-center ${
              event.qrcode_url 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } rounded`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下載
          </button>

          <button
            onClick={onPrint}
            disabled={!event.qrcode_url}
            className={`flex-1 py-2 text-sm flex justify-center items-center ${
              event.qrcode_url 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } rounded`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            列印
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>掃描 QR Code 參與簽到</p>
          <Link
            href={`/event/${event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 mt-1 block"
          >
            查看簽到頁面
          </Link>
        </div>
      </div>
    </div>
  );
}
