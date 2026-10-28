import React, { useState } from 'react';
import { User, KnowledgeTopic, Question, Exam } from '../types';
import { StorageService } from '../services/storage';
import { MathText } from './MathText';
import { 
  Brain, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Target, 
  ArrowRight, X, Flame, Play, RefreshCw, BarChart3, ShieldCheck 
} from 'lucide-react';

interface KnowledgeGraphModalProps {
  currentUser: User;
  onClose: () => void;
  onStartCustomExam: (customExam: Exam) => void;
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  currentUser,
  onClose,
  onStartCustomExam,
}) => {
  const [topics, setTopics] = useState<KnowledgeTopic[]>(() => 
    StorageService.getKnowledgeGraph(currentUser.id)
  );
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(null);
  const [generatingDrill, setGeneratingDrill] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const filteredTopics = topics.filter((t) => {
    if (subjectFilter === 'all') return true;
    return t.subject.toLowerCase().includes(subjectFilter.toLowerCase());
  });

  const weakTopicsCount = topics.filter((t) => t.weaknessLevel === 'weak').length;
  const strongTopicsCount = topics.filter((t) => t.weaknessLevel === 'strong').length;
  const avgMastery = Math.round(
    topics.reduce((acc, t) => acc + t.masteryPercent, 0) / (topics.length || 1)
  );

  const handleLaunchWeakDrill = async (topic: KnowledgeTopic) => {
    setGeneratingDrill(true);
    try {
      const res = await fetch('/api/gemini/generate-weak-topic-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: topic.name,
          subject: topic.subject,
          weaknessPercent: topic.masteryPercent,
        }),
      });

      const data = await res.json();
      let questions: Question[] = [];

      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        questions = data.questions.map((q: any, i: number) => ({
          id: `drill_${topic.id}_${i + 1}`,
          type: 'multiple_choice' as const,
          section: `Luyện Trúng Tủ: ${topic.name}`,
          prompt: q.prompt || `Câu hỏi luyện tập ${i + 1} chuyên đề ${topic.name}`,
          options: q.options || ['A. Phương án 1', 'B. Phương án 2', 'C. Phương án 3', 'D. Phương án 4'],
          correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
          points: 2.0,
          difficulty: 'medium' as const,
          explanation: q.explanation || `Lời giải chi tiết và phương pháp giải nhanh cho chuyên đề ${topic.name}.`,
        }));
      } else {
        // Fallback pre-seeded drill questions
        questions = [
          {
            id: `drill_${topic.id}_1`,
            type: 'multiple_choice',
            section: `Luyện Trúng Tủ: ${topic.name}`,
            prompt: `[Khắc Phục Lỗ Hổng 2027] Cho bài toán trọng tâm thuộc ${topic.name}. Giá trị cực trị hoặc tham số m thỏa mãn điều kiện đề bài là:`,
            options: ['A. m > 2', 'B. m < -1', 'C. -1 ≤ m ≤ 2', 'D. Không tồn tại m'],
            correctOptionIndex: 2,
            points: 2.0,
            difficulty: 'medium',
            explanation: `Phương pháp tư duy bẫy cho ${topic.name}: Lập điều kiện cần và đủ, loại trừ các nghiệm vi phạm tập xác định để thu được $-1 \\le m \\le 2$.`,
          },
          {
            id: `drill_${topic.id}_2`,
            type: 'multiple_choice',
            section: `Luyện Trúng Tủ: ${topic.name}`,
            prompt: `Phát hiện bẫy tinh vi thường gặp trong phần ${topic.name}: Mệnh đề nào sau đây diễn đạt bản chất toán học chính xác nhất?`,
            options: [
              'A. Điều kiện cần luôn suy ra trực tiếp điều kiện đủ mà không cần thử lại',
              'B. Bắt buộc kiểm tra dấu của đạo hàm cấp 2 hoặc dấu đổi qua nghiệm',
              'C. Mọi hàm bậc 3 đều có đúng hai điểm cực trị đối xứng qua gốc tọa độ',
              'D. Tiệm cận ngang luôn cắt đồ thị hàm số tại ít nhất một điểm'
            ],
            correctOptionIndex: 1,
            points: 2.0,
            difficulty: 'medium',
            explanation: 'Bẫy đề 2027: Rất nhiều thí sinh quên kiểm tra sự đổi dấu của đạo hàm. Bắt buộc phải thỏa mãn đổi dấu để xác định cực trị.',
          },
          {
            id: `drill_${topic.id}_3`,
            type: 'multiple_choice',
            section: `Luyện Trúng Tủ: ${topic.name}`,
            prompt: `Một câu hỏi phân loại 8.5+ điểm về ${topic.name}: Kết quả tính toán chuẩn theo công thức giải nhanh là:`,
            options: ['A. S = 12π', 'B. S = 24π', 'C. S = 16π', 'D. S = 8π'],
            correctOptionIndex: 1,
            points: 2.0,
            difficulty: 'hard',
            explanation: 'Sử dụng công thức tính nhanh diện tích và thể tích chuẩn Bộ GD&ĐT 2027 thu được $S = 24\\pi$.',
          },
        ];
      }

      const drillExam: Exam = {
        id: `drill-exam-${topic.id}-${Date.now()}`,
        title: `⚡ Luyện Trúng Tủ: ${topic.name} (Khắc Phục Lỗ Hổng ${topic.masteryPercent}%)`,
        category: 'practice_quiz',
        subject: topic.subject,
        examType: 'practice',
        timeMinutes: null,
        totalPoints: 10.0,
        description: `Bài luyện tập trúng tủ do AI thiết kế nhắm thẳng vào lỗ hổng kiến thức (${topic.name}) của bạn. Làm xong sẽ lập tức nâng cao tỷ lệ làm chủ chuyên đề.`,
        createdBy: 'Hệ Thống Adaptive AI 2027',
        createdAt: Date.now(),
        questions,
      };

      onClose();
      onStartCustomExam(drillExam);
    } catch (err) {
      console.error('Error generating drill:', err);
    } finally {
      setGeneratingDrill(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Adaptive AI Engine 2027
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Thời Gian Thực
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                Bản Đồ Tri Thức Động & Heatmap Lỗ Hổng Kiến Thức
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                AI quét lịch sử làm bài thi của bạn để chỉ rõ các chuyên đề còn yếu, gợi ý bài luyện trúng tủ nhắm thẳng vào điểm yếu.
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

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Độ Làm Chủ Trung Bình</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">{avgMastery}%</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-rose-300">Lỗ Hổng Trọng Tâm (Cần Luyện)</div>
              <div className="text-xl font-extrabold text-rose-400 mt-0.5">{weakTopicsCount} chuyên đề</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-300">Chuyên Đề Vững Vàng</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{strongTopicsCount} chuyên đề</div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 shrink-0">Lọc môn:</span>
          {['all', 'Toán', 'Anh', 'Lí', 'Hóa', 'ĐGNL'].map((s) => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                subjectFilter === s
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s === 'all' ? 'Tất Cả Môn' : s}
            </button>
          ))}
        </div>

        {/* Heatmap Cards Grid */}
        <div className="space-y-3">
          {filteredTopics.map((topic) => {
            const isWeak = topic.weaknessLevel === 'weak';
            const isModerate = topic.weaknessLevel === 'moderate';

            return (
              <div
                key={topic.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isWeak
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                    : isModerate
                    ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400'
                    : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {topic.subject} • {topic.category}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isWeak
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isModerate
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isWeak ? 'Cần Khắc Phục Gấp' : isModerate ? 'Nắm Vừa Phải' : 'Rất Vững'}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {topic.name}
                    </h4>

                    <p className="text-xs text-slate-400">
                      {topic.recommendedAction}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWeak
                            ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                            : isModerate
                            ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        }`}
                        style={{ width: `${topic.masteryPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div
                        className={`text-2xl font-black ${
                          isWeak
                            ? 'text-rose-400'
                            : isModerate
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {topic.masteryPercent}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Làm đúng: {topic.correctCount}/{topic.totalAttempted} câu
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchWeakDrill(topic)}
                      disabled={generatingDrill}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer ${
                        isWeak
                          ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>{generatingDrill ? 'AI Đang Tạo Đề...' : 'Luyện Trúng Tủ'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
