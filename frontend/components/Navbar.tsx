'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#004d80] text-white px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-md transition-all hover:bg-white/10 hover:-translate-y-0.5">
        <img 
          src="/logos/logo-neu2.png" 
          alt="Logo NEU" 
          width={36} 
          height={36}
          className="transition-transform hover:scale-105"
        />
        <span className="text-xl font-bold transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">iView NEU</span>
      </Link>
      
      <ul className="flex gap-4.5 list-none">
        <li>
          <Link 
            href="/" 
            className={`px-4 py-2 transition-all font-medium text-sm uppercase tracking-wide relative ${
              isActive('/') ? 'bg-white/10' : ''
            } hover:bg-white/10`}
          >
            Trang Chủ
            {isActive('/') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
          </Link>
        </li>
        <li>
          <Link 
            href="/create-session" 
            className={`px-4 py-2 transition-all font-medium text-sm uppercase tracking-wide relative ${
              isActive('/create-session') ? 'bg-white/10' : ''
            } hover:bg-white/10`}
          >
            Tạo Buổi Phỏng Vấn
            {isActive('/create-session') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
          </Link>
        </li>
        <li>
          <Link 
            href="/history" 
            className={`px-4 py-2 transition-all font-medium text-sm uppercase tracking-wide relative ${
              isActive('/history') ? 'bg-white/10' : ''
            } hover:bg-white/10`}
          >
            Lịch Sử
            {isActive('/history') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
          </Link>
        </li>
        <li>
          <Link 
            href="/exams" 
            className={`px-4 py-2 transition-all font-medium text-sm uppercase tracking-wide relative ${
              isActive('/exams') ? 'bg-white/10' : ''
            } hover:bg-white/10`}
          >
            Kỳ Thi
            {isActive('/exams') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard" 
            className={`px-4 py-2 transition-all font-medium text-sm uppercase tracking-wide relative ${
              isActive('/dashboard') ? 'bg-white/10' : ''
            } hover:bg-white/10`}
          >
            Dashboard
            {isActive('/dashboard') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
          </Link>
        </li>
        <li>
          <Link 
            href="/guide" 
            className={`px-4 py-2 transition-all font-medium text-sm uppercase tracking-wide relative ${
              isActive('/guide') ? 'bg-white/10' : ''
            } hover:bg-white/10`}
          >
            Hướng Dẫn
            {isActive('/guide') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
          </Link>
        </li>
        <li>
          <Link 
            href="/login" 
            className="bg-white text-[#0065ca] font-semibold px-5 py-2 hover:bg-[#f1f5ff] focus:outline-none focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)]"
          >
            Đăng Nhập
          </Link>
        </li>
      </ul>
    </nav>
  );
}

