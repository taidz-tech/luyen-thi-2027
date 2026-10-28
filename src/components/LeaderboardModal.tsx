import React, { useState } from 'react';
import { Exam, ExamAttempt, User } from '../types';
import { StorageService } from '../services/storage';
import { 
  Award, ShieldCheck, Lock, Clock, User as UserIcon, 
  School, Trophy, Medal, AlertCircle, ArrowLeft, CheckCircle2, RotateCcw 
} from 'lucide-react';

interface LeaderboardModalProps {
  exams: Exam[];
  attempts: ExamAttempt[];
  currentUser: User;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  exams,
  attempts,
  currentUser,
  onClose,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const isAdmin = currentUser.role === 'admin';

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const isPractice = currentExam?.examType === 'practice';

  // Attempts for current selected exam
  const examAttempts = attempts
    .filter((a) => a.examId === currentExam?.id)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSpentSeconds - b.timeSpentSeconds; // shorter time wins tie
    });

  // Current user's attempt on this exam
  const myAttempts = examAttempts.filter((a) => a.userId === currentUser.id);

  // Check official exam unlock time
  // If official, unlock when either resultsPublished is true, or any attempt submitted > 5 mins ago
  const now = Date.now();
  const hasUnlockedOfficialAttempts = examAttempts.some(
    (a) => !a.officialLeaderboardUnlockAt || a.officialLeaderboardUnlockAt <= now
  );
  const isOfficialUnlocked = hasUnlockedOfficialAttempts || isAdmin;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Bảng Vàng Danh Dự & Xếp Hạng 2027
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Vinh danh các thí sinh xuất sắc trong kỳ thi THPTQG & V-ACT 2027
            </p>
          </div>
        </div>

        {/* Exam Selector */}
        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Chọn Đề Thi Xem Bảng Điểm:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                [{e.examType === 'official' ? 'Kỳ Thi Chính Thức' : 'Bài Ôn Tập'}] {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Case 1: Practice Test Viewed by Regular User (Privacy Notice) */}
      {isPractice && !isAdmin ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">
                  Bảo Mật Bảng Xếp Hạng Bài Ôn Tập
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Theo quy định phân quyền hệ thống, với các bài test ôn tập thông thường, bảng xếp hạng toàn bộ người dùng chỉ dành cho Quản Trị Viên (Admin) theo dõi. Thí sinh chỉ xem được điểm số và thành tích của chính mình.
                </p>
              </div>
            </div>

            {/* User's own results */}
            <div className="pt-4 border-t border-slate-800">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                Thành tích của bạn ({currentUser.name}):
              </h5>

              {myAttempts.length > 0 ? (
                <div className="space-y-2">
                  {myAttempts.map((att, idx) => {
                    const order = StorageService.getAttemptOrder(att.id);
                    return (
                      <div
                        key={att.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                              <span>{currentUser.name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                Nộp lần thứ {order.attemptNumber}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{new Date(att.submittedAt).toLocaleDateString('vi-VN')}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s
                              </span>
                              {order.totalAttempts > 1 && (
                                <>
                                  <span>•</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Tiến trình: {order.historySummary.map((h) => `Lần ${h.index}: ${h.score}đ`).join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-extrabold text-amber-400">
                            {att.category === 'vact' ? att.score : Number(att.score).toFixed(2)}
                            <span className="text-xs text-slate-500 font-normal"> {att.category === 'vact' ? '/ 1200' : (att.category === 'hsg' ? '/ 20' : `/ ${att.maxScore || 10}`)}</span>
                          </div>
                          <div className="text-[11px] text-emerald-400 font-semibold">
                            Hoàn thành
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  Bạn chưa làm bài kiểm tra ôn tập này. Hãy vào phòng thi để thử sức!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : !isPractice && !isOfficialUnlocked ? (
        /* Case 2: Official Exam Countdown (not yet unlocked) */
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
          <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-white">
            Bảng Xếp Hạng Kỳ Thi Chính Thức Đang Trong Thời Gian Chấm & Khóa Công Khai
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Hệ thống đang bảo mật dữ liệu thi. Bảng xếp hạng chính thức sẽ tự động mở công khai cho toàn thể thí sinh sau khi nộp từ 5-10 phút.
          </p>
        </div>
      ) : (
        /* Case 3: Public Leaderboard for Official Exam OR Admin viewing Practice */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              {isPractice
                ? 'Chế độ xem Quản Trị Viên (Toàn quyền khảo thí)'
                : 'Bảng xếp hạng công khai Kỳ Thi Chính Thức'}
            </span>
            <span className="font-semibold text-amber-400">
              Tổng số thí sinh: {examAttempts.length}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 divide-y divide-slate-800/80">
            {examAttempts.map((att, rank) => {
              const isCurrentUser = att.userId === currentUser.id;

              return (
                <div
                  key={att.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                    isCurrentUser ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank medal */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                      {rank === 0 ? (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <Trophy className="w-5 h-5 fill-current" />
                        </div>
                      ) : rank === 1 ? (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 flex items-center justify-center shadow">
                          <Medal className="w-5 h-5 fill-current" />
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 text-amber-100 flex items-center justify-center shadow">
                          <Medal className="w-5 h-5 fill-current" />
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono font-bold text-sm">
                          #{rank + 1}
                        </span>
                      )}
                    </div>

                    {/* Candidate info */}
                    <div>
                      {(() => {
                        const order = StorageService.getAttemptOrder(att.id);
                        return (
                          <>
                            <div className="text-sm font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                              <span>{att.userName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold border border-amber-500/30">
                                Nộp lần thứ {order.attemptNumber}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  Bạn
                                </span>
                              )}
                              {isAdmin && (
                                <span className="text-[10px] text-slate-500 font-normal">
                                  ({att.userEmail})
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1 text-slate-400">
                                <School className="w-3 h-3 text-amber-400/80" />
                                {att.userSchool}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono text-slate-400">
                                <Clock className="w-3 h-3 text-sky-400" />
                                {Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s
                              </span>
                              {order.totalAttempts > 1 && (
                                <>
                                  <span>•</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Lịch sử: {order.historySummary.map((h) => `Lần ${h.index}: ${h.score}đ`).join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="text-lg sm:text-xl font-black text-amber-400">
                      {att.category === 'vact' ? att.score : Number(att.score).toFixed(2)}
                      <span className="text-xs text-slate-500 font-normal"> {att.category === 'vact' ? '/ 1200' : (att.category === 'hsg' ? '/ 20' : `/ ${att.maxScore || 10}`)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(att.submittedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              );
            })}

            {examAttempts.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                Chưa có thí sinh nào nộp bài cho đề thi này.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
