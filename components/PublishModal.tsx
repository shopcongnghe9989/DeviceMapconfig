
import React, { useState } from 'react';

interface PublishModalProps {
  url: string;
  onClose: () => void;
}

const PublishModal: React.FC<PublishModalProps> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11m-12.8 19.2a11 11 0 1114.9-15.5" />
            </svg>
            Xuất bản hệ thống online
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-slate-400 text-sm leading-relaxed">
            Link này chứa toàn bộ dữ liệu dự án của bạn. Bạn có thể gửi link này cho khách hàng để họ xem sơ đồ lắp đặt trực tuyến mà không cần cài đặt phần mềm.
          </p>
          
          <div className="relative group">
            <input 
              readOnly
              value={url}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-slate-300 focus:outline-none font-mono"
            />
            <button 
              onClick={handleCopy}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors text-white"
              title="Sao chép link"
            >
              {copied ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              )}
            </button>
          </div>
          
          {copied && (
            <div className="text-green-500 text-xs font-medium animate-pulse text-center">
              Đã sao chép vào bộ nhớ tạm!
            </div>
          )}

          <div className="p-4 bg-amber-900/20 border border-amber-900/30 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-amber-200/80 italic">
                Lưu ý: Nếu hình ảnh sơ đồ quá lớn, link có thể không hoạt động trên một số trình duyệt do giới hạn độ dài URL. Khuyên dùng tính năng "Xuất JSON" cho các dự án lớn.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-800/30 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
