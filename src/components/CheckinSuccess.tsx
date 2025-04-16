// src/components/CheckinSuccess.tsx
interface CheckinSuccessProps {
  eventName: string;
}

export default function CheckinSuccess({ eventName }: CheckinSuccessProps) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">打卡成功！</h2>
        <p className="text-gray-600 mb-6">您已成功簽到「{eventName}」活動</p>
        <p className="text-sm text-gray-500">打卡時間: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
