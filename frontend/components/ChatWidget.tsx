'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ content: string; sender: 'user' | 'ai' }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('xin chào') || message.includes('hello') || message.includes('hi')) {
      return 'Xin chào! Tôi rất vui được hỗ trợ bạn. Bạn cần giúp gì về hệ thống iView NEU?';
    }
    
    if (message.includes('phỏng vấn') || message.includes('interview')) {
      return 'Để chuẩn bị tốt cho phỏng vấn, bạn nên: 1) Nghiên cứu kỹ về công ty/vị trí, 2) Chuẩn bị CV và portfolio, 3) Luyện tập trả lời các câu hỏi thường gặp, 4) Chuẩn bị câu hỏi cho nhà tuyển dụng.';
    }
    
    if (message.includes('thi') || message.includes('vấn đáp') || message.includes('môn học')) {
      return 'Để thi vấn đáp hiệu quả: 1) Ôn tập kỹ lý thuyết, 2) Chuẩn bị ví dụ thực tế, 3) Luyện tập trình bày rõ ràng, 4) Chuẩn bị câu hỏi mở rộng. Bạn đang ôn môn nào?';
    }
    
    return 'Cảm ơn bạn đã hỏi! Tôi có thể giúp bạn với các vấn đề về phỏng vấn, thi vấn đáp, hoặc sử dụng hệ thống iView NEU. Bạn muốn tìm hiểu gì?';
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { content: userMessage, sender: 'user' }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setMessages(prev => [...prev, { content: aiResponse, sender: 'ai' }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#0065ca] rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-[#0065ca] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-white/80">Sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-2xl hover:scale-110 transition-transform">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👋</div>
                <p className="text-gray-600 mb-4">Xin chào! Tôi là AI Assistant của iView NEU. Tôi có thể giúp bạn:</p>
                <ul className="text-left text-sm text-gray-600 space-y-2">
                  <li>• Hướng dẫn sử dụng hệ thống</li>
                  <li>• Giải đáp thắc mắc về phỏng vấn</li>
                  <li>• Gợi ý câu hỏi luyện tập</li>
                  <li>• Hỗ trợ kỹ thuật</li>
                </ul>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">🤖</div>
                )}
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-[#0065ca] text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.content}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 bg-[#0065ca] rounded-full flex items-center justify-center flex-shrink-0 text-white">👤</div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">🤖</div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                rows={1}
              />
              <button
                onClick={handleSend}
                className="bg-[#0065ca] text-white px-4 py-2 rounded-lg hover:bg-[#004a95] transition-colors"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

