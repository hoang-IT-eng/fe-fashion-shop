import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, User, ShoppingCart, Menu, Globe } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

// --- CẤU HÌNH LOGO TEXT (Đã tinh chỉnh font để căn giữa chuẩn hơn) ---
const LogoComponent = () => (
  <h1 className="text-3xl font-extralight tracking-[0.35em] uppercase text-gray-950 serif">
    The<span className="font-semibold">Basic</span>
  </h1>
);

// --- TÁC VỤ 1: SỬ DỤNG TẤM ẢNH HERO QUẦN ÁO TRẮNG ĐEN ---
// Tôi chọn tấm ảnh này vì nó hiển thị trực tiếp các loại quần áo cơ bản (áo thun, sơ mi) được gấp gọn,
// có tông màu trắng đen lạnh và trầm mặc, rất phù hợp với tinh thần "TheBasic".
const HERO_BG_URL = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=100';

// --- DATA SẢN PHẨM: ĐÃ ĐỂ TRỐNG (Backend sẽ thêm vào sau) ---
// Chúng ta chỉ giữ lại cấu trúc danh mục rỗng
const EMPTY_SECTIONS = [
  { title: 'NEW ARRIVALS' },
  { title: 'ESSENTIALS COLLECTION' }
];

// Component tạo khung rỗng (Skeleton) cho từng sản phẩm
const ProductSkeleton = () => (
  <div className="w-[75vw] md:w-[26vw] flex-shrink-0 snap-start group">
    {/* Khung ảnh rỗng: Mảng màu xám nhẹ */}
    <div className="aspect-[3/4] w-full bg-[#f0f0f0] mb-6 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:border-gray-200"></div>
    {/* Thông tin rỗng: Các dòng kẻ xám */}
    <div className="space-y-3 px-1 flex flex-col items-center">
      <div className="h-4 w-3/4 bg-[#f0f0f0] rounded-sm"></div> {/* Tên SP rỗng */}
      <div className="h-3 w-1/2 bg-[#f0f0f0] rounded-sm"></div> {/* New Season rỗng */}
      <div className="h-5 w-2/5 bg-[#f0f0f0] rounded-sm pt-2"></div> {/* Giá rỗng */}
    </div>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [scrollSections, setScrollSections] = useState<any[]>(EMPTY_SECTIONS);
  const [isLoading, setIsLoading] = useState(false); // Tắt loading giả lập

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden antialiased">
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* THANH THÔNG BÁO MỎNG */}
      <div className="bg-[#f5f5f5] py-2 text-center border-b border-gray-100">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-600">
          Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ | Hàng mới về mỗi ngày
        </p>
      </div>

      {/* HEADER: Đã căn giữa Logo "TheBasic" một cách chuẩn xác */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/95 backdrop-blur-sm px-6 md:px-12 py-4 border-b border-gray-100 shadow-sm">
        {/* Left Nav (Đồ Nam, Đồ Nữ,...) */}
        <nav className="hidden gap-8 md:flex items-center flex-1 justify-start">
          {['Bộ sưu tập', 'Đồ Nam', 'Đồ Nữ', 'Phụ kiện'].map((item) => (
            <a key={item} href="#" className="text-xs font-semibold uppercase tracking-widest text-gray-700 hover:text-black transition">{item}</a>
          ))}
        </nav>
        
        <Menu className="h-5 w-5 text-gray-900 cursor-pointer md:hidden" />

        {/* LOGO: TÁC VỤ 2 - GIỮ NGUYÊN CĂN GIỮA CHUẨN XÁC */}
        <div className="flex items-center justify-center cursor-pointer flex-1" onClick={() => navigate('/')}>
          <LogoComponent />
        </div>

        {/* Right Icons mảnh nhẹ */}
        <div className="flex items-center gap-6 text-gray-700 flex-1 justify-end">
          <Globe className="h-4 w-4 cursor-pointer hidden md:block" />
          <Search className="h-4 w-4 cursor-pointer hover:text-black" />
          <User className="h-4 w-4 cursor-pointer hover:text-black" onClick={() => navigate('/auth')} />
          <Heart className="h-4 w-4 cursor-pointer hover:text-black" />
          <div className="relative cursor-pointer group">
            <ShoppingCart className="h-4 w-4 hover:text-black" />
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">0</span>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full overflow-hidden">
        {/* SECTION 1: HERO BACKGROUND VỚI TẤM ẢNH QUẦN ÁO MỚI */}
        <section 
          className="relative flex items-center justify-center h-[85vh] bg-cover bg-center bg-no-repeat border-b border-gray-100 overflow-hidden"
          // TÁC VỤ 3: SỬ DỤNG LINK ẢNH QUẦN ÁO MỚI
          style={{ backgroundImage: `url(${HERO_BG_URL})` }} 
        >
          {/* Lớp phủ mờ (Overlay) tạo chiều sâu và làm chữ nổi lên */}
          <div className="absolute inset-0 bg-black/35"></div>
          
          {/* Nội dung chữ trắng đè lên ảnh */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-6">
            <span className="mb-4 inline-block bg-white text-black px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em]">
              New Collection
            </span>
            <h2 className="mb-3 text-5xl font-extralight uppercase tracking-[0.25em] md:text-7xl leading-tight serif">
              THE<span className='font-semibold'>BASIC</span> S/S 26
            </h2>
            <p className="mb-10 text-sm font-light uppercase tracking-widest max-w-lg opacity-90">
              Khám phá những thiết kế tối giản, tinh tế định hình phong cách thời trang bền vững.
            </p>
            <div className="flex gap-4">
              <button className="bg-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition duration-300">
                ĐỒ NAM
              </button>
              <button className="bg-transparent border-2 border-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition duration-300">
                ĐỒ NỮ
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: CÁC HÀNG SẢN PHẨM ĐỂ TRỐNG (UI SKELETON) */}
        {/* GIỮ NGUYÊN NHƯ CODE CŨ */}
        <div className="flex flex-col py-24 space-y-32 bg-[#fafafa]">
          {scrollSections.map((section, idx) => (
            <section key={idx} className="flex flex-col pl-6 md:pl-24">
              <div className="flex items-center justify-between mb-12 pr-6 md:pr-24">
                <h2 className="text-xl font-light uppercase tracking-[0.4em] text-gray-950 border-l-2 border-black pl-5">
                  {section.title}
                </h2>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory gap-12 pb-12 hide-scrollbar">
                {[...Array(5)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="bg-black text-white px-12 py-16 text-center border-t border-gray-800">
          <h3 className="text-2xl font-light tracking-[0.3em] uppercase mb-6 serif">THE<span className='font-semibold'>BASIC</span></h3>
          <p className="text-xs text-gray-400 tracking-wider">© 2026 TheBasic. All rights reserved. Phong cách tối giản cho cuộc sống hiện đại.</p>
        </footer>
      </main>
    </div>
  );
}