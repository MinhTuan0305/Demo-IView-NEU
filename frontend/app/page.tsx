import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <header 
        className="relative py-36 px-20 text-white"
        style={{
          backgroundImage: "url('/images/Gemini_Generated_Image_cmhadocmhadocmha.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-2xl">
          <span className="inline-block bg-white/20 px-4 py-2 text-sm uppercase tracking-wider mb-4">
            WITH AI INTERVIEW & TRAINING
          </span>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Siêu Nâng Cấp Kỹ Năng Phỏng Vấn <br /> Với AI
          </h1>
          <p className="text-lg mb-8 leading-relaxed">
            Nền tảng luyện phỏng vấn & thi vấn đáp dành cho sinh viên NEU. 
            Luyện tập như thật – phản hồi tức thì – cải thiện từng buổi một.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <span className="bg-[#C5F7C6] text-[#064C1B] px-4 py-2 text-xs font-semibold uppercase tracking-wide">INTERVIEW PRACTICE</span>
            <span className="bg-[#DDD0FF] text-[#40247A] px-4 py-2 text-xs font-semibold uppercase tracking-wide">AI EVALUATION</span>
            <span className="bg-[#D1EBFF] text-[#1A4F8B] px-4 py-2 text-xs font-semibold uppercase tracking-wide">ACADEMIC ORAL TEST</span>
            <span className="bg-[#FFE9A7] text-[#7C5A00] px-4 py-2 text-xs font-semibold uppercase tracking-wide">JOB SIMULATION</span>
            <span className="bg-[#C7F1F2] text-[#236264] px-4 py-2 text-xs font-semibold uppercase tracking-wide">VOICE ANSWERS</span>
          </div>

          <Link 
            href="/create-session" 
            className="inline-block px-9 py-4 bg-[#0056da] text-white font-semibold uppercase tracking-wide transition-all hover:bg-[#004a95] hover:-translate-y-0.5"
          >
            Bắt đầu luyện tập
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-5 text-center">
        <h2 className="text-[#0065ca] text-3xl mb-8 font-semibold">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-5">
          <div className="bg-white p-8 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-md border border-transparent hover:border-[#0065ca]">
            <h3 className="text-[#0065ca] text-xl font-semibold mb-3 tracking-wide">Phỏng vấn mô phỏng thực tế</h3>
            <p className="text-[#5f6368] leading-relaxed">Trả lời theo hình thức nói hoặc chat, có bấm thời gian.</p>
          </div>
          <div className="bg-white p-8 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-md border border-transparent hover:border-[#0065ca]">
            <h3 className="text-[#0065ca] text-xl font-semibold mb-3 tracking-wide">Tùy chỉnh theo CV / JD / Môn học</h3>
            <p className="text-[#5f6368] leading-relaxed">Tải lên CV, mô tả công việc hoặc giáo trình để AI tạo câu hỏi phù hợp.</p>
          </div>
          <div className="bg-white p-8 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-md border border-transparent hover:border-[#0065ca]">
            <h3 className="text-[#0065ca] text-xl font-semibold mb-3 tracking-wide">Đánh giá AI từng câu + Tổng quan</h3>
            <p className="text-[#5f6368] leading-relaxed">Nhận nhận xét điểm mạnh, điểm yếu và gợi ý cải thiện.</p>
          </div>
          <div className="bg-white p-8 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-md border border-transparent hover:border-[#0065ca]">
            <h3 className="text-[#0065ca] text-xl font-semibold mb-3 tracking-wide">Lưu trữ lịch sử & Dashboard cá nhân</h3>
            <p className="text-[#5f6368] leading-relaxed">Xem lại toàn bộ session, theo dõi tiến bộ theo thời gian.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-15 px-20 bg-[#f3f7ff] text-center">
        <h2 className="text-3xl font-semibold mb-8">Tại sao sinh viên NEU nên sử dụng nền tảng này?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mt-8">
          <div className="bg-white p-8 shadow-sm transition-all hover:border-[#0065ca] hover:-translate-y-1 border border-transparent">
            <h3 className="text-xl font-semibold mb-3 tracking-wide">Thực hành không giới hạn</h3>
            <p className="text-[#5f6368]">Luyện tập bất cứ lúc nào — 2 giờ sáng trước kỳ thi hay 5 phút trước buổi phỏng vấn thật.</p>
          </div>
          <div className="bg-white p-8 shadow-sm transition-all hover:border-[#0065ca] hover:-translate-y-1 border border-transparent">
            <h3 className="text-xl font-semibold mb-3 tracking-wide">AI phản hồi như giảng viên / nhà tuyển dụng thật</h3>
            <p className="text-[#5f6368]">Không chỉ chấm điểm, AI còn chỉ ra lỗi diễn đạt, thiếu logic, từ ngữ chưa chuyên nghiệp.</p>
          </div>
          <div className="bg-white p-8 shadow-sm transition-all hover:border-[#0065ca] hover:-translate-y-1 border border-transparent">
            <h3 className="text-xl font-semibold mb-3 tracking-wide">Cá nhân hóa theo từng người</h3>
            <p className="text-[#5f6368]">Tải lên CV, bảng điểm hoặc học phần — hệ thống tự động tạo câu hỏi đúng trình độ của bạn.</p>
          </div>
          <div className="bg-white p-8 shadow-sm transition-all hover:border-[#0065ca] hover:-translate-y-1 border border-transparent">
            <h3 className="text-xl font-semibold mb-3 tracking-wide">Theo dõi tiến bộ theo thời gian</h3>
            <p className="text-[#5f6368]">Bạn không chỉ "luyện", bạn sẽ thấy mình ngày càng giỏi hơn sau mỗi phiên.</p>
          </div>
        </div>
      </section>

      {/* CTA Large */}
      <section className="py-25 px-20 text-center bg-gradient-to-r from-[#0065ca] to-[#004a95] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative">
          <h2 className="text-3xl font-semibold mb-6">Đừng đợi đến lúc thật mới luyện tập</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Các ứng viên xuất sắc đều có một điểm chung: họ chuẩn bị trước. Bạn cũng có thể bắt đầu ngay từ hôm nay.
          </p>
          <Link 
            href="/create-session" 
            className="inline-block px-10 py-4.5 bg-white text-[#0065ca] font-semibold uppercase tracking-wide transition-all hover:bg-[#f5f7fb] hover:-translate-y-0.5 text-lg"
          >
            Tạo phiên luyện tập đầu tiên
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
