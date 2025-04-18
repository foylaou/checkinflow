"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {BaseStore} from "@/store/baseStore";

// 用戶類型定義
interface User {
  id: number;
  username: string;
  name: string;
  created_at: string;
}

// 主頁面組件
export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { isLoggedIn, initialized, role, checkLogin } = BaseStore();
  // 獲取用戶列表
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/auth/users");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("無法獲取用戶列表，請稍後再試");
      console.error("獲取用戶列表時出錯：", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    fetchUsers();
  }, []);

  // 處理新增用戶後的刷新
  const handleUserAdded = () => {
    fetchUsers();
    setShowAddModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">人員管理</h1>
      {role == "系統管理員" ? (
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors duration-150 ease-in-out"
        >
          新增人員
        </button>
      ) : ("")}
    </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <UserListSkeleton />
      ) : (
        <UserList users={users} />
      )}

      {/* 新增用戶彈窗 */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
  );
}

// 用戶列表組件
function UserList({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>尚無註冊人員</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              用戶名
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              姓名
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              角色
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              創建時間
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 加載中骨架屏
function UserListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-200"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex px-6 py-4 border-t border-gray-100">
          <div className="w-1/12 h-4 bg-gray-200 rounded"></div>
          <div className="w-2/12 h-4 ml-4 bg-gray-200 rounded"></div>
          <div className="w-2/12 h-4 ml-4 bg-gray-200 rounded"></div>
          <div className="w-2/12 h-4 ml-4 bg-gray-200 rounded"></div>
          <div className="w-3/12 h-4 ml-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

// 新增用戶彈窗組件
function AddUserModal({
  onClose,
  onUserAdded,
}: {
  onClose: () => void;
  onUserAdded: () => void;
}) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "管理員" as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 驗證表單
      if (!formData.username || !formData.password || !formData.name) {
        throw new Error("所有欄位都是必填的");
      }

      // 發送 API 請求
      const response = await axios.post("/api/auth/adduser", formData);

      if (response.status === 201) {
        onUserAdded();
      }
    } catch (err: any) {
      console.error("新增用戶時出錯：", err);
      setError(
        err.response?.data?.error || err.message || "新增用戶時發生錯誤"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">新增人員</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                用戶名
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="請輸入用戶名"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                密碼
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="請輸入密碼"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                角色
              </label>
              <select
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="管理員">管理員</option>
                <option value="系統管理員">系統管理員</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                disabled={isSubmitting}
              >
                {isSubmitting ? "處理中..." : "新增"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
