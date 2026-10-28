import React, { useState } from 'react';
import { Exam, ExamAttempt, User, ExamNotification, STANDARD_SUBJECTS } from '../types';
import { 
  BookOpen, Clock, Award, Sparkles, Search, CheckCircle, Flame, 
  ArrowRight, Brain, FileText, Check, ChevronRight, Bell, Mail, Eye, Swords, Target 
} from 'lucide-react';

interface ExamListProps {
  exams: Exam[];
  attempts: ExamAttempt[];
  notifications?: ExamNotification[];
  currentUser: User;
  onSelectExam: (exam: Exam) => void;
  onOpenAdminUpload?: () => void;
  onOpenKnowledgeGraph?: () => void;
  onOpenErrorNotebook?: () => void;
  onOpenVisionTutor?: () => void;
  onOpenQuizBattle?: () => void;
}

export const ExamList: React.FC<ExamListProps> = ({
  exams,
  attempts,
  notifications = [],
  currentUser,
  onSelectExam,
  onOpenKnowledgeGraph,
  onOpenErrorNotebook,
  onOpenVisionTutor,
  onOpenQuizBattle,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'thptqg' | 'vact' | 'hsg' | 'practice_quiz'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'practice' | 'official'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExams = exams.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (typeFilter !== 'all' && e.examType !== typeFilter) return false;

    // Filter by subject if specified
    if (subjectFilter !== 'all') {
      const normFilter = subjectFilter.toLowerCase();
      const normSubj = (e.subject || '').toLowerCase();
      const normTitle = (e.title || '').toLowerCase();

      let isSubjectMatch = normSubj.includes(normFilter) || normTitle.includes(normFilter);

      if (normFilter === 'toán') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('toán') || normSubj.includes('toan');
      } else if (normFilter === 'lí') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('vật lí') || normSubj.includes('vật lý') || normSubj.includes('lí');
      } else if (normFilter === 'hóa') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('hóa') || normSubj.includes('hoa');
      } else if (normFilter === 'sinh') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('sinh');
      } else if (normFilter === 'sử') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('sử') || normSubj.includes('lịch sử');
      } else if (normFilter === 'địa') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('địa');
      } else if (normFilter === 'văn') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('văn') || normSubj.includes('ngữ văn');
      } else if (normFilter === 'anh') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('anh') || normSubj.includes('tiếng anh') || normSubj.includes('english');
      } else if (normFilter === 'tin') {
        isSubjectMatch = isSubjectMatch || normSubj.includes('tin') || normSubj.includes('tin học');
      } else if (normFilter.includes('kinh tế')) {
        isSubjectMatch = isSubjectMatch || normSubj.includes('kinh tế') || normSubj.includes('pháp luật');
      } else if (normFilter.includes('công nghệ')) {
        isSubjectMatch = isSubjectMatch || normSubj.includes('công nghệ');
      }

      if (!isSubjectMatch) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchSubject = e.subject.toLowerCase().includes(q);
      const matchDesc = e.description.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchDesc) return false;
    }
    return true;
  });

  const userAttempts = attempts.filter(a => a.userId === currentUser.id);

  // Check if any official exam notification is active
  const activeOfficialExam = exams.find(e => e.examType === 'official');

  return (
    <div className="space-y-8 pb-12">
      {/* Active Official Exam Live Announcement Banner */}
      {activeOfficialExam && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  [THÔNG BÁO KHẨN KỲ THI CHÍNH THỨC 2027]
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Đang diễn ra
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                {activeOfficialExam.title} ({activeOfficialExam.timeMinutes} phút)
              </h4>
              <p className="text-xs text-slate-300">
                Hệ thống đã gửi thông báo đến hòm thư email của toàn bộ thí sinh. Hãy vào phòng thi để làm bài ngay!
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectExam(activeOfficialExam)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 shrink-0 cursor-pointer"
          >
            <span>Vào Thi Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Banner for 2027 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/40 border border-amber-500/30 p-6 sm:p-10 shadow-2xl shadow-amber-500/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Hệ Thống Ôn Thi Trọng Điểm 2027
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            Chinh Phục Kỳ Thi <span className="text-amber-400">THPT Quốc Gia 2027</span> & <span className="text-sky-400">ĐGNL V-ACT 1200 Điểm</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Hệ thống ngân hàng đề thi được thẩm định tỉ mỉ 100% chuẩn cấu trúc đổi mới 2027. Đề ôn tập hỗ trợ thời gian <strong className="text-amber-300">Vô thời hạn</strong> tự do nghiên cứu; Kỳ thi chính thức V-ACT chuẩn hóa <strong className="text-sky-300">1200 điểm</strong> với 120 câu hỏi tính điểm theo độ khó.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-3 border border-slate-800">
              <div className="text-lg sm:text-xl font-extrabold text-amber-400">{exams.length} Đề Thi</div>
              <div className="text-xs text-slate-400">Niên khóa 2027</div>
            </div>
            <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-3 border border-slate-800">
              <div className="text-lg sm:text-xl font-extrabold text-sky-400">1200 Điểm</div>
              <div className="text-xs text-slate-400">Chuẩn ĐGNL V-ACT</div>
            </div>
            <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-3 border border-slate-800">
              <div className="text-lg sm:text-xl font-extrabold text-emerald-400">Vô Thời Hạn</div>
              <div className="text-xs text-slate-400">Dành cho đề ôn tập</div>
            </div>
            <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-3 border border-slate-800">
              <div className="text-lg sm:text-xl font-extrabold text-purple-400">Pháo Hoa & AI</div>
              <div className="text-xs text-slate-400">Động viên theo mức điểm</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Feature Suite Banner for 2027 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenKnowledgeGraph}
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 hover:border-purple-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              Heatmap
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
            Bản Đồ Tri Thức
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            Quét lỗ hổng kiến thức & luyện trúng tủ
          </p>
        </button>

        <button
          onClick={onOpenErrorNotebook}
          className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 hover:border-rose-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
              Auto-Save
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition">
            Sổ Tay Lỗi Sai
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            Gom câu sai & tạo mini-test sửa bẫy
          </p>
        </button>

        <button
          onClick={onOpenVisionTutor}
          className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 hover:border-sky-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
              Camera AI
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
            Gia Sư Vision AI
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            Đọc nháp viết tay, đồ thị & chấm VDC
          </p>
        </button>

        <button
          onClick={onOpenQuizBattle}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 hover:border-amber-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <Swords className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              1v1 Tốc Độ
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
            Đấu Trường Tri Thức
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            Thách đấu phản xạ với Thủ Khoa AI
          </p>
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất Cả Kỳ Thi 2027
          </button>
          <button
            onClick={() => setCategoryFilter('thptqg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === 'thptqg'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            THPTQG (Thang 10)
          </button>
          <button
            onClick={() => setCategoryFilter('vact')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === 'vact'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ĐGNL V-ACT (1200đ)
          </button>
          <button
            onClick={() => setCategoryFilter('hsg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === 'hsg'
                ? 'bg-rose-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Học Sinh Giỏi (Thang 20)
          </button>
          <button
            onClick={() => setCategoryFilter('practice_quiz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === 'practice_quiz'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bài Ôn Tập (Chia Đều 10đ)
          </button>
        </div>

        {/* Right side: Subject Selector & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Chọn môn ôn luyện & thi (kế bên ô tìm kiếm theo yêu cầu) */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-semibold text-amber-400 whitespace-nowrap">
              Môn thi:
            </span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer py-1 pr-1"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                Tất Cả Các Môn
              </option>
              {STANDARD_SUBJECTS.map((subj) => (
                <option key={subj} value={subj} className="bg-slate-900 text-slate-200">
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm đề thi 2027..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => {
          const pastAttempt = userAttempts.find(a => a.examId === exam.id);
          const isOfficial = exam.examType === 'official';
          const isVact = exam.category === 'vact';

          return (
            <div
              key={exam.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Category badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                      isVact
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        : exam.category === 'hsg'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : exam.category === 'practice_quiz'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isVact
                        ? 'ĐGNL V-ACT 2027'
                        : exam.category === 'hsg'
                        ? 'Kỳ Thi HSG'
                        : exam.category === 'practice_quiz'
                        ? 'Bài Ôn Tập'
                        : 'THPTQG 2027'}
                    </span>

                    {/* Ô Tiêu Đề Môn Học (Riêng V-ACT là toàn diện không cần) */}
                    {!isVact && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm flex items-center gap-1">
                        <span className="text-indigo-400/80 font-normal">Môn:</span> {exam.subject || 'Toán'}
                      </span>
                    )}
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 ${
                    isOfficial
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {isOfficial ? (
                      <>
                        <Flame className="w-3 h-3 text-rose-400" />
                        Kỳ Thi Có Thời Gian
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3 h-3 text-emerald-400" />
                        Ôn Tập Vô Thời Hạn
                      </>
                    )}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 mb-2">
                  {exam.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {exam.description}
                </p>

                {/* Question types chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {isVact ? (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                        Chuẩn 1200 Điểm
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        Điểm theo độ khó
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        Trắc nghiệm 4 lựa chọn
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        Đúng / Sai trừ điểm
                      </span>
                    </>
                  )}
                  {exam.questions.some(q => q.type === 'essay') && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                      Tự luận ảnh AI
                    </span>
                  )}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center mb-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Thời gian</div>
                    <div className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {exam.timeMinutes ? `${exam.timeMinutes}'` : 'Vô hạn'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Số câu hỏi</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">
                      {exam.totalQuestionsCount || exam.questions.length} câu
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Thang điểm</div>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">
                      {isVact ? '1200đ' : (exam.category === 'hsg' ? '20.0đ' : `${exam.totalPoints || 10.0}đ`)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer action and past score */}
              <div>
                {pastAttempt && (
                  <div className="mb-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Điểm gần nhất:
                    </span>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      {isVact ? `${pastAttempt.score} / 1200` : `${pastAttempt.score.toFixed(2)} / 10`}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onSelectExam(exam)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer group-hover:scale-[1.01]"
                >
                  <span>{pastAttempt ? 'Luyện Tập Lại' : 'Bắt Đầu Làm Bài'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
