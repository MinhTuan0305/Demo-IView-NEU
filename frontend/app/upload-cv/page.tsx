'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export default function UploadCVPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !jobTitle || !level) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('cv_file', file);
      formData.append('job_title', jobTitle);
      formData.append('level', level);
      if (jdFile) {
        formData.append('jd_file', jdFile);
      }

      // Call Next.js proxy route to avoid CORS and capture redirect
      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(JSON.stringify(data));
      }

      if (data.questions_file) {
        router.push(`/interview?questions_file=${encodeURIComponent(data.questions_file)}`);
        return;
      }

      router.push('/interview');
    } catch (err) {
      setError('Có lỗi xảy ra: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-5 py-10 relative">
        <h1 className="text-3xl font-semibold mb-8">Tạo Câu Hỏi Phỏng Vấn</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="cv_file" className="block font-medium mb-2">
              Upload CV (PDF, PNG, JPG)
            </label>
            <input
              type="file"
              id="cv_file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              required
            />
          </div>

          <div>
            <label htmlFor="jd_file" className="block font-medium mb-2">
              (Tuỳ chọn) Upload JD/Mô tả công việc (PDF hoặc TXT)
            </label>
            <input
              type="file"
              id="jd_file"
              accept=".pdf,.txt,.md"
              onChange={(e) => setJdFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
            />
            <p className="text-xs text-gray-500 mt-1">Nếu không có JD, bạn có thể bỏ qua bước này.</p>
          </div>

          <div>
            <label htmlFor="job_title" className="block font-medium mb-2">
              Vị trí công việc
            </label>
            <input
              type="text"
              id="job_title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ví dụ: Data Scientist, Software Engineer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              required
            />
          </div>

          <div>
            <label htmlFor="level" className="block font-medium mb-2">
              Level
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              required
            >
              <option value="">Chọn level</option>
              <option value="Intern">Intern</option>
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0065ca] text-white py-4 rounded-lg font-semibold uppercase tracking-wide hover:bg-[#004a95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Tạo Câu Hỏi'}
          </button>
        </form>
      </main>

      <Footer />
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#0065ca] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#0065ca] font-semibold">Hệ thống đang tạo câu hỏi, vui lòng chờ...</div>
          </div>
        </div>
      )}
    </div>
  );
}

