import React, { useState, useEffect, useRef } from 'react';
import { Exam, Question, StudentAnswerValue, TrueFalseUserAnswer, EssayUserAnswer, User } from '../types';
import { StorageService } from '../services/storage';
import { MathText } from './MathText';
import { MathDiagram } from './MathDiagram';
import { 
  Clock, ArrowLeft, ArrowRight, Flag, CheckCircle2, XCircle, AlertTriangle, 
  Upload, Eye, Sparkles, Send, Brain, RefreshCw, HelpCircle, Check, ShieldAlert, Award, Infinity as InfinityIcon,
  Layers, Image as ImageIcon, BookOpen, ChevronDown, ChevronUp, Type, FileText, Lock, Flame, Zap, MessageSquare
} from 'lucide-react';

interface ExamRoomProps {
  exam: Exam;
  currentUser: User;
  onExit: () => void;
  onSubmitExam: (answers: Record<string, StudentAnswerValue>, timeSpentSeconds: number) => void;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({
  exam,
  currentUser,
  onExit,
  onSubmitExam,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswerValue>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [passageFontSize, setPassageFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [mobilePassageOpen, setMobilePassageOpen] = useState(true);

  const isUnlimited = !exam.timeMinutes || exam.timeMinutes <= 0;
  const isPractice = exam.examType === 'practice';
  const isVact = exam.category === 'vact';

  // If timed: countdown; if unlimited: elapsed countup
  const [secondsLeft, setSecondsLeft] = useState((exam.timeMinutes || 60) * 60);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Practice mode: toggle explanation view per question
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  // Deep AI tutor explanation state
  const [aiTutorLoading, setAiTutorLoading] = useState(false);
  const [aiTutorResponse, setAiTutorResponse] = useState<string | null>(null);

  // Check & Lock Question States (Yêu cầu: Không đưa đáp án giải ngay, có nút Check để chấm và khóa câu)
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [answerSwitchCounts, setAnswerSwitchCounts] = useState<Record<string, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // AI Exam Pressure Simulator (Phòng thi ảo áp lực thực chiến)
  const [isPressureMode, setIsPressureMode] = useState<boolean>(false);

  // Interactive Step-by-Step Explainer state
  const [stepExplainerQuery, setStepExplainerQuery] = useState<string>('');
  const [stepExplainerResponse, setStepExplainerResponse] = useState<string | null>(null);
  const [stepExplainerLoading, setStepExplainerLoading] = useState<boolean>(false);

  // Essay grading loading state
  const [essayGradingLoading, setEssayGradingLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentQ: Question = exam.questions[currentIndex];
  const totalQuestions = exam.questions.length;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (isUnlimited) {
        setSecondsElapsed((prev) => prev + 1);
      } else {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isUnlimited]);

  // Scroll to top when question changes & reset question timer
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuestionStartTime(Date.now());
    setStepExplainerResponse(null);
    setStepExplainerQuery('');
  }, [currentIndex]);

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Multiple Choice Handler (Chỉ cho phép chọn nếu chưa Check & Khóa)
  const handleSelectOption = (qId: string, optIndex: number) => {
    if (checkedQuestions[qId]) return; // Đã bấm Check thì KHÔNG được sửa lại câu này nữa
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
    setAnswerSwitchCounts((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
  };

  // True/False Handler (Chỉ cho phép chọn nếu chưa Check & Khóa)
  const handleSelectTrueFalse = (qId: string, subId: string, val: boolean) => {
    if (checkedQuestions[qId]) return; // Đã khóa
    const currentAns = (answers[qId] as TrueFalseUserAnswer) || {};
    const updated: TrueFalseUserAnswer = { ...currentAns, [subId]: val };
    setAnswers((prev) => ({ ...prev, [qId]: updated }));
    setAnswerSwitchCounts((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
  };

  // Short Answer Handler (Chỉ cho phép nhập nếu chưa Check & Khóa)
  const handleShortAnswerChange = (qId: string, rawVal: string) => {
    if (checkedQuestions[qId]) return; // Đã khóa
    let sanitized = rawVal.replace(/[^0-9\-\,\.]/g, '');
    if (sanitized.length > 4) sanitized = sanitized.slice(0, 4);
    setAnswers((prev) => ({ ...prev, [qId]: sanitized }));
  };

  // Hàm bấm nút "Check": AI chấm luôn câu đó đúng hay sai, khóa câu đó không được làm lại nữa
  const handleCheckQuestion = (qId: string) => {
    const q = exam.questions.find((item) => item.id === qId);
    if (!q) return;

    // Khóa câu này lại và mở lời giải chi tiết
    setCheckedQuestions((prev) => ({ ...prev, [qId]: true }));
    setRevealedExplanations((prev) => ({ ...prev, [qId]: true }));

    // Đánh giá đúng sai
    const userAns = answers[qId];
    let isCorrect = false;
    let correctAnswerText = '';

    if (q.type === 'multiple_choice') {
      isCorrect = userAns === q.correctOptionIndex;
      correctAnswerText = q.options[q.correctOptionIndex] || '';
    } else if (q.type === 'true_false') {
      const tfAns = (userAns as TrueFalseUserAnswer) || {};
      const subItems = q.subQuestions || [];
      const correctSubCount = subItems.filter((sub) => {
        const val = (tfAns as any)[sub.id];
        return val === sub.isCorrect;
      }).length;
      isCorrect = correctSubCount === subItems.length;
      correctAnswerText = subItems.map((s) => `${s.id}: ${s.isCorrect ? 'Đúng' : 'Sai'}`).join(' | ');
    } else if (q.type === 'short_answer') {
      const sanitizedUser = String(userAns || '').trim().replace(',', '.');
      const sanitizedCorrect = String(q.correctAnswer || '').trim().replace(',', '.');
      isCorrect = sanitizedUser === sanitizedCorrect || (q.acceptableAnswers || []).some((a) => String(a).trim().replace(',', '.') === sanitizedUser);
      correctAnswerText = q.correctAnswer;
    }

    // Tự động lưu câu sai vào Smart Error Notebook
    if (!isCorrect && userAns !== undefined) {
      StorageService.saveErrorItems([
        {
          id: `err_${currentUser.id}_${q.id}_${Date.now()}`,
          userId: currentUser.id,
          examId: exam.id,
          examTitle: exam.title,
          subject: exam.subject,
          question: q,
          userAnswer: userAns,
          correctAnswerText,
          addedAt: Date.now(),
        },
      ]);
    }
  };

  // Interactive Step-by-Step AI Explainer (Chat hỏi sâu từng bước với AI)
  const handleAskStepExplainer = async () => {
    if (!stepExplainerQuery.trim()) return;

    setStepExplainerLoading(true);
    try {
      const res = await fetch('/api/gemini/step-by-step-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ,
          currentStep: currentQ.explanation,
          userQuestion: stepExplainerQuery.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setStepExplainerResponse(data.reply);
      }
    } catch (e) {
      console.error('Error in step explainer:', e);
    } finally {
      setStepExplainerLoading(false);
    }
  };

  // Essay handwritten photo upload & AI grading
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, qId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const currentEssay = ((answers[qId] as EssayUserAnswer) || {});
      const updated: EssayUserAnswer = {
        ...currentEssay,
        imageBase64: base64,
        aiGraded: false,
      };
      setAnswers((prev) => ({ ...prev, [qId]: updated }));

      await gradeEssayWithAI(qId, base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const gradeEssayWithAI = async (qId: string, base64: string, mimeType: string) => {
    const q = exam.questions.find((item) => item.id === qId);
    if (!q || q.type !== 'essay') return;

    setEssayGradingLoading(true);
    try {
      const res = await fetch('/api/gemini/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mimeType || 'image/jpeg',
          questionPrompt: q.prompt,
          rubric: q.rubric,
          maxPoints: q.maxPoints,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        const evalResult = data.evaluation;
        setAnswers((prev) => {
          const prevEssay = ((prev[qId] as EssayUserAnswer) || {});
          return {
            ...prev,
            [qId]: {
              ...prevEssay,
              aiGraded: true,
              scoreAwarded: evalResult.scoreAwarded,
              feedback: evalResult.feedbackSummary,
              transcription: evalResult.transcribedText,
              stepScores: evalResult.stepScores,
            },
          };
        });
        if (isPractice) {
          setRevealedExplanations((prev) => ({ ...prev, [qId]: true }));
        }
      }
    } catch (err) {
      console.error('Lỗi khi chấm bài tự luận với AI:', err);
    } finally {
      setEssayGradingLoading(false);
    }
  };

  const handleAskAiTutor = async () => {
    setAiTutorLoading(true);
    setAiTutorResponse(null);
    try {
      const res = await fetch('/api/gemini/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ,
          studentAnswer: answers[currentQ.id],
          subject: exam.subject,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiTutorResponse(data.explanation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiTutorLoading(false);
    }
  };

  const isQuestionAnswered = (q: Question): boolean => {
    const val = answers[q.id];
    if (val === undefined || val === null || val === '') return false;
    if (q.type === 'true_false') {
      const obj = val as TrueFalseUserAnswer;
      return ['a', 'b', 'c', 'd'].some((k) => (obj as any)[k] !== undefined);
    }
    if (q.type === 'essay') {
      const essay = val as EssayUserAnswer;
      return !!essay.imageBase64;
    }
    return true;
  };

  const answeredCount = exam.questions.filter(isQuestionAnswered).length;

  const handleSubmit = () => {
    setShowSubmitModal(false);
    const timeSpent = isUnlimited ? secondsElapsed : ((exam.timeMinutes || 60) * 60 - secondsLeft);

    // Auto-save all wrong answers to Error Notebook
    try {
      const grading = StorageService.gradeExam(exam, answers);
      const wrongItems = grading.breakdown
        .filter((b) => !b.isFullyCorrect && answers[b.questionId] !== undefined)
        .map((b) => {
          const q = exam.questions.find((item) => item.id === b.questionId);
          return {
            id: `err_${currentUser.id}_${b.questionId}_${Date.now()}`,
            userId: currentUser.id,
            examId: exam.id,
            examTitle: exam.title,
            subject: exam.subject,
            question: q || (exam.questions[0] as any),
            userAnswer: answers[b.questionId],
            correctAnswerText: b.explanation?.slice(0, 100) || '',
            addedAt: Date.now(),
          };
        });

      if (wrongItems.length > 0) {
        StorageService.saveErrorItems(wrongItems);
      }
    } catch (e) {
      console.warn('Error saving error items on submit:', e);
    }

    onSubmitExam(answers, timeSpent);
  };

  const hasPassage = Boolean(currentQ.passageContent && currentQ.passageContent.trim().length > 0);

  return (
    <div className="min-h-screen pb-16">
      {/* Top sticky test room status bar */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát Phòng Thi</span>
          </button>

          {/* Exam Title & Subject badge */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              {exam.subject}
            </span>
            <span className="text-sm font-semibold text-slate-200 truncate max-w-[320px]">
              {exam.title}
            </span>
            {isVact ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                Thang 1200 Điểm
              </span>
            ) : exam.category === 'hsg' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                Thang 20.0 Điểm HSG
              </span>
            ) : exam.category === 'practice_quiz' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Thang 10 Điểm (Chia đều)
              </span>
            ) : null}
            {hasPassage && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>Đang xem bài đọc hiểu ({currentQ.passageRange || 'Dữ kiện chung'})</span>
              </span>
            )}
          </div>

          {/* Timer & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pressure Simulator Mode Toggle */}
            <button
              onClick={() => setIsPressureMode(!isPressureMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isPressureMode
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 shadow-lg shadow-rose-500/20 animate-pulse'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Bật/Tắt mô phỏng áp lực phòng thi thật"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{isPressureMode ? 'Áp Lực Bật' : 'Áp Lực Phòng Thi'}</span>
            </button>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base ${
                isUnlimited
                  ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                  : secondsLeft <= 300
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-amber-500/30 text-amber-300'
              }`}
            >
              {isUnlimited ? (
                <>
                  <InfinityIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-sans text-slate-400 hidden sm:inline">Thời gian làm:</span>
                  <span>{formatTimer(secondsElapsed)}</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{formatTimer(secondsLeft)}</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp Bài</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pressure Mode Active Status Banner */}
      {isPressureMode && (
        <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/70 border-b border-rose-500/30 px-4 py-2.5 animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-rose-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                MÔ PHỎNG ÁP LỰC PHÒNG THI 2027:
              </span>
              <span className="text-slate-300">
                Nhịp độ: <strong>{answeredCount > 0 ? (secondsElapsed / answeredCount).toFixed(0) : '0'}s/câu</strong> (Chuẩn: 90s/câu)
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-slate-400">Tâm lý:</span>
              {(answerSwitchCounts[currentQ.id] || 0) > 1 ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Đang phân vân đổi đáp án - Hít sâu 3 giây!
                </span>
              ) : (Date.now() - questionStartTime) < 5000 ? (
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Tốc độ cao - Cảnh giác bẫy đề thi!
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Bình tĩnh & Phong độ vững vàng
                </span>
              )}

              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-slate-700 font-mono">
                Band dự đoán: {isVact ? '960 - 1120đ' : exam.category === 'hsg' ? '16.5 - 18.5đ' : '8.5 - 9.2đ'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={`${hasPassage ? 'max-w-[1600px]' : 'max-w-7xl'} mx-auto px-4 pt-6 pb-12 grid grid-cols-1 ${hasPassage ? 'lg:grid-cols-12' : 'lg:grid-cols-4'} gap-6`}>
        {/* PERSISTENT STICKY READING PASSAGE / SHARED STIMULUS (Only visible when hasPassage is true) */}
        {hasPassage && (
          <div className="lg:col-span-6 space-y-4">
            {/* Desktop Persistent Sticky Reading Card */}
            <div className="hidden lg:block bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 sticky top-20 max-h-[calc(100vh-6.5rem)] overflow-y-auto">
              {/* Header with Title, Range badge & Font size controls */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-300">
                      {currentQ.passageTitle || 'Đoạn Văn Đọc Hiểu / Dữ Kiện Dùng Chung'}
                    </h3>
                    {currentQ.passageRange && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Cố định xuyên suốt: <strong className="text-amber-400">{currentQ.passageRange}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Font size adjustment */}
                <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 px-1 font-semibold flex items-center gap-0.5">
                    <Type className="w-3 h-3 text-slate-400" /> Cỡ chữ:
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassageFontSize('sm')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      passageFontSize === 'sm' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Cỡ chữ nhỏ"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageFontSize('base')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      passageFontSize === 'base' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Cỡ chữ tiêu chuẩn"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageFontSize('lg')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      passageFontSize === 'lg' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Cỡ chữ lớn"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* DISTINCT BOLD INSTRUCTION CARD (Separated from passage text) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 shadow-md">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold tracking-wider text-amber-400 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Yêu Cầu Đề Bài (In Đậm Đứng Riêng):</span>
                </div>
                <div className="text-xs sm:text-sm font-bold leading-relaxed italic sm:not-italic">
                  {currentQ.passageInstruction || 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions.'}
                </div>
              </div>

              {/* OPTIONAL ILLUSTRATION IMAGE / SVG IN PASSAGE */}
              {(currentQ.passageImageUrl || currentQ.passageSvg) && (
                <div className="p-4 rounded-2xl bg-white border border-slate-700 shadow-inner flex justify-center items-center overflow-hidden">
                  {currentQ.passageImageUrl && (
                    <img
                      src={currentQ.passageImageUrl}
                      alt="Hình minh họa bài đọc"
                      className="max-h-56 object-contain"
                    />
                  )}
                  {currentQ.passageSvg && !currentQ.passageImageUrl && (
                    <MathDiagram svgContent={currentQ.passageSvg} title="Hình minh họa bài đọc" />
                  )}
                </div>
              )}

              {/* PASSAGE CONTENT PARAGRAPHS */}
              <div
                className={`text-slate-200 leading-relaxed sm:leading-loose font-normal tracking-wide transition-all ${
                  passageFontSize === 'lg' ? 'text-base sm:text-lg space-y-4' :
                  passageFontSize === 'sm' ? 'text-xs space-y-2.5' :
                  'text-xs sm:text-sm space-y-3.5'
                }`}
              >
                <MathText content={currentQ.passageContent || ''} />
              </div>

              {/* CITATION (if available) */}
              {currentQ.passageCitation && (
                <div className="text-right text-xs italic text-slate-400 pt-3 border-t border-slate-800">
                  {currentQ.passageCitation}
                </div>
              )}
            </div>

            {/* Mobile Collapsible Drawer Banner (< lg) */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobilePassageOpen(!mobilePassageOpen)}
                className="w-full p-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/20 border border-amber-500/40 text-amber-200 flex items-center justify-between font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{mobilePassageOpen ? 'Thu Gọn Bài Đọc Hiểu' : 'Xem Bài Đọc Hiểu Dùng Chung'} ({currentQ.passageRange || 'Câu liên kết'})</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${mobilePassageOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobilePassageOpen && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 max-h-96 overflow-y-auto space-y-3 shadow-lg">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-bold leading-relaxed">
                    {currentQ.passageInstruction || 'Đọc đoạn văn sau và trả lời các câu hỏi liên quan:'}
                  </div>
                  {(currentQ.passageImageUrl || currentQ.passageSvg) && (
                    <div className="p-2 rounded-xl bg-white flex justify-center">
                      {currentQ.passageImageUrl && <img src={currentQ.passageImageUrl} alt="Minh họa" className="max-h-40 object-contain" />}
                      {currentQ.passageSvg && !currentQ.passageImageUrl && <MathDiagram svgContent={currentQ.passageSvg} title="Minh họa" />}
                    </div>
                  )}
                  <div className="text-xs text-slate-200 leading-relaxed">
                    <MathText content={currentQ.passageContent || ''} />
                  </div>
                  {currentQ.passageCitation && (
                    <div className="text-right text-[11px] italic text-slate-400 pt-1">
                      {currentQ.passageCitation}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Single-Question Stage (4 cols in split layout, 3 cols in standard) */}
        <div className={`${hasPassage ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Top row: Question Index, Type badge, Flag button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm shadow">
                  Câu {currentIndex + 1}
                </span>
                <span className="text-xs text-slate-400">
                  / {totalQuestions} câu
                </span>

                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  {currentQ.type === 'multiple_choice' && (isVact ? `Trắc nghiệm (${currentQ.points} điểm)` : 'Trắc nghiệm 4 lựa chọn (0.25đ)')}
                  {currentQ.type === 'true_false' && (isVact ? `Đúng / Sai (${currentQ.points} điểm)` : 'Đúng / Sai 4 ý (1.0đ)')}
                  {currentQ.type === 'short_answer' && (isVact ? `Trả lời ngắn (${currentQ.points} điểm)` : 'Trả lời ngắn (Tối đa 4 ký tự)')}
                  {currentQ.type === 'essay' && `Tự luận viết tay (${currentQ.maxPoints}đ - AI Chấm)`}
                </span>

                {isVact && currentQ.difficulty && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                    currentQ.difficulty === 'very_hard' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    currentQ.difficulty === 'hard' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {currentQ.difficulty === 'very_hard' ? 'Vận dụng cao (+nhiều điểm)' :
                     currentQ.difficulty === 'hard' ? 'Vận dụng' : 'Thông hiểu / Nhận biết'}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleToggleFlag(currentQ.id)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  flagged[currentQ.id]
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Đánh dấu câu hỏi để xem lại sau"
              >
                <Flag className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">
                  {flagged[currentQ.id] ? 'Đã Đánh Dấu' : 'Đánh Dấu'}
                </span>
              </button>
            </div>

            {/* Dynamic Section Header */}
            {currentQ.section && (
              <div className="mt-4 mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentQ.section}</span>
              </div>
            )}

            {/* Question Prompt & Diagram */}
            {(() => {
              let pText = currentQ.prompt || '';
              let svg = currentQ.illustrationSvg || '';
              const svgMatch = pText.match(/<svg[\s\S]*?<\/svg>/i);
              if (svgMatch) {
                if (!svg) svg = svgMatch[0];
                pText = pText.replace(/<svg[\s\S]*?<\/svg>/gi, '').trim();
              }
              return (
                <div className="my-5 space-y-4">
                  <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
                    <MathText content={pText} />
                  </div>

                  {(svg || currentQ.imageUrl) && (
                    <MathDiagram
                      svgContent={svg}
                      imageUrl={currentQ.imageUrl}
                      title="Hình vẽ minh họa đề thi"
                    />
                  )}
                </div>
              );
            })()}

            {/* Answer Interaction Area */}
            {/* Answer Interaction Area */}
            {(() => {
              const isLocked = Boolean(checkedQuestions[currentQ.id]);

              return (
                <div className="space-y-5 pt-2">
                  {/* Type 1: Multiple Choice */}
                  {currentQ.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 gap-3">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = answers[currentQ.id] === optIdx;
                        const isCorrectChoice = optIdx === currentQ.correctOptionIndex;
                        let cardStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950/90';

                        if (isLocked) {
                          if (isCorrectChoice) {
                            cardStyle = 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 font-semibold shadow-md shadow-emerald-500/10';
                          } else if (isSelected) {
                            cardStyle = 'bg-rose-950/50 border-rose-500/80 text-rose-200';
                          } else {
                            cardStyle = 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60';
                          }
                        } else if (isSelected) {
                          cardStyle = 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isLocked}
                            onClick={() => handleSelectOption(currentQ.id, optIdx)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${cardStyle} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                isLocked && isCorrectChoice
                                  ? 'bg-emerald-500 text-slate-950 font-black'
                                  : isLocked && isSelected
                                  ? 'bg-rose-500 text-white font-black'
                                  : isSelected
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {['A', 'B', 'C', 'D'][optIdx]}
                            </span>
                            <div className="flex-1 text-sm sm:text-base leading-relaxed flex items-center justify-between gap-2 flex-wrap">
                              <MathText content={opt} />
                              {isLocked && isCorrectChoice && (
                                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Đáp án chính xác
                                </span>
                              )}
                              {isLocked && isSelected && !isCorrectChoice && (
                                <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1 shrink-0">
                                  <XCircle className="w-3.5 h-3.5" /> Bạn đã chọn câu này
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type 2: True / False */}
                  {currentQ.type === 'true_false' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          Quy tắc trừ điểm chuẩn: Đúng trọn vẹn: 100% điểm câu | Sai 1 ý: trừ 50% | Sai 2 ý: trừ 75% | Sai 3 ý: trừ 90% | Sai cả 4 ý: 0đ.
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                        {currentQ.subQuestions.map((sub, sIdx) => {
                          const currentSubAnswers = (answers[currentQ.id] as TrueFalseUserAnswer) || {};
                          const subKey = sub.id || ['a', 'b', 'c', 'd'][sIdx];
                          const selectedVal = (currentSubAnswers as any)[subKey] ?? (currentSubAnswers as any)[sub.id];
                          const displayLetter = (sub.id?.replace(/^q\d+_?/i, '') || ['a', 'b', 'c', 'd'][sIdx]).toLowerCase();
                          const subText = sub.text || (sub as any).statement || (sub as any).content || (sub as any).prompt || '';

                          return (
                            <div
                              key={subKey}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                                  {displayLetter})
                                </span>
                                <div className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                                  <MathText content={subText || `Mệnh đề ${displayLetter})`} />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <button
                                  disabled={isLocked}
                                  onClick={() => handleSelectTrueFalse(currentQ.id, subKey, true)}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                    selectedVal === true
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                                  } ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Đúng
                                </button>
                                <button
                                  disabled={isLocked}
                                  onClick={() => handleSelectTrueFalse(currentQ.id, subKey, false)}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                    selectedVal === false
                                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm'
                                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                                  } ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Sai
                                </button>
                                {isLocked && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    sub.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                  }`}>
                                    (Chuẩn: {sub.isCorrect ? 'Đúng' : 'Sai'})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Type 3: Short Answer */}
                  {currentQ.type === 'short_answer' && (
                    <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">
                          Nhập đáp án số (Tối đa 4 ký tự, có thể có dấu âm '-' hoặc dấu phẩy ','):
                        </label>
                        <div className="flex items-center gap-3 max-w-sm">
                          <input
                            type="text"
                            maxLength={4}
                            disabled={isLocked}
                            value={(answers[currentQ.id] as string) || ''}
                            onChange={(e) => handleShortAnswerChange(currentQ.id, e.target.value)}
                            placeholder="Ví dụ: 62 hoặc -2.5"
                            className={`w-48 px-4 py-3 rounded-xl bg-slate-900 border text-amber-300 font-mono text-xl font-bold tracking-widest text-center focus:outline-none ${
                              isLocked ? 'border-slate-800 opacity-80 cursor-not-allowed' : 'border-slate-700 focus:border-amber-400'
                            }`}
                          />
                          <span className="text-xs text-slate-500 font-mono">
                            {((answers[currentQ.id] as string) || '').length}/4 ký tự
                          </span>
                        </div>
                        {isLocked && (
                          <div className="mt-3 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Đáp án chuẩn: <strong>{currentQ.correctAnswer}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Type 4: Essay */}
                  {currentQ.type === 'essay' && (
                    <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            Chấm Điểm Tự Luận Qua Ảnh Viết Tay Bằng Gemini AI Vision
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Hãy làm bài giải ra giấy, chụp ảnh rõ nét và tải lên. AI sẽ OCR đọc bài và chấm theo barem.
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-300 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">
                          Điểm tối đa: {currentQ.maxPoints}đ
                        </span>
                      </div>

                      {/* Rubric display */}
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                        <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                          Barem chấm điểm chi tiết:
                        </div>
                        {currentQ.rubric.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-center justify-between gap-2 text-slate-400">
                            <span>• {r.step}</span>
                            <span className="font-bold text-amber-400 shrink-0">+{r.points}đ</span>
                          </div>
                        ))}
                      </div>

                      {/* Photo upload input */}
                      <div className="space-y-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, currentQ.id)}
                          className="hidden"
                        />

                        {!(answers[currentQ.id] as EssayUserAnswer)?.imageBase64 ? (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={essayGradingLoading}
                            className="w-full py-8 border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-900/50 transition-all cursor-pointer group"
                          >
                            <div className="p-3 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 transition-colors">
                              <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-slate-300 group-hover:text-amber-300">
                              Nhấn để tải lên ảnh chụp bài làm viết tay (.jpg, .png)
                            </span>
                            <span className="text-xs text-slate-500">
                              Hỗ trợ ảnh chụp từ điện thoại hoặc máy tính
                            </span>
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-72 flex items-center justify-center bg-black/40">
                              <img
                                src={(answers[currentQ.id] as EssayUserAnswer).imageBase64}
                                alt="Bài làm viết tay"
                                className="max-h-72 object-contain"
                              />
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Đổi Ảnh Khác
                              </button>
                            </div>

                            {essayGradingLoading ? (
                              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs sm:text-sm animate-pulse">
                                <RefreshCw className="w-5 h-5 animate-spin text-amber-400 shrink-0" />
                                <div>
                                  <div className="font-bold">Gemini AI Vision đang đọc chữ viết tay...</div>
                                  <div className="text-xs text-slate-400">
                                    Đang đối chiếu bài làm với các bước trong Barem chấm điểm chính thức.
                                  </div>
                                </div>
                              </div>
                            ) : (answers[currentQ.id] as EssayUserAnswer)?.aiGraded ? (
                              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Đã Chấm Điểm Bởi Gemini AI Vision
                                  </span>
                                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-sm border border-emerald-500/40">
                                    {(answers[currentQ.id] as EssayUserAnswer).scoreAwarded} / {currentQ.maxPoints} Điểm
                                  </span>
                                </div>

                                <p className="text-xs text-slate-300 italic">
                                  "{(answers[currentQ.id] as EssayUserAnswer).feedback}"
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  const b64 = (answers[currentQ.id] as EssayUserAnswer).imageBase64;
                                  if (b64) gradeEssayWithAI(currentQ.id, b64, 'image/jpeg');
                                }}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Brain className="w-4 h-4" />
                                Chấm Điểm Bằng AI Ngay
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* NÚT CHECK & KHÓA CÂU HỎI (THEO YÊU CẦU ĐẶC BIỆT CỦA BẠN) */}
                  {!isLocked ? (
                    <div className="pt-4 border-t border-slate-800 space-y-2">
                      <button
                        onClick={() => handleCheckQuestion(currentQ.id)}
                        disabled={!isQuestionAnswered(currentQ)}
                        className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
                          isQuestionAnswered(currentQ)
                            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20 animate-pulse'
                            : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Kiểm Tra Câu Này (Check) & Khóa Đáp Án</span>
                      </button>
                      <p className="text-[11px] text-slate-400 text-center">
                        {isQuestionAnswered(currentQ)
                          ? '⚡ Bấm để AI chấm điểm ngay và xem lời giải chi tiết. Sau khi Check, câu này sẽ bị khóa và không thể sửa lại trong lần thi này.'
                          : 'Bạn có thể thoải mái sửa đổi đáp án. Hãy chọn hoặc nhập đáp án trước khi bấm Kiểm tra.'}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>Đã Kiểm Tra (Check) & Khóa Câu Hỏi</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                Không thể đổi đáp án
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Câu hỏi đã được ghi nhận. Hãy nghiên cứu kỹ lời giải bên dưới hoặc chuyển câu kế tiếp.
                            </p>
                          </div>
                        </div>

                        {currentIndex + 1 < totalQuestions ? (
                          <button
                            onClick={() => setCurrentIndex((prev) => prev + 1)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
                          >
                            <span>Câu Kế Tiếp</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowSubmitModal(true)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                          >
                            <span>Hoàn Thành & Nộp Bài</span>
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* LỜI GIẢI CHI TIẾT & GIA SƯ AI GIẢI THÍCH TỪNG BƯỚC */}
                  {revealedExplanations[currentQ.id] && (
                    <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                          <Sparkles className="w-4 h-4" />
                          Lời Giải Chi Tiết & Phân Tích Cạm Bẫy Đề Thi:
                        </div>
                        <button
                          onClick={handleAskAiTutor}
                          disabled={aiTutorLoading}
                          className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          <span>{aiTutorLoading ? 'AI Đang Giải...' : 'Hỏi Sâu Gemini'}</span>
                        </button>
                      </div>

                      <div className="text-sm text-slate-200 leading-relaxed">
                        <MathText content={currentQ.explanation} />
                      </div>

                      {/* Interactive Step-by-Step Explainer */}
                      <div className="pt-3 border-t border-amber-500/20 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Gia Sư AI Giải Thích Chi Tiết Từng Bước (Interactive Step Explainer):</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={stepExplainerQuery}
                            onChange={(e) => setStepExplainerQuery(e.target.value)}
                            placeholder="Ví dụ: Tại sao ở bước 2 lại suy ra được bất đẳng thức này?"
                            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            onKeyDown={(e) => e.key === 'Enter' && handleAskStepExplainer()}
                          />
                          <button
                            onClick={handleAskStepExplainer}
                            disabled={stepExplainerLoading || !stepExplainerQuery.trim()}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            {stepExplainerLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            <span>Hỏi Ngay</span>
                          </button>
                        </div>

                        {stepExplainerResponse && (
                          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-slate-200 leading-relaxed mt-2 animate-in fade-in">
                            <MathText content={stepExplainerResponse} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {aiTutorResponse && (
                    <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                        <Brain className="w-4 h-4" />
                        Trợ Lý AI Phân Tích Phương Pháp & Mẹo Casio:
                      </div>
                      <div className="text-sm text-slate-200 leading-relaxed">
                        <MathText content={aiTutorResponse} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Pagination Next / Previous Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu Trước</span>
              </button>

              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Sử dụng bảng mục lục bên phải để nhảy nhanh câu hỏi
              </span>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <span>Câu Tiếp Theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <span>Nộp Bài Hoàn Tất</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator / Palette Grid (1 col sidebar, or 2 cols in split layout) */}
        <div className={`${hasPassage ? 'lg:col-span-2' : 'lg:col-span-1'} space-y-4`}>
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-xl sticky top-20">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">Mục Lục Câu Hỏi</h3>
              <span className="text-xs font-mono font-bold text-amber-400">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Đã làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Chưa làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Đánh dấu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-amber-400" />
                <span>Đang chọn</span>
              </div>
            </div>

            {/* Dynamic Section Tabs if multi-section */}
            {exam.sections && exam.sections.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedSectionId('all')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSectionId === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tất cả ({totalQuestions})
                </button>
                {exam.sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setSelectedSectionId(sec.id);
                      const targetIdx = exam.questions.findIndex(
                        (q) => q.sectionId === sec.id || q.section === sec.title
                      );
                      if (targetIdx >= 0) setCurrentIndex(targetIdx);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSectionId === sec.id
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title={sec.title}
                  >
                    {sec.title.split(':')[0] || sec.title}
                  </button>
                ))}
              </div>
            )}

            {/* Grid of Question Number Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {exam.questions.map((q, qIndex) => {
                const matchesSection =
                  selectedSectionId === 'all' ||
                  q.sectionId === selectedSectionId ||
                  q.section === exam.sections?.find((s) => s.id === selectedSectionId)?.title;

                if (!matchesSection) return null;
                const isCurrent = qIndex === currentIndex;
                const isAnswered = isQuestionAnswered(q);
                const isFlagged = !!flagged[q.id];

                let bgClasses = 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500';
                if (isAnswered) {
                  bgClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
                }
                if (isFlagged) {
                  bgClasses = 'bg-purple-500/25 text-purple-300 border-purple-500/50 font-bold';
                }
                if (isCurrent) {
                  bgClasses += ' ring-2 ring-amber-400 scale-105';
                }

                const isPassageQ = Boolean(q.passageContent);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(qIndex)}
                    className={`h-9 rounded-xl border text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative ${bgClasses}`}
                    title={`Chuyển tới câu ${qIndex + 1}${isPassageQ ? ' (Bài đọc hiểu / dữ kiện dùng chung)' : ''}`}
                  >
                    {qIndex + 1}
                    {isPassageQ && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-slate-950" title="Bài đọc hiểu dùng chung" />
                    )}
                    {isFlagged && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-400 border border-slate-950" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Tiến độ hoàn thành:</span>
                <span className="font-bold text-slate-200">
                  {Math.round((answeredCount / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Quick Submit button on sidebar */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp Bài Thi Ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-100">
              Xác Nhận Nộp Bài Thi?
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Đã làm:</span>
                <span className="font-bold text-emerald-400">
                  {answeredCount} / {totalQuestions} câu
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Chưa làm:</span>
                <span className="font-bold text-rose-400">
                  {totalQuestions - answeredCount} câu
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Thời gian:</span>
                <span className="font-mono font-bold text-amber-400">
                  {isUnlimited ? formatTimer(secondsElapsed) : formatTimer(secondsLeft)}
                </span>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <p className="text-xs text-amber-300/90 text-center">
                Bạn vẫn còn {totalQuestions - answeredCount} câu chưa hoàn thành. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Làm Tiếp
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                Đồng Ý Nộp Bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-100">
              Rời Khỏi Phòng Thi?
            </h3>
            <p className="text-xs text-slate-400 text-center">
              Các câu trả lời chưa nộp sẽ không được lưu vào kết quả. Bạn có chắc muốn thoát?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Ở Lại Làm Bài
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Xác Nhận Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
