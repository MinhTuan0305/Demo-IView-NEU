import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iView NEU - Hệ thống Phỏng vấn AI",
  description: "Nền tảng luyện tập phỏng vấn và thi vấn đáp trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
