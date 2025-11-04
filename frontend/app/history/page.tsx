'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const [items, setItems] = useState<Array<{ log_file: string; result_file?: string | null; status: 'pending' | 'done'; summary?: any }>>([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getHistory();
        setItems(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter(it => {
    const s = it.summary || {};
    const type = s?.type || 'job';
    return filterType === 'all' || filterType === type;
  });

  const handleView = (it: any) => {
    if (it.status === 'done' && it.result_file) {
      // Go to pretty result page
      window.location.href = `/results/${encodeURIComponent(it.result_file)}`;
    } else {
      router.push(`/wait/${encodeURIComponent(it.log_file)}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="max-w-6xl mx-auto px-5 py-10">
        <h2 className="text-3xl font-semibold mb-8">Lịch Sử Các Buổi Phỏng Vấn</h2>

        <div className="mb-6 flex items-center gap-4">
          <label htmlFor="filter-type" className="font-medium">Lọc theo loại:</label>
          <select 
            id="filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
          >
            <option value="all">Tất cả</option>
            <option value="academic">🎓 Thi vấn đáp</option>
            <option value="job">💼 Phỏng vấn việc làm</option>
          </select>
        </div>

        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phiên</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((it, idx) => {
                  const s = it.summary || {};
                  const title = s?.candidate_name || it.log_file;
                  const statusText = it.status === 'done' ? 'Đã chấm' : 'Đang chấm...';
                  return (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm">{title}</td>
                      <td className="px-6 py-4 text-sm">{statusText}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-[#0065ca] hover:underline" onClick={() => handleView(it)}>
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}

