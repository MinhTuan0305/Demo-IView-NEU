import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="min-h-[calc(100vh-64px-300px)] flex items-center justify-center py-10 px-5">
        <div className="bg-white p-12 shadow-lg w-full max-w-[420px] border border-black/8">
          <h2 className="text-[#0065ca] text-center mb-2 text-3xl font-semibold uppercase tracking-wide">Đăng Nhập</h2>
          <p className="text-center text-[#5f6368] mb-8">Chào mừng bạn quay trở lại với iView</p>
          
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-medium text-[#202124]">Email</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Email sinh viên của bạn" 
                  required
                  className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-medium text-[#202124]">Mật khẩu</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Nhập mật khẩu" 
                  required
                  className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
                />
              </div>
              <a href="#" className="self-end text-[#0065ca] text-sm font-medium hover:text-[#004a95] transition-colors mt-1">
                Quên mật khẩu?
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="text-sm">Ghi nhớ đăng nhập</label>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-[#0065ca] text-white font-semibold uppercase tracking-wide transition-all hover:bg-[#004a95] text-base"
            >
              Đăng Nhập
            </button>
            
            <div className="flex items-center text-center text-[#5f6368] my-5">
              <div className="flex-1 border-b border-[#dfe3ea]"></div>
              <span className="px-2.5">hoặc</span>
              <div className="flex-1 border-b border-[#dfe3ea]"></div>
            </div>

            <button 
              type="button" 
              className="w-full py-4 bg-white border border-[#dfe3ea] font-medium uppercase tracking-wide transition-all hover:bg-[#f8f9fa] hover:border-[#0065ca] text-sm flex items-center justify-center gap-3"
            >
              <img src="https://tse3.mm.bing.net/th/id/OIP.Fll7WPtNT6jrz1oBP8GbCgHaHj?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Google Logo" className="w-5 h-5" />
              Đăng nhập bằng Google
            </button>

            <div className="text-center text-[#5f6368] mt-5">
              Chưa có tài khoản? <a href="#" className="text-[#0065ca] font-medium hover:underline">Đăng ký ngay</a>
            </div>
          </form>
        </div>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
}

