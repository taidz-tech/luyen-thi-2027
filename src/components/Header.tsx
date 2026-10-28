import React, { useState } from 'react';
import { User, ExamNotification } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { GraduationCap, ShieldCheck, LogOut, Award, BookOpen, User as UserIcon, Bell, Mail, Clock, Check, Brain, Eye, Swords } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  currentView: 'exams' | 'admin' | 'my_history' | 'leaderboard';
  notifications: ExamNotification[];
  onChangeView: (view: 'exams' | 'admin' | 'my_history' | 'leaderboard') => void;
  onLogout: () => void;
  onSelectExamById?: (examId: string) => void;
  onOpenKnowledgeGraph?: () => void;
  onOpenErrorNotebook?: () => void;
  onOpenVisionTutor?: () => void;
  onOpenQuizBattle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  notifications,
  onChangeView,
  onLogout,
  onSelectExamById,
  onOpenKnowledgeGraph,
  onOpenErrorNotebook,
  onOpenVisionTutor,
  onOpenQuizBattle,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={() => onChangeView('exams')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 via-amber-400/20 to-transparent border border-amber-500/40 text-amber-400 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  THPTQG & V-ACT
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  2027
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Hệ Thống Khảo Thí & Ôn Luyện Trí Tuệ Nhân Tạo
              </div>
            </div>
          </div>

          {/* Audio player on mobile */}
          <div className="block md:hidden">
            <AudioPlayer />
          </div>
        </div>

        {/* Audio player in desktop middle */}
        <div className="hidden md:block">
          <AudioPlayer />
        </div>

        {/* Navigation & User actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end flex-wrap">
          {/* Navigation tabs */}
          <button
            onClick={() => onChangeView('exams')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'exams'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Phòng Thi</span>
          </button>

          <button
            onClick={() => onChangeView('leaderboard')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'leaderboard'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Bảng Xếp Hạng</span>
          </button>

          {/* Admin Dashboard button - ONLY for admin */}
          {isAdmin && (
            <button
              onClick={() => onChangeView('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border border-amber-400'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Quản Trị Admin</span>
            </button>
          )}

          {/* AI Feature Suite Buttons */}
          {onOpenKnowledgeGraph && (
            <button
              onClick={onOpenKnowledgeGraph}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition cursor-pointer"
              title="Xem bản đồ tri thức động và lỗ hổng kiến thức"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline">Bản Đồ Tri Thức</span>
            </button>
          )}

          {onOpenErrorNotebook && (
            <button
              onClick={onOpenErrorNotebook}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition cursor-pointer"
              title="Xem sổ tay các câu đã làm sai và tạo mini-test sửa sai"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden lg:inline">Sổ Tay Lỗi Sai</span>
            </button>
          )}

          {onOpenVisionTutor && (
            <button
              onClick={onOpenVisionTutor}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition cursor-pointer"
              title="Gia sư Vision AI: Chụp nháp viết tay & đồ thị"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">Gia Sư Vision</span>
            </button>
          )}

          {onOpenQuizBattle && (
            <button
              onClick={onOpenQuizBattle}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 text-amber-300 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 transition cursor-pointer"
              title="Đấu trường 1v1 trắc nghiệm tốc độ cao"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Đấu Trường 1v1</span>
            </button>
          )}

          {/* Email / Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all relative"
              title="Thông báo kỳ thi & Email hệ thống"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Notification Popover */}
            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Hộp Thư Thông Báo Kỳ Thi ({notifications.length})</span>
                  </div>
                  <button
                    onClick={() => setShowNotifPopover(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Đóng
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setShowNotifPopover(false);
                        if (onSelectExamById) onSelectExamById(notif.examId);
                      }}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Kỳ Thi Đang Diễn Ra
                        </span>
                        <span className="text-slate-500">
                          {new Date(notif.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2">
                        {notif.examTitle}
                      </h5>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-sky-400" />
                          {notif.timeMinutes ? `${notif.timeMinutes} phút` : 'Vô thời hạn'}
                        </span>
                        <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Đã gửi Email tới {notif.recipientEmails.length} thí sinh
                        </span>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500">
                      Chưa có thông báo kỳ thi mới nào.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-end gap-1">
                {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                {currentUser.school || (isAdmin ? 'Chủ sở hữu' : 'Thí sinh 2027')}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
