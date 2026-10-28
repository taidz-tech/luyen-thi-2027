import React, { useState, useRef } from 'react';
import { User } from '../types';
import { MathText } from './MathText';
import { 
  Eye, Camera, Upload, Sparkles, X, Brain, CheckCircle2, 
  AlertTriangle, BookOpen, Send, RefreshCw, Image as ImageIcon 
} from 'lucide-react';

interface VisionTutorModalProps {
  currentUser: User;
  onClose: () => void;
}

export const VisionTutorModal: React.FC<VisionTutorModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [subject, setSubject] = useState<string>('Toán');
  const [taskType, setTaskType] = useState<string>('handwriting_math');
  const [userQuery, setUserQuery] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setErrorMsg('Không thể truy cập camera. Vui lòng cấp quyền hoặc tải ảnh trực tiếp từ máy.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);
      setMimeType('image/jpeg');
    }
    stopCamera();
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setErrorMsg('Vui lòng chụp ảnh hoặc tải lên hình ảnh bài làm.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/gemini/vision-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType,
          userQuery: userQuery.trim() || undefined,
          subject,
          taskType,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        setErrorMsg(data.error || 'Không thể phân tích ảnh lúc này.');
      }
    } catch (err: any) {
      console.error('Vision tutor error:', err);
      setErrorMsg('Đã có lỗi xảy ra trong quá trình truyền dữ liệu tới AI.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
              <Eye className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  Gia Sư AI Đa Phương Thức (Vision Tutor)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Chuẩn Khung Bộ GD&ĐT 2027
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                Nhận Diện Chữ Viết Tay, Đồ Thị & Chấm Tự Luận VDC
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Chụp ảnh nháp hoặc bài thi để AI chỉ ra các bẫy tinh vi, giải 4 bước mạch lạc và gợi ý mẹo Casio bấm máy nhanh.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Môn học cần hỗ trợ:
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
            >
              <option value="Toán">Môn Toán (Đại số, Hình học Oxyz, Giải tích)</option>
              <option value="Lí">Môn Vật Lí (Dao động, Sóng cơ, Điện xoay chiều)</option>
              <option value="Hóa">Môn Hóa Học (Hữu cơ Este, Vô cơ, Đồ thị phản ứng)</option>
              <option value="Sinh">Môn Sinh Học (Di truyền, Sinh thái, Tế bào)</option>
              <option value="Văn">Môn Ngữ Văn (Nghị luận xã hội & văn học)</option>
              <option value="Anh">Môn Tiếng Anh (Đọc hiểu, Điền từ, Ngữ pháp)</option>
              <option value="ĐGNL V-ACT">ĐGNL V-ACT ĐHQG (Tư duy logic & Số liệu)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mục tiêu phân tích:
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
            >
              <option value="handwriting_math">Nhận diện nháp viết tay & Tìm bẫy tinh vi</option>
              <option value="geometry_graph">Bóc tách đồ thị hàm số, bảng biến thiên & hình học</option>
              <option value="essay_vdc">Chấm tự luận Vận dụng cao (VDC) theo 4 bước chuẩn</option>
              <option value="literature_essay">Môn Văn: Gợi ý nâng cấp từ ngữ & Mở rộng luận điểm</option>
            </select>
          </div>
        </div>

        {/* Input Photo or Camera */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer transition"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Tải Ảnh Từ Thiết Bị</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-2 border border-sky-500/40 cursor-pointer transition"
              >
                <Camera className="w-4 h-4" />
                <span>Mở Camera Chụp Trực Tiếp</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={capturePhoto}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Chụp Ngay</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Hủy Camera
                </button>
              </div>
            )}
          </div>

          {/* Camera View */}
          {isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-sky-500/50 aspect-video max-h-80">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-500/80 text-white text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                Camera Trực Tiếp
              </div>
            </div>
          )}

          {/* Selected Image Preview */}
          {imagePreview && !isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 max-h-80 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Bài làm thí sinh"
                className="max-h-72 object-contain rounded-xl"
              />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Optional Query / Question Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Câu hỏi hoặc điểm bạn chưa hiểu rõ (Tùy chọn):
            </label>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ví dụ: Em chưa hiểu vì sao đạo hàm đổi dấu ở x = 2; hoặc chỉ cho em bẫy ở câu này..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !imagePreview}
            className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition cursor-pointer ${
              analyzing || !imagePreview
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-sky-500/20'
            }`}
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-300" />
                <span>Gia Sư AI Vision Đang Quét & Giải Từng Bước Chuẩn 4 Bước...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Bắt Đầu Phân Tích & Giải Chi Tiết</span>
              </>
            )}
          </button>
        </div>

        {/* Analysis Result Display */}
        {analysisResult && (
          <div className="p-6 rounded-3xl bg-slate-950 border border-sky-500/40 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-sky-400 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Kết Quả Phân Tích Chuyên Sâu Từ Gia Sư AI 2027
              </h4>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2 prose prose-invert max-w-none">
              <MathText content={analysisResult} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
