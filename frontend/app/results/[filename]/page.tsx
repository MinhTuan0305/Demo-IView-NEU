'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

export default function ResultDetailPage() {
  const params = useParams<{ filename: string }>();
  const filename = decodeURIComponent(params.filename);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const d = await api.getResult(filename);
        // Proxy có thể trả dữ liệu dạng { __resolved, data }
        const payload: any = (d && d.data) ? d.data : d;
        setData(payload);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filename]);

  const summary = data?.summary || {};
  const details = data?.details || data?.questions || {};
  const feedback = summary?.overall_feedback as (undefined | { overall_score?: number; strengths?: string; weaknesses?: string; hiring_recommendation?: string });

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-semibold mb-2">Kết quả phỏng vấn</h1>
        <p className="text-gray-600 mb-6 break-all">File: {filename}</p>

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-[#0065ca] border-t-transparent rounded-full animate-spin"></div>
            <span>Đang tải kết quả...</span>
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="space-y-8">
            {/* Summary */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Tổng quan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Ứng viên</div>
                  <div className="font-medium">{summary.candidate_name || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Thời gian</div>
                  <div className="font-medium">{summary.interview_date || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Điểm TB</div>
                  <div className="font-medium">{typeof summary.average_overall_score === 'number' ? summary.average_overall_score.toFixed(1) : (summary.average_overall_score || '-')}</div>
                </div>
                <div>
                  <div className="text-gray-500">Số câu đã chấm</div>
                  <div className="font-medium">{summary.questions_scored || Object.keys(details).length || '-'}</div>
                </div>
              </div>
            </section>

            {/* Overall Feedback */}
            {feedback && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Đánh giá tổng thể</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Điểm tổng thể</div>
                    <div className="text-2xl font-bold text-[#0065ca]">{typeof feedback.overall_score === 'number' ? `${feedback.overall_score} / 100` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Khuyến nghị</div>
                    <div className="font-semibold">{feedback.hiring_recommendation || '-'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold mb-1">Điểm mạnh</div>
                    <p className="text-gray-700 whitespace-pre-wrap">{feedback.strengths || '-'}</p>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Điểm cần cải thiện</div>
                    <p className="text-gray-700 whitespace-pre-wrap">{feedback.weaknesses || '-'}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Details */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Chi tiết theo câu hỏi</h2>
              <div className="space-y-4">
                {Object.keys(details).length === 0 && (
                  <div className="text-gray-600">Không có dữ liệu chi tiết.</div>
                )}
                {Object.entries(details).map(([qid, item]: any) => (
                  <div key={qid} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Câu {qid}</div>
                        <div className="font-medium whitespace-pre-wrap break-words">{item.question || item.prompt || '-'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Điểm</div>
                        <div className="font-semibold">{typeof item.overall_score === 'number' ? item.overall_score.toFixed(1) : (item.overall_score ?? '-')}</div>
                      </div>
                    </div>
                    {item.answer && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-500 mb-1">Câu trả lời của ứng viên</div>
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 whitespace-pre-wrap break-words text-gray-800">{item.answer}</div>
                      </div>
                    )}
                    {item.feedback && (
                      <div className="mt-3 text-gray-700 whitespace-pre-wrap break-words">{item.feedback}</div>
                    )}
                    {/* Optional sub-scores */}
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700">
                      {['correctness','coverage','reasoning','creativity','communication','attitude'].map((k) => (
                        item[k] !== undefined ? (
                          <div key={k} className="flex justify-between"><span className="text-gray-500 capitalize">{k}</span><span className="font-medium">{item[k]}</span></div>
                        ) : null
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex gap-3">
              <a href={`/api/view-result/${encodeURIComponent(filename)}`} target="_blank" className="btn btn-secondary px-4 py-2 border">
                Xem JSON thô
              </a>
              <a href={`http://localhost:5000/download/${encodeURIComponent(filename)}`} className="btn btn-primary bg-[#0065ca] text-white px-4 py-2">
                Tải xuống
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
