import React from 'react';
import { ExamAttempt, User, Exam } from '../types';
import { Award, Clock, Calendar, CheckCircle2, ChevronRight, BookOpen, TrendingUp } from 'lucide-react';

interface MyHistoryProps {
  currentUser: User;
  attempts: ExamAttempt[];
  exams: Exam[];
  onSelectAttempt: (attempt: ExamAttempt) => void;
}

export const MyHistory: React.FC<MyHistoryProps> = ({
  currentUser,
  attempts,
  exams,
  onSelectAttempt,
}) => {
  const myAttempts = attempts
    .filter((a) => a.userId === currentUser.id)
    .sort((a, b) => b.submittedAt - a.submittedAt);

  const averageScore =
    myAttempts.length > 0
      ? (myAttempts.reduce((acc, cur) => acc + cur.score, 0) / myAttempts.length).toFixed(2)
      : '0.00';

  const bestScore =
    myAttempts.length > 0
      ? Math.max(...myAttempts.map((a) => a.score)).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Profile Summary */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Hồ Sơ Năng Lực Thí Sinh
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {currentUser.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.school} • {currentUser.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Đã làm</div>
              <div className="text-base font-extrabold text-slate-200">
                {myAttempts.length} bài
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Điểm TB</div>
              <div className="text-base font-extrabold text-sky-400">
                {averageScore}
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Cao nhất</div>
              <div className="text-base font-extrabold text-amber-400">
                {bestScore}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200">
          Nhật Ký Các Bài Thi Đã Thực Hiện:
        </h3>

        {myAttempts.map((att) => {
          return (
            <div
              key={att.id}
              onClick={() => onSelectAttempt(att)}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 cursor-pointer group hover:bg-slate-900"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {att.subject}
                    </span>
                    <span className="text-xs text-slate-500">
                      {att.examType === 'official' ? 'Kỳ Thi Chính Thức' : 'Bài Ôn Tập'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors mt-0.5 line-clamp-1">
                    {att.examTitle}
                  </h4>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(att.submittedAt).toLocaleDateString('vi-VN')} {new Date(att.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-lg font-black text-amber-400">
                    {att.category === 'vact' ? att.score : Number(att.score).toFixed(2)}
                    <span className="text-xs text-slate-500 font-normal"> {att.category === 'vact' ? '/ 1200' : (att.category === 'hsg' ? '/ 20.0đ' : `/ ${att.maxScore || 10}đ`)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Đã hoàn thành
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
          );
        })}

        {myAttempts.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-500 text-xs">
            Bạn chưa thực hiện bài thi nào. Hãy vào phòng thi để bắt đầu làm bài!
          </div>
        )}
      </div>
    </div>
  );
};
