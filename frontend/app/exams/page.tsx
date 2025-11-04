'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';

export default function ExamsPage() {
  const router = useRouter();
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [showMaint, setShowMaint] = useState(true);

  useEffect(() => {
    setShowMaint(true);
  }, []);

  const exams = [
    { subject: 'kinhtevi', name: 'Giữa kỳ Kinh tế vi mô', title: 'Giữa kỳ - Kinh tế vi mô', date: '25/10/2025', duration: '10 phút', type: 'Giữa kỳ' },
    { subject: 'kinhteluong', name: 'Giữa kỳ Kinh tế lượng', title: 'Giữa kỳ - Kinh tế lượng', date: '10/11/2025', duration: '12 phút', type: 'Giữa kỳ' },
    { subject: 'taichinhdn', name: 'Giữa kỳ Tài chính doanh nghiệp', title: 'Giữa kỳ - Tài chính doanh nghiệp', date: '05/11/2025', duration: '8 phút', type: 'Giữa kỳ' },
  ];

  const filteredExams = exams.filter(exam => {
    const matchSubject = subjectFilter === 'all' || exam.subject === subjectFilter;
    const matchSearch = exam.name.toLowerCase().includes(searchInput.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-5 py-10">
        <h1 className="text-[#0065ca] text-3xl font-bold uppercase tracking-wide mb-4">Kỳ Thi</h1>
        <p className="text-[#5f6368] mb-6">
          Danh sách các kỳ thi đã tạo như Giữa kỳ, Cuối kỳ. Bạn có thể lọc theo học phần hoặc tìm kiếm.
        </p>

        <div className="bg-white border border-gray-200 shadow-sm p-3 flex gap-3 items-center mb-6 flex-wrap">
          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca] max-w-[260px]"
          >
            <option value="all">Tất cả học phần</option>
            <option value="kinhtevi">Kinh tế vi mô</option>
            <option value="kinhteluong">Kinh tế lượng</option>
            <option value="taichinhdn">Tài chính doanh nghiệp</option>
          </select>
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên kỳ thi..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca] max-w-[260px]"
          />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredExams.map((exam, idx) => (
            <article key={idx} className="bg-white border border-gray-200 shadow-sm p-4.5 transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#0065ca]">
              <div className="text-lg font-semibold text-[#202124] mb-1.5">{exam.title}</div>
              <div className="text-[#5f6368] text-sm mb-3">
                Ngày thi: {exam.date} • Hình thức: Vấn đáp AI • Thời lượng: {exam.duration}
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-[#eef4ff] text-[#0065ca] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                  {exam.type}
                </span>
                <button className="bg-[#0065ca] text-white px-3 py-2 rounded-lg hover:bg-[#004a95] transition-colors text-sm">
                  Vào thi
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />
      <Modal
        open={showMaint}
        title="Tính năng đang bảo trì"
        description={'Chức năng Kỳ thi hiện đang được bảo trì. Vui lòng quay lại trang chủ và thử lại sau.'}
        onClose={() => {
          setShowMaint(false);
          router.push('/');
        }}
        confirmText="Về trang chủ"
      />
    </div>
  );
}

