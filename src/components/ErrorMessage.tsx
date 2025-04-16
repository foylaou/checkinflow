// src/components/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md w-full text-center">
        <p className="font-bold">錯誤</p>
        <p>{message}</p>
      </div>
    </div>
  );
}
