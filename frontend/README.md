# Frontend - iView NEU

Frontend cho hệ thống phỏng vấn AI được xây dựng bằng Next.js và Tailwind CSS.

## Cài đặt

```bash
npm install
```

## Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

## Cấu hình

Tạo file `.env.local` từ `.env.example` và cấu hình:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Xây dựng Production

```bash
npm run build
npm start
```

## Cấu trúc

- `app/` - Các pages và routes
- `components/` - Các components tái sử dụng (Navbar, Footer, ChatWidget)
- `lib/` - Utilities và API client
- `public/` - Static assets (images, logos)

## Kết nối với Backend

Frontend kết nối với Flask backend tại `http://localhost:5000`. Đảm bảo backend đang chạy trước khi sử dụng frontend.

## Tính năng

- ✅ Trang chủ với hero section
- ✅ Đăng nhập
- ✅ Dashboard với charts
- ✅ Tạo phiên phỏng vấn
- ✅ Upload CV và tạo câu hỏi
- ✅ Trang phỏng vấn tương tác
- ✅ Lịch sử phỏng vấn
- ✅ Kỳ thi
- ✅ Hướng dẫn sử dụng
- ✅ Chat widget với AI assistant
