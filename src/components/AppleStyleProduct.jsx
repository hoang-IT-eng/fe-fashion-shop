import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./AppleStyleProduct.css";

// Import tất cả ảnh từ thư mục assets
import img1 from "../assets/image.png";
import img2 from "../assets/image copy.png";
import img3 from "../assets/image copy 2.png";
import img4 from "../assets/image copy 3.png";
import img5 from "../assets/image copy 4.png";
import img6 from "../assets/image copy 5.png";

const products = [
  { id: 1, src: img1, title: "Thiết kế tối giản.", subtitle: "Trải nghiệm tối đa." },
  { id: 2, src: img2, title: "Phong cách hiện đại.", subtitle: "Đẳng cấp vượt thời gian." },
  { id: 3, src: img3, title: "Đường nét tinh tế.", subtitle: "Đậm chất riêng." },
  { id: 4, src: img4, title: "Sự kết hợp hoàn hảo.", subtitle: "Đột phá chuẩn mực." },
  { id: 5, src: img5, title: "Sẵn sàng tỏa sáng.", subtitle: "Mọi lúc mọi nơi." },
  { id: 6, src: img6, title: "Tự do bứt phá.", subtitle: "Không giới hạn." },
];

gsap.registerPlugin(ScrollTrigger);

const AppleStyleProduct = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      // Chọn tất cả các section của sản phẩm
      const sections = gsap.utils.toArray(".apple-section");
      
      sections.forEach((section) => {
        // Tìm element chứa ảnh và text bên trong mỗi section
        const productContent = section.querySelector(".apple-product-container");
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: true,           // "Khóa" màn hình cho từng sản phẩm
            start: "top top",    
            end: "+=1000",       // Mỗi phần giữ lại 1000px cuộn
            scrub: 1,            
          },
        });

        tl.to(productContent, {
          scale: 1.5,
          opacity: 0,
          ease: "power2.inOut"
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      {products.map((product) => (
        <section key={product.id} className="apple-section">
          <div className="apple-product-container">
            <img 
              src={product.src} 
              alt={product.title} 
              className="apple-product-image" 
            />
            <h2 className="apple-product-text">
              {product.title}<br/>{product.subtitle}
            </h2>
          </div>
        </section>
      ))}
      
      {/* Spacer này tạo không gian trống phía bên dưới, giúp bạn thấy tiếp những gì sau khi cuộn xong hết các sản phẩm */}
      <div className="scroll-spacer">
        <p>Bắt đầu mua sắm ngay</p>
      </div>
    </div>
  );
};

export default AppleStyleProduct;
