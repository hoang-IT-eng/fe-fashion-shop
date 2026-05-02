# Frontend Status — The Basic Fashion Shop

## Tech Stack
- React + TypeScript (Vite)
- Tailwind CSS
- Zustand (state management)
- React Router DOM
- Vitest + React Testing Library (CI)

---

## Đã hoàn thiện

### Auth
- Trang đăng nhập / đăng ký (`/auth`)
- Gọi API thật: `POST /auth/login`, `POST /auth/register`
- Lưu JWT vào localStorage, tự restore khi refresh trang
- Hiển thị lỗi từ backend (sai mật khẩu, email đã tồn tại...)
- Redirect đúng role sau khi login (admin → `/admin`, user → `/`)

### Trang chủ (`/`)
- Hero banner
- Load danh sách sản phẩm từ `GET /products`
- Skeleton loading khi chờ API
- Hiển thị ảnh, tên, danh mục, giá sản phẩm

### Admin Dashboard (`/admin`)
- Bảo vệ route: redirect về `/auth` nếu không phải admin
- Danh sách sản phẩm từ API (load thật)
- Thêm sản phẩm mới (modal form + gọi `POST /products`)
- Sửa sản phẩm (modal form + gọi `PUT /products/:id`)
- Xóa sản phẩm (`DELETE /products/:id`)
- Upload ảnh lên Cloudinary (`POST /products/upload`) trước khi lưu
- Preview ảnh trước khi upload
- Hiển thị trạng thái tồn kho (còn hàng / sắp hết / hết hàng)

### API Layer
- `src/api/apiClient.ts` — fetch wrapper tự gắn JWT vào header
- Hàm upload riêng cho multipart/form-data (không set Content-Type thủ công)

### CI/CD
- GitHub Actions: lint → test → build khi có PR vào `main`
- Vitest + React Testing Library

---

## Chưa làm

- Trang danh sách sản phẩm (`/products`) với filter theo category, search, pagination
- Trang chi tiết sản phẩm (`/products/:id`)
- Giỏ hàng (Cart)
- Trang Checkout
- Thanh toán (COD hoặc VNPay)
- Lịch sử đơn hàng của user
- Quản lý đơn hàng (admin)
- Quản lý users (admin)
- Route guard ở router level (hiện tại chỉ check trong component)
- Trang 404
