'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { api } from '@/lib/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getResults();
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute stats
  const totalSessions = items.length;
  const numericScores = items
    .map((it) => (it.summary?.average_overall_score ?? it.summary?.overall_score ?? null) as number | null)
    .filter((x) => typeof x === 'number') as number[];
  const avgScore = numericScores.length ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1) : 'N/A';
  const countAcademic = items.filter((it) => (it.summary?.type || 'job') === 'academic').length;
  const countJob = totalSessions - countAcademic;

  // Build daily counts for last 7 days based on modified timestamp
  const days: string[] = [];
  const dayKeyToCounts = new Map<string, { academic: number; job: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    days.push(label);
    dayKeyToCounts.set(key, { academic: 0, job: 0 });
  }
  items.forEach((it) => {
    const m = it.modified ? new Date(it.modified * 1000) : new Date();
    const key = m.toISOString().slice(0, 10);
    if (dayKeyToCounts.has(key)) {
      const type = (it.summary?.type || 'job') as 'academic' | 'job';
      const obj = dayKeyToCounts.get(key)!;
      obj[type] += 1;
    }
  });
  const academicCounts = Array.from(dayKeyToCounts.values()).map((v) => v.academic);
  const jobCounts = Array.from(dayKeyToCounts.values()).map((v) => v.job);

  const pieData = {
    labels: ['Thi vấn đáp', 'Phỏng vấn việc làm'],
    datasets: [{ data: [countAcademic, countJob], backgroundColor: ['#6fb6ff', '#005bb5'], borderColor: '#fff', borderWidth: 1 }],
  };

  const barData = {
    labels: days,
    datasets: [
      { label: 'Thi vấn đáp', data: academicCounts, backgroundColor: '#9fd3ff' },
      { label: 'Phỏng vấn việc làm', data: jobCounts, backgroundColor: '#0065ca' },
    ],
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 py-10">
        {/* Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
            <div className="text-4xl">📁</div>
            <div>
              <div className="text-3xl font-bold">{totalSessions}</div>
              <div className="text-sm text-gray-600">Tổng số buổi</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
            <div className="text-4xl">⭐</div>
            <div>
              <div className="text-3xl font-bold">{avgScore === 'N/A' ? 'N/A' : `${avgScore} / 10`}</div>
              <div className="text-sm text-gray-600">Điểm trung bình</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
            <div className="text-4xl">🎓</div>
            <div>
              <div className="text-3xl font-bold">{countAcademic}</div>
              <div className="text-sm text-gray-600">Thi vấn đáp</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
            <div className="text-4xl">💼</div>
            <div>
              <div className="text-3xl font-bold">{countJob}</div>
              <div className="text-sm text-gray-600">Phỏng vấn việc làm</div>
            </div>
          </div>
        </section>

        {/* Charts */}
        {!loading && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Tỷ lệ Thi vấn đáp vs Phỏng vấn việc làm</h3>
              <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Số buổi theo ngày (7 ngày gần nhất)</h3>
              <Bar data={barData} options={{ plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
            </div>
          </section>
        )}

        {/* Recent sessions */}
        <section className="recent-row">
          <h3 className="text-lg font-semibold mb-4">5 phiên gần đây</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phiên</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.slice(0, 5).map((it, idx) => {
                  const s = it.summary || {};
                  const title = s?.title || s?.candidate_name || it.filename;
                  const time = s?.interview_date || new Date((it.modified ?? 0) * 1000).toLocaleString('vi-VN');
                  const avg = s?.average_overall_score ?? s?.overall_score ?? '-';
                  return (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm">{title}</td>
                      <td className="px-6 py-4 text-sm">{time}</td>
                      <td className="px-6 py-4 text-sm">{typeof avg === 'number' ? `${avg.toFixed(1)} / 10` : avg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}

