'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { api } from '@/lib/api';

interface Question {
  id: number;
  question: string;
  category?: string;
  purpose?: string;
}

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionsFile = searchParams.get('questions_file');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [candidateName, setCandidateName] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!questionsFile) {
      router.push('/');
      return;
    }

    let cancelled = false;

    const fetchWithRetry = async (attempt = 1) => {
      try {
        const result = await api.getQuestions(questionsFile);
        const data = result?.data && Array.isArray(result.data) ? result.data : result; // support resolved wrapper
        if (!cancelled) {
          setQuestions(data);
          setLoading(false);
        }
      } catch (error) {
        // Retry up to 6 times with backoff (0.5s, 1s, 2s, 3s, 4s, 5s)
        if (attempt < 6) {
          const delayMs = Math.min(500 * Math.pow(2, attempt - 1), 5000);
          setTimeout(() => fetchWithRetry(attempt + 1), delayMs);
        } else {
          if (!cancelled) {
            console.error('Failed to fetch questions after retries:', error);
            alert(`Không thể tải câu hỏi. Vui lòng thử lại.\nquestions_file=${questionsFile}\nChi tiết: ${error instanceof Error ? error.message : String(error)}`);
            setLoading(false);
          }
        }
      }
    };

    fetchWithRetry();

    return () => { cancelled = true; };
  }, [questionsFile, router]);

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!candidateName || !candidateId) {
      alert('Vui lòng nhập tên và ID ứng viên');
      return;
    }

    const responses = questions.map(q => ({
      id: q.id,
      question: q.question,
      response: answers[q.id] || ''
    }));

    setSubmitting(true);

    try {
      const resp = await api.submitInterview({
        candidate_name: candidateName,
        candidate_id: candidateId,
        responses
      });

      const logFile = resp?.log_file;
      if (logFile) {
        router.push(`/wait/${encodeURIComponent(logFile)}`);
        return;
      }

      alert('Phỏng vấn hoàn thành! Đi đến lịch sử.');
      router.push('/history');
    } catch (error) {
      console.error('Failed to submit interview:', error);
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải câu hỏi...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id] || '';
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = questions.every(q => answers[q.id] && answers[q.id].trim() !== '');

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-5 py-10">
        {/* Candidate Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin ứng viên</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Tên ứng viên</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                placeholder="Nhập tên ứng viên"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">ID ứng viên</label>
              <input
                type="text"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                placeholder="Nhập ID ứng viên"
              />
            </div>
          </div>
        </div>

        {/* Question Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              Câu hỏi {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              Đã trả lời: {Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#0065ca] h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#0065ca] bg-[#eef4ff] px-2 py-1 rounded">
              {currentQuestion.category || 'Câu hỏi'}
            </span>
          </div>
          <h3 className="text-2xl font-semibold mb-4">{currentQuestion.question}</h3>
          {currentQuestion.purpose && (
            <p className="text-gray-600 mb-6 italic">{currentQuestion.purpose}</p>
          )}
          
          <div>
            <label className="block font-medium mb-2">Câu trả lời của bạn:</label>
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              placeholder="Nhập câu trả lời của bạn ở đây..."
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Câu trước
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting || !candidateName || !candidateId}
              className="px-6 py-3 bg-[#0065ca] text-white rounded-lg hover:bg-[#004a95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-[#0065ca] text-white rounded-lg hover:bg-[#004a95] transition-colors"
            >
              Câu tiếp →
            </button>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}

