'use client';

import { useState, FormEvent } from 'react';

interface RegisterFormProps {
  onSubmit: (formData: {
    name: string;
    phone: string;
    company: string;
    department: string;
  }) => Promise<void>;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    // 去除空白後檢查
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedCompany = company.trim();
    const trimmedDepartment = department.trim();

    if (!trimmedName) {
      setError('請輸入姓名');
      return false;
    }

    if (!trimmedPhone) {
      setError('請輸入電話');
      return false;
    }

    // 手機號碼驗證（台灣手機號碼）
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setError('請輸入有效的手機號碼（09開頭，共10碼）');
      return false;
    }

    if (!trimmedCompany) {
      setError('請輸入公司名稱');
      return false;
    }

    if (!trimmedDepartment) {
      setError('請輸入部門');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await onSubmit({
          name: name.trim(),
          phone: phone.trim(),
          company: company.trim(),
          department: department.trim()
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : '提交失敗');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block mb-2">姓名</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
          placeholder="請輸入您的姓名"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block mb-2">電話</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
          placeholder="請輸入您的手機號碼（09開頭）"
        />
      </div>

      <div>
        <label htmlFor="company" className="block mb-2">公司</label>
        <input
          type="text"
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
          placeholder="請輸入您的公司名稱"
        />
      </div>

      <div>
        <label htmlFor="department" className="block mb-2">部門</label>
        <input
          type="text"
          id="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
          placeholder="請輸入您的部門"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      >
        完成註冊
      </button>
    </form>
  );
}
