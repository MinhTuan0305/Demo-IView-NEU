import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import Link from 'next/link';

export default function CreateSessionPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="max-w-4xl mx-auto px-5 py-20 text-center">
        <h2 className="text-3xl font-semibold mb-10">Bạn muốn bắt đầu loại phỏng vấn nào?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/upload-cv" className="bg-white p-10 rounded-lg shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-[#0065ca] text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-3 text-[#0065ca]">Thi vấn đáp môn học</h3>
            <p className="text-[#5f6368] leading-relaxed">
              Dành cho sinh viên ôn tập hoặc thi vấn đáp theo giáo trình hoặc môn học.
            </p>
          </Link>

          <Link href="/upload-cv" className="bg-white p-10 rounded-lg shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-[#0065ca] text-center">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold mb-3 text-[#0065ca]">Phỏng vấn việc làm</h3>
            <p className="text-[#5f6368] leading-relaxed">
              Mô phỏng phỏng vấn xin việc theo CV và mô tả công việc (JD).
            </p>
          </Link>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}

