'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { api } from '@/lib/api';

export default function WaitPage() {
  const params = useParams<{ log: string }>();
  const router = useRouter();
  const log = decodeURIComponent(params.log);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const s = await api.getResultStatus(log);
        if (cancelled) return;
        if (s?.ready && s?.result_file) {
          router.push(`/results/${encodeURIComponent(s.result_file)}`);
          return;
        }
        setCount((c) => c + 1);
        setTimeout(tick, Math.min(500 + count * 250, 5000));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi kết nối');
        setTimeout(tick, 1500);
      }
    };

    tick();
    return () => { cancelled = true; };
  }, [log, count, router]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-xl mx-auto text-center py-24 px-5">
        <h1 className="text-2xl font-semibold mb-3">Đang chấm điểm phiên phỏng vấn...</h1>
        <p className="text-gray-600 mb-6">Log: {log}</p>
        <div className="mx-auto w-16 h-16 border-4 border-[#0065ca] border-t-transparent rounded-full animate-spin"></div>
        {error && <p className="text-red-600 mt-4">{error}</p>}
        <p className="text-gray-500 mt-6">Trang sẽ tự chuyển tới kết quả khi hoàn tất.</p>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
