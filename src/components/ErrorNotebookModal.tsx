import React, { useState } from 'react';
import { User, ErrorNotebookItem, Question, Exam } from '../types';
import { StorageService } from '../services/storage';
import { MathText } from './MathText';
import { 
  BookOpen, Sparkles, Trash2, CheckCircle, RefreshCw, 
  X, AlertCircle, ArrowRight, Play, ShieldAlert, Award 
} from 'lucide-react';

interface ErrorNotebookModalProps {
  currentUser: User;
  onClose: () => void;
  onStartCustomExam: (customExam: Exam) => void;
}

export const ErrorNotebookModal: React.FC<ErrorNotebookModalProps> = ({
  currentUser,
  onClose,
  onStartCustomExam,
}) => {
  const [errorItems, setErrorItems] = useState<ErrorNotebookItem[]>(() =>
    StorageService.getErrorNotebook(currentUser.id)
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredItems = errorItems.filter((item) => {
    if (selectedSubject === 'all') return true;
    return item.subject.toLowerCase().includes(selectedSubject.toLowerCase());
  });

  const handleRemove = (itemId: string) => {
    StorageService.removeErrorItem(currentUser.id, itemId);
    setErrorItems(StorageService.getErrorNotebook(currentUser.id));
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ sổ tay lỗi sai này không?')) {
      StorageService.clearErrorNotebook(currentUser.id);
      setErrorItems([]);
    }
  };

  const handleCreateMiniTest = () => {
    if (errorItems.length === 0) return;

    // Use up to 10 questions from the error notebook
    const selectedErrorQuestions = errorItems.slice(0, 10).map((err, idx) => ({
      ...err.question,
      id: `err_q_${idx + 1}`,
      section: `Câu Sửa Sai ${idx + 1} (Từ bài: ${err.examTitle})`,
      points: 10.0 / Math.min(errorItems.length, 10),
    }));

    const miniExam: Exam = {
      id: `error-minitest-${Date.now()}`,
      title: `⚡ Mini-Test Khắc Phục Lỗi Sai Cá Nhân Hóa (${selectedErrorQuestions.length} Câu)`,
      category: 'practice_quiz',
      subject: errorItems[0]?.subject || 'Tổng Hợp Lỗi Sai',
      examType: 'practice',
      timeMinutes: null,
      totalPoints: 10.0,
      description: `Đề thi trích xuất từ chính các câu bạn đã từng làm sai trong quá khứ. Hoàn thành đề này giúp bạn loại bỏ hoàn toàn các bẫy tinh vi và tự tin 100% trong phòng thi thật!`,
      createdBy: 'Smart Error Notebook AI',
      createdAt: Date.now(),
      questions: selectedErrorQuestions,
    };

    onClose();
    onStartCustomExam(miniExam);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  Smart Error Notebook 2027
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {errorItems.length} câu đã lưu
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                Sổ Tay Lỗi Sai & Cạm Bẫy Đề Thi
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tự động lưu toàn bộ các câu làm sai. Xem lại phân tích cạm bẫy và tạo đề mini-test luyện tập để không bao giờ lặp lại lỗi sai trong kỳ thi thật.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Lọc môn:</span>
            {['all', 'Toán', 'Anh', 'Lí', 'Hóa', 'ĐGNL'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedSubject === s
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {s === 'all' ? 'Tất Cả' : s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {errorItems.length > 0 && (
              <>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Tất Cả</span>
                </button>
                <button
                  onClick={handleCreateMiniTest}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tạo Mini-Test Sửa Sai ({Math.min(errorItems.length, 10)} câu)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error Items List */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-950/40 border border-slate-800/80 space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Sổ tay lỗi sai hiện đang trống!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Khi làm bài thi hoặc bấm nút "Check", bất kỳ câu nào bạn làm chưa đúng sẽ được AI tự động gom vào đây kèm theo phân tích cạm bẫy để ôn luyện lại.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Câu #{idx + 1} • {item.subject}
                    </span>
                    <span className="text-xs text-slate-400">
                      Từ đề: <strong className="text-slate-300">{item.examTitle}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Xóa câu này khỏi sổ tay"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Prompt */}
                <div className="text-sm font-medium text-slate-200">
                  <MathText content={item.question.prompt} />
                </div>

                {/* Answer comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Đáp án bạn đã chọn (Chưa đúng):
                    </span>
                    <div className="font-semibold text-rose-200">
                      {typeof item.userAnswer === 'number'
                        ? (item.question.type === 'multiple_choice' ? item.question.options[item.userAnswer] : `Lựa chọn #${item.userAnswer + 1}`)
                        : typeof item.userAnswer === 'string'
                        ? item.userAnswer
                        : JSON.stringify(item.userAnswer)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Đáp án chính xác:
                    </span>
                    <div className="font-semibold text-emerald-200">
                      {item.correctAnswerText || 'Theo hướng dẫn giải chuẩn'}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-400 block mb-1">Phương pháp giải chuẩn & cạm bẫy:</strong>
                  <MathText content={item.question.explanation || 'Xem lại lý thuyết và công thức cốt lõi.'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
