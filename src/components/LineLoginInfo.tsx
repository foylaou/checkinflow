interface LineLoginInfoProps {
  lineId: string;
}

export default function LineLoginInfo({ lineId }: LineLoginInfoProps) {
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
      <p>您已成功使用 LINE 登入</p>
      <p className="text-sm">Line User ID: {lineId}</p>
    </div>
  );
}
