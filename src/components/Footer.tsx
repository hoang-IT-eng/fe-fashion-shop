import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="border-t border-line bg-ink text-white">
      <div className="tb-container grid gap-12 py-16 md:grid-cols-3 md:gap-8">
        <div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-display text-3xl font-medium tracking-[0.28em] uppercase"
          >
            The<span className="font-semibold">Basic</span>
          </button>
          <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-white/60">
            Tối giản, bền vững — wardrobe cơ bản cho nhịp sống hiện đại.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="tb-eyebrow text-white/50">Khám phá</p>
          <button type="button" onClick={() => navigate('/products')} className="block text-white/80 hover:text-white">
            Bộ sưu tập
          </button>
          <button type="button" onClick={() => navigate('/products?category=nam')} className="block text-white/80 hover:text-white">
            Đồ nam
          </button>
          <button type="button" onClick={() => navigate('/products?category=nu')} className="block text-white/80 hover:text-white">
            Đồ nữ
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <p className="tb-eyebrow text-white/50">Hỗ trợ</p>
          <p className="text-white/80">Miễn phí ship từ 2.000.000đ</p>
          <p className="text-white/80">Đổi trả trong 14 ngày</p>
          <p className="text-white/50">hello@thebasic.vn</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="tb-container flex flex-col gap-2 py-6 text-[11px] uppercase tracking-[0.2em] text-white/40 md:flex-row md:justify-between">
          <span>© 2026 TheBasic</span>
          <span>Crafted for everyday essentials</span>
        </div>
      </div>
    </footer>
  )
}
