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

## Kết nối Backend

Frontend proxy tới Flask backend ở `http://localhost:5000` thông qua các route `/api/*` nội bộ, nên không bắt buộc `.env.local`.
Nếu cần override, có thể thêm:

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

## Lưu ý vận hành

- Sau khi nộp bài, trang `/wait/[log]` sẽ tự động chuyển sang `/results/[filename]` khi có kết quả.
- Một số tính năng Academic/Exams đang ở trạng thái bảo trì (hiển thị popup và điều hướng về trang chủ).

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
