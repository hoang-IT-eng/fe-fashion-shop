import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import "./ParallaxHero.css";

// Đăng ký Plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const ParallaxHero = () => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const textRef = useRef(null);

  useGSAP(
    () => {
      // 1. Hiệu ứng Parallax cho Ảnh nền (Background)
      // Khi scroll, ảnh nền sẽ di chuyển xuống dưới 30% (tạo cảm giác cuộn chậm hơn)
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",      // Bắt đầu khi mép trên của khối vừa chạm đỉnh màn hình
          end: "bottom top",     // Kết thúc khi mép dưới của khối lên chạm đỉnh
          scrub: true,           // Scrub gắn trực tiếp với bánh xe cuộn chuột
        },
      });

      // 2. Hiệu ứng cho Title Text (Optional)
      // Lệnh này làm khối text đẩy nhẹ lên trên và mờ dần khi cuộn chuột để tăng chiều sâu
      gsap.to(textRef.current, {
        yPercent: -50,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <>
      <section className="parallax-container" ref={containerRef}>
        {/* Header/Nav */}
        <nav className="parallax-nav">
          <div className="parallax-logo">TBS</div>
          <div className="parallax-links">
            <Link to="/users" className="parallax-link">Quản lý User</Link>
          </div>
        </nav>

        {/* Ảnh nền */}
        <div
          className="parallax-bg"
          ref={bgRef}
          style={{
            // Sử dụng ảnh chất lượng cao từ Unsplash (chủ đề Thời trang / Lookbook)
            backgroundImage:
              'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop")',
          }}
        >
          {/* Lớp màng xỉn màu mờ (overlay) để chữ rõ nét hơn */}
          <div className="parallax-overlay"></div>
        </div>

        {/* Nội dung tiêu đề */}
        <div className="parallax-content" ref={textRef}>
          <h1 className="parallax-title">The Basic Shop</h1>
          <p className="parallax-subtitle">
            Khám phá xu hướng thời trang mùa mới
          </p>
        </div>
      </section>

      {/* Một section giả định bên dưới để bạn có không gian cuộn và thấy được hiệu ứng */}
      <section className="dummy-scroll-section">
        <h2>Sản phẩm nổi bật</h2>
        <p>Cuộn xuống để xem phần thân của cửa hàng...</p>
      </section>
    </>
  );
};

export default ParallaxHero;
