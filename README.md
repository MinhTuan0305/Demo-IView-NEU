# Backend (Flask) – AI Interview & Supabase

Flask backend cung cấp API tạo câu hỏi phỏng vấn từ CV/JD, nộp bài phỏng vấn và chấm điểm AI. Hỗ trợ lưu trữ bằng Supabase (DB-first) và fallback file cục bộ khi DB chưa sẵn sàng.

## 🚀 Features

- **CV Processing**: Supports both PDF and image formats (PNG, JPG, JPEG, BMP, TIFF)
- **Smart Question Generation**: Creates 9 tailored interview questions based on CV content and job requirements
- **Interactive Interview**: Conducts real-time interviews with candidates
- **AI-Powered Evaluation**: Automatically scores responses across multiple criteria
- **Multi-language Support**: Vietnamese and English interface support
- **Flexible Job Levels**: Supports Intern, Fresher, Junior, Senior, and Lead levels

## 📋 System Overview

The system consists of three main components:

1. **Question Generator** (`generate_questions.py`) - Extracts CV content and generates interview questions
2. **Interactive Interview** (`ask.py`) - Conducts the actual interview session
3. **Response Evaluator** (`evaluate.py`) - Scores candidate responses using AI

## 🛠️ Prerequisites

- Python 3.10+
- Google Gemini API Key – lấy tại: https://aistudio.google.com/app/apikey
- (Khuyến nghị) Supabase Project – dùng cho lưu trữ DB
- Tesseract OCR (nếu muốn OCR ảnh/PDF)

