// src/components/LineLoginButton.tsx
import React from 'react';

interface LineLoginButtonProps {
  onLogin: () => void;
  className?: string;
}

export default function LineLoginButton({ 
  onLogin, 
  className = '' 
}: LineLoginButtonProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <p className="text-sm text-gray-600 mb-2">
        請使用 LINE 帳號登入進行簽到
      </p>

      <button
        onClick={onLogin}
        className="w-full py-3 px-4 bg-[#06C755] hover:bg-[#05B045] text-white rounded-lg 
                   font-semibold flex items-center justify-center 
                   transition-colors duration-300 ease-in-out 
                   shadow-md hover:shadow-lg focus:outline-none 
                   focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
      >

        
        <span className="font-medium">使用 LINE 登入</span>
      </button>
    </div>
  );
}