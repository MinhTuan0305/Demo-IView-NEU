import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function GuidePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-semibold mb-8">Hướng Dẫn Sử Dụng</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-[#0065ca] mb-4">1. Tạo Phiên Phỏng Vấn</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Để bắt đầu, bạn cần tạo một phiên phỏng vấn mới. Có hai loại:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Thi vấn đáp môn học:</strong> Dành cho sinh viên ôn tập hoặc thi vấn đáp theo giáo trình</li>
              <li><strong>Phỏng vấn việc làm:</strong> Mô phỏng phỏng vấn xin việc theo CV và mô tả công việc</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0065ca] mb-4">2. Upload Tài Liệu</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Sau khi chọn loại phỏng vấn, bạn cần upload:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>CV:</strong> File PDF hoặc hình ảnh (PNG, JPG)</li>
              <li><strong>JD (Job Description):</strong> Mô tả công việc hoặc giáo trình môn học</li>
              <li><strong>Thông tin:</strong> Vị trí công việc và level (Intern, Fresher, Junior, Senior, Lead)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0065ca] mb-4">3. Thực Hiện Phỏng Vấn</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Sau khi AI tạo câu hỏi, bạn sẽ:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Đọc từng câu hỏi</li>
              <li>Trả lời bằng cách nhập text hoặc ghi âm</li>
              <li>Xem thời gian đã sử dụng</li>
              <li>Nộp bài sau khi hoàn thành</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0065ca] mb-4">4. Xem Kết Quả</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Sau khi nộp bài, AI sẽ đánh giá và cho điểm:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Điểm từng câu hỏi</li>
              <li>Điểm trung bình tổng thể</li>
              <li>Nhận xét chi tiết về điểm mạnh và điểm yếu</li>
              <li>Khuyến nghị cải thiện</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0065ca] mb-4">5. Dashboard và Lịch Sử</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bạn có thể:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Xem thống kê tổng quan trên Dashboard</li>
              <li>Theo dõi tiến bộ theo thời gian</li>
              <li>Xem lại lịch sử các phiên phỏng vấn</li>
              <li>So sánh kết quả giữa các phiên</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