## 🔧 Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd interview-ai-main
pip install -r requirements.txt
```

### 2. Cấu hình `.env` (đặt trong thư mục `backend`)

```env
SUPABASE_URL=https://<PROJECT-REF>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
# (tùy chọn) SUPABASE_ANON_KEY=<ANON_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_KEY>
```

- Kiểm tra biến env: `GET /api/health/env` → các key trả `true`.
- Kiểm tra DB: `GET /api/health/db` → `{ "ok": true }`.

### Installing Tesseract OCR

**Windows:**
```bash
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Or use chocolatey:
choco install tesseract
```

**macOS:**
```bash
brew install tesseract
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install tesseract-ocr
```

## 📦 Cài đặt & chạy nhanh

```bash
cd backend
pip install -r requirements.txt
python app.py
```

3. **Optional: Install PDF processing dependencies:**
```bash
# For enhanced PDF processing
pip install pdf2image
# Install poppler for pdf2image
# macOS: brew install poppler
# Ubuntu: sudo apt-get install poppler-utils
```

2. **Place CV files:**
Put your CV files (PDF or images) in the `CV/` directory.

## 🎯 API chính

1) Tạo câu hỏi từ CV/JD (frontend gọi):
- `POST /api/upload_cv` (multipart) → fields: `cv_file`, optional `jd_file`, `job_title`, `level`.
- Lấy câu hỏi: `GET /api/questions/<filename>`; resolver: `GET /api/resolve_questions_file?hint=...`, `GET /api/latest_questions_file`.

2) Nộp bài phỏng vấn (frontend gửi JSON):
- `POST /submit_interview` → trả `{ queued: true, log_file: "id:<log_id>" | "responses_*.json" }`.
- Luồng chờ: `GET /api/result_status?log=id:<log_id>` (DB) hoặc `log=responses_*.json` (file).

3) Xem lịch sử/kết quả:
- Lịch sử: `GET /api/history` (ưu tiên DB – join với `evaluate_results`).
- Kết quả: `GET /api/view_result?hint=id:<result_id>` (DB) hoặc `GET /api/view_result/<filename>` (file).

**Evaluation Criteria:**
- **Correctness**: Accuracy compared to expected key points
- **Coverage**: How many key points were addressed
- **Reasoning**: Logical explanation and argumentation
- **Creativity**: Examples and unique expressions
- **Communication**: Clarity and coherence
- **Attitude**: Positive or negative attitude

**Output:** Detailed scoring results saved to `outputs/evaluate_results/`

**Kết quả bao gồm:**
- **Điểm từng câu hỏi**: Chi tiết điểm số cho từng câu trả lời
- **Điểm trung bình**: Điểm trung bình của toàn bộ cuộc phỏng vấn
- **Đánh giá tổng thể**: Phân tích AI về điểm mạnh, điểm cần cải thiện
- **Khuyến nghị tuyển dụng**: Gợi ý về việc có nên tuyển dụng ứng viên hay không

## 📁 Thư mục quan trọng

```
backend/
├── interview_question/          # Câu hỏi sinh ra (.questions.json)
├── outputs/
│   ├── interview_logs/          # Log phỏng vấn (fallback file)
│   └── evaluate_results/        # Kết quả chấm (fallback file)
├── src/interview/               # generate_questions / ask / evaluate
├── app.py                       # Flask app (API)
├── requirements.txt
└── README.md
```

## 🔧 Technical Details

### Question Generation Process

1. **Text Extraction**: 
   - PDFs: Uses `pypdf` for text extraction, falls back to OCR if needed
   - Images: Uses Tesseract OCR for text recognition
   - Fallback: Direct image analysis with Gemini Vision API

2. **Question Structure**:
   - **Questions 1-3**: Opening questions (self-introduction, strengths/weaknesses, motivation)
   - **Questions 4-5**: Behavioral questions (teamwork, challenges, motivation)
   - **Questions 6-8**: Technical questions (tailored to job and seniority level)
   - **Questions 9-10**: CV-based questions (specific project experience)
   - **Question 11**: Creative/hypothetical scenario

3. **AI Models**: Uses Google Gemini 2.5 Flash for both text and vision processing

### Supported File Formats

- **Images**: PNG, JPG, JPEG, BMP, TIFF, TIF
- **Documents**: PDF

### Output Formats

- **Questions**: JSON format with structured question data
- **Interviews**: JSON format with timestamps and responses
- **Evaluations**: JSON format with detailed scoring breakdown

## 🚨 Troubleshooting

### Common Issues

1. **"Missing GEMINI_API_KEY"**
   - Ensure your `.env` file contains a valid API key
   - Check that the key has proper permissions

2. **"TesseractNotFoundError"**
   - Install Tesseract OCR following the platform-specific instructions
   - Ensure Tesseract is in your system PATH

3. **"No supported CV files found"**
   - Check that CV files are in the correct directory
   - Verify file extensions are supported

4. **"Model did not return valid JSON"**
   - The AI response will be saved as `.raw.txt` for inspection
   - Try running the generation again

### Performance Tips

- For large PDFs, consider using `pdf2image` for better OCR results
- Ensure good image quality for better text extraction
- Use specific job titles and levels for more targeted questions

## 📊 Example Output

### Generated Questions Structure
```json
[
  {
    "id": 1,
    "question": "Hãy giới thiệu bản thân và trình bày về kinh nghiệm làm việc của bạn.",
    "category": "opening",
    "purpose": "Đánh giá khả năng trình bày và tự tin"
  },
  {
    "id": 2,
    "question": "Khi làm việc với Data Science ở cấp Senior, bạn sẽ thiết kế một hệ thống ML pipeline như thế nào để đảm bảo scalability và maintainability?",
    "category": "technical",
    "purpose": "Đánh giá kiến thức kỹ thuật và khả năng thiết kế hệ thống",
    "focus": "ML pipeline design"
  }
]
```

### Evaluation Results Structure
```json
{
  "summary": {
    "candidate_name": "John Doe",
    "interview_date": "2024-01-15 14:30:00",
    "average_overall_score": 78.5,
    "questions_scored": 9
  },
  "details": {
    "1": {
      "correctness": 8,
      "coverage": 7,
      "reasoning": 6,
      "creativity": 5,
      "communication": 9,
      "attitude": 10,
      "overall_score": 75,
      "feedback": "Ứng viên trình bày rõ ràng nhưng cần cải thiện phần ví dụ cụ thể..."
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- Tesseract OCR for text extraction capabilities
- The open-source community for various Python libraries

---

**Note**: This system is designed for educational and assessment purposes. Always ensure compliance with data privacy regulations when processing candidate information.