import React, { useState, useEffect } from 'react';
import { ExamAttempt, Exam } from '../types';
import { MathText } from './MathText';
import { MathDiagram } from './MathDiagram';
import { 
  Award, Clock, CheckCircle2, XCircle, ArrowRight, BookOpen, 
  RotateCcw, Sparkles, Lock, Timer, ShieldCheck, ChevronDown, ChevronUp, Heart, Trophy, Quote
} from 'lucide-react';
import { Fireworks } from './Fireworks';

interface ResultModalProps {
  attempt: ExamAttempt;
  exam: Exam;
  onRetake: () => void;
  onGoHome: () => void;
  onViewLeaderboard: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  attempt,
  exam,
  onRetake,
  onGoHome,
  onViewLeaderboard,
}) => {
  const isOfficial = exam.examType === 'official';
  const isVact = exam.category === 'vact';

  // 5-minute countdown for official exam unlock
  const unlockTarget = attempt.officialLeaderboardUnlockAt || (attempt.submittedAt + 5 * 60 * 1000);
  const [secondsUntilUnlock, setSecondsUntilUnlock] = useState(
    Math.max(0, Math.floor((unlockTarget - Date.now()) / 1000))
  );

  // Requirement: ALWAYS trigger fireworks to celebrate candidate completion
  const [showFireworks, setShowFireworks] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOfficial || secondsUntilUnlock <= 0) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((unlockTarget - Date.now()) / 1000));
      setSecondsUntilUnlock(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOfficial, unlockTarget, secondsUntilUnlock]);

  const isUnlocked = !isOfficial || secondsUntilUnlock === 0;

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} phút ${s.toString().padStart(2, '0')} giây`;
  };

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const feedback = attempt.motivationalFeedback || {
    tier: attempt.score >= (isVact ? 1000 : 8.5) ? 'excellent' : attempt.score >= (isVact ? 750 : 6.5) ? 'good' : 'effort',
    title: 'Chúc Mừng Bạn Đã Hoàn Thành Bài Thi 2027!',
    message: 'Mỗi bài thi là một bước tiến vượt bậc trên hành trình chinh phục kỳ thi 2027.',
    quote: 'Hành trình vạn dặm bắt đầu từ một bước chân.',
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in">
      {/* Celebration fireworks always on submit */}
      {showFireworks && <Fireworks durationMs={6000} onFinish={() => setShowFireworks(false)} />}

      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xl shadow-amber-500/10">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Kết Quả Bài Làm: <span className="text-amber-400">{exam.subject}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {exam.title}
          </p>
        </div>

        {/* Motivational Feedback Card Based on Score Level */}
        <div className={`p-5 rounded-3xl border transition-all ${
          feedback.tier === 'excellent'
            ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/10 border-amber-500/50 text-amber-200'
            : feedback.tier === 'good'
            ? 'bg-gradient-to-r from-sky-500/20 via-sky-400/15 to-sky-500/10 border-sky-500/50 text-sky-200'
            : 'bg-gradient-to-r from-emerald-500/20 via-teal-400/15 to-emerald-500/10 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              feedback.tier === 'excellent' ? 'bg-amber-400 text-slate-950' :
              feedback.tier === 'good' ? 'bg-sky-400 text-slate-950' :
              'bg-emerald-400 text-slate-950'
            }`}>
              {feedback.tier === 'effort' ? <Heart className="w-6 h-6 fill-current" /> : <Sparkles className="w-6 h-6 fill-current" />}
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-sm sm:text-base font-extrabold tracking-wide">
                {feedback.title}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                {feedback.message}
              </p>
              {feedback.quote && (
                <div className="pt-2 text-[11px] text-slate-400 italic flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span>"{feedback.quote}"</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Big Score Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 border border-amber-500/30 text-center shadow-xl">
          <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">
            {isVact ? 'Điểm Số ĐGNL V-ACT (Thang Điểm 1200 Chuẩn)' : (exam.category === 'hsg' ? 'Điểm Số Học Sinh Giỏi (Thang Điểm 20.0 Chuẩn HSG)' : (exam.category === 'practice_quiz' ? 'Điểm Số Bài Ôn Tập (Thang Điểm 10.0 Chia Đều)' : 'Điểm Số Quy Đổi (Thang Điểm 10 Chuẩn)'))}
          </div>

          <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent my-2">
            {isVact ? attempt.score : Number(attempt.score).toFixed(2)}
            <span className="text-2xl text-slate-500 font-semibold"> / {attempt.maxScore || (isVact ? 1200 : (exam.category === 'hsg' ? '20.0' : '10.0'))}</span>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Thời gian làm: <strong>{Math.floor(attempt.timeSpentSeconds / 60)} phút {attempt.timeSpentSeconds % 60}s</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Điểm thô: <strong>{attempt.rawScore} / {attempt.maxPossibleScore}</strong></span>
            </div>
          </div>
        </div>

        {/* Official Exam 5-Minute Public Countdown Notice */}
        {isOfficial && !isUnlocked && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>Kỳ Thi Chính Thức - Hệ Thống Đang Chấm & Tổng Hợp</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
                {formatCountdown(secondsUntilUnlock)}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Theo quy chế khảo thí chính thức 2027, kết quả chi tiết và Bảng Xếp Hạng công khai cho toàn thể thí sinh sẽ được mở sau khi nộp từ 5-10 phút.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 italic">
                Đang đếm ngược để công bố công khai...
              </span>
              <button
                onClick={() => setSecondsUntilUnlock(0)}
                className="text-xs text-amber-400 underline hover:text-amber-300 cursor-pointer"
              >
                [Kiểm tra nhanh: Mở ngay]
              </button>
            </div>
          </div>
        )}

        {/* Detailed Question Review (Visible if Practice OR Official after 5m) */}
        {isUnlocked ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Chi Tiết Từng Câu Hỏi & Lời Giải:</span>
              <span className="text-xs font-normal text-slate-400">
                Nhấn vào từng câu để xem phân tích
              </span>
            </h3>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {exam.questions.map((q, idx) => {
                const breakdown = attempt.breakdown?.find((b) => b.questionId === q.id);
                const isCorrect = breakdown ? breakdown.isFullyCorrect : false;
                const isExpanded = !!expandedQuestions[q.id];

                return (
                  <div
                    key={q.id}
                    className="border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {isCorrect ? '✓' : '✕'}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-200">
                            Câu {idx + 1}: {q.prompt.slice(0, 65)}...
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {q.type === 'multiple_choice' && (isVact ? `Trắc nghiệm (${q.points}đ)` : 'Trắc nghiệm 4 lựa chọn')}
                            {q.type === 'true_false' && (isVact ? `Đúng / Sai (${q.points}đ)` : 'Đúng / Sai 4 ý')}
                            {q.type === 'short_answer' && (isVact ? `Trả lời ngắn (${q.points}đ)` : 'Trả lời ngắn')}
                            {q.type === 'essay' && 'Tự luận AI chấm'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {breakdown ? breakdown.scoreAwarded : 0}đ
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-xs space-y-3">
                        {(() => {
                          let pText = q.prompt || '';
                          let svg = q.illustrationSvg || '';
                          const svgMatch = pText.match(/<svg[\s\S]*?<\/svg>/i);
                          if (svgMatch) {
                            if (!svg) svg = svgMatch[0];
                            pText = pText.replace(/<svg[\s\S]*?<\/svg>/gi, '').trim();
                          }
                          return (
                            <>
                              {q.passageContent && (
                                <div className="mb-3 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs space-y-2">
                                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Bài đọc hiểu dùng chung ({q.passageRange || 'Dữ kiện chung'})</span>
                                  </div>
                                  {q.passageInstruction && (
                                    <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 font-bold">
                                      {q.passageInstruction}
                                    </div>
                                  )}
                                  {(q.passageImageUrl || q.passageSvg) && (
                                    <div className="p-2 rounded-xl bg-white flex justify-center">
                                      {q.passageImageUrl && <img src={q.passageImageUrl} alt="Minh họa bài đọc" className="max-h-36 object-contain" />}
                                      {q.passageSvg && !q.passageImageUrl && <MathDiagram svgContent={q.passageSvg} title="Minh họa" />}
                                    </div>
                                  )}
                                  <div className="text-slate-300 max-h-40 overflow-y-auto pr-1 leading-relaxed">
                                    <MathText content={q.passageContent} />
                                  </div>
                                </div>
                              )}

                              <div className="text-slate-300 font-medium leading-relaxed">
                                <strong className="text-slate-100">Nội dung câu:</strong>{' '}
                                <MathText content={pText} />
                              </div>

                              {(svg || q.imageUrl) && (
                                <MathDiagram
                                  svgContent={svg}
                                  imageUrl={q.imageUrl}
                                  title="Hình vẽ minh họa đề thi"
                                />
                              )}
                            </>
                          );
                        })()}

                        {/* True / False Subquestions Review */}
                        {q.type === 'true_false' && Array.isArray(q.subQuestions) && (
                          <div className="space-y-1.5 pt-1">
                            <strong className="text-slate-300 block mb-1">Chi tiết từng khẳng định:</strong>
                            {q.subQuestions.map((sub, sIdx) => {
                              const letter = (sub.id?.replace(/^q\d+_?/i, '') || ['a', 'b', 'c', 'd'][sIdx]).toLowerCase();
                              const subText = sub.text || (sub as any).statement || (sub as any).content || '';
                              const studentVal = breakdown?.userAnswer ? (breakdown.userAnswer as any)[sub.id || letter] : undefined;
                              const isSubCorrect = studentVal === sub.isCorrect;

                              return (
                                <div key={sIdx} className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <span className="font-mono font-bold text-amber-400 shrink-0">{letter})</span>
                                    <span className="text-slate-200"><MathText content={subText || `Ý ${letter})`} /></span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                                    <span className={studentVal !== undefined ? (isSubCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400') : 'text-slate-500'}>
                                      Bạn: {studentVal === true ? 'Đúng' : studentVal === false ? 'Sai' : 'Chưa chọn'}
                                    </span>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-bold">
                                      Đáp án: {sub.isCorrect ? 'Đúng' : 'Sai'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Multiple Choice Review */}
                        {q.type === 'multiple_choice' && (
                          <div className="pt-1 text-slate-300 space-y-1">
                            <div>
                              <span>Phương án bạn chọn: </span>
                              <strong className={breakdown?.isFullyCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                                {typeof breakdown?.userAnswer === 'number' ? ['A', 'B', 'C', 'D'][breakdown.userAnswer] : 'Chưa chọn'}
                              </strong>
                              {!breakdown?.isFullyCorrect && (
                                <span className="text-emerald-400 font-bold ml-3">
                                  ✓ Đáp án đúng: {['A', 'B', 'C', 'D'][q.correctOptionIndex]}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Short Answer Review */}
                        {q.type === 'short_answer' && (
                          <div className="pt-1 text-slate-300">
                            <span>Đáp án của bạn: </span>
                            <strong className={breakdown?.isFullyCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                              {breakdown?.userAnswer ? String(breakdown.userAnswer) : 'Chưa điền'}
                            </strong>
                            <span className="text-emerald-400 font-bold ml-3">
                              ✓ Đáp án chuẩn: {q.correctAnswer}
                            </span>
                          </div>
                        )}

                        {q.explanation && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 leading-relaxed">
                            <strong className="text-amber-400 block mb-1">
                              ✓ Lời giải chi tiết:
                            </strong>
                            <MathText content={q.explanation} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <Lock className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-bold text-slate-300">
              Đáp Án Chi Tiết Đang Được Khóa Bảo Mật
            </div>
            <p className="text-xs text-slate-500">
              Toàn bộ bài giải và barem chấm sẽ tự động hiển thị sau khi thời gian đếm ngược kết thúc.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onRetake}
            className="w-full sm:flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện Tập Lại</span>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="w-full sm:flex-1 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Xem Bảng Xếp Hạng</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Về Danh Sách Đề Thi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
