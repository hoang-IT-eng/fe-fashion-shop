import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Package, Users, Settings, LogOut } from 'lucide-react';

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('products');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-lg font-black text-red-600 tracking-tighter">THEBASIC ADMIN</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
            <LayoutDashboard className="w-5 h-5" /> Tổng quan
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-md">
            <Package className="w-5 h-5" /> Sản phẩm
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
            <Users className="w-5 h-5" /> Khách hàng
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
            <Settings className="w-5 h-5" /> Cài đặt
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
              A
            </div>
            <div className="text-xs">
              <p className="font-bold text-gray-900">{user?.email || 'Admin'}</p>
              <p className="text-gray-500">Quản trị viên</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <button className="bg-black text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition shadow-sm">
            + Thêm sản phẩm mới
          </button>
        </header>

        {/* Khung chứa bảng */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Mã SP</th>
                <th className="px-6 py-4 font-bold">Hình ảnh</th>
                <th className="px-6 py-4 font-bold">Tên sản phẩm</th>
                <th className="px-6 py-4 font-bold">Giá bán</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Row 1 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#SP001</td>
                <td className="px-6 py-4">
                  <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=100&q=80" alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">Áo Thun UT Graphic Ngắn Tay</td>
                <td className="px-6 py-4">399,000 đ</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-sm">Còn hàng</span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-blue-600 font-medium hover:underline">Sửa</button>
                  <button className="text-red-600 font-medium hover:underline">Xóa</button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#SP002</td>
                <td className="px-6 py-4">
                  <img src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=100&q=80" alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">Áo Thun UT Royal Cổ Tròn</td>
                <td className="px-6 py-4">399,000 đ</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-sm">Sắp hết</span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-blue-600 font-medium hover:underline">Sửa</button>
                  <button className="text-red-600 font-medium hover:underline">Xóa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}