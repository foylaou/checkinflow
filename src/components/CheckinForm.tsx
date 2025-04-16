// src/components/CheckinForm.tsx

interface CheckinFormProps {
  userName: string;
  isAvailable: boolean;
  onCheckin: () => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export default function CheckinForm({
  userName,
  isAvailable,
  onCheckin,
  status,
  error
}: CheckinFormProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="font-medium">簽到人員</p>
        <p>{userName}</p>
      </div>

      <button
        onClick={onCheckin}
        disabled={status === 'loading' || !isAvailable}
        className={`w-full py-3 rounded-lg font-medium text-white ${
          status === 'loading' || !isAvailable
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {status === 'loading' ? '處理中...' : '立即簽到'}
      </button>

      {status === 'error' && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
          {error || '簽到失敗，請重試'}
        </div>
      )}
    </div>
  );
}
