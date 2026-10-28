import React, { useState, useEffect } from 'react';
import { User, MultipleChoiceQuestion } from '../types';
import { MathText } from './MathText';
import { 
  Swords, Trophy, Flame, Zap, Clock, ShieldCheck, 
  X, CheckCircle, AlertCircle, ArrowRight, RotateCcw, Crown 
} from 'lucide-react';

interface QuizBattleModalProps {
  currentUser: User;
  onClose: () => void;
}

const BATTLE_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 'bq1',
    type: 'multiple_choice',
    section: 'Vòng 1: Khởi Động Phản Xạ',
    prompt: 'Giá trị cực tiểu của hàm số $y = x^3 - 3x + 1$ là bao nhiêu?',
    options: ['A. -1', 'B. 1', 'C. 3', 'D. -2'],
    correctOptionIndex: 0,
    points: 100,
    difficulty: 'easy',
    explanation: 'Ta có $y\' = 3x^2 - 3 = 0 \\iff x = \\pm 1$. Điểm cực tiểu là $x = 1$, giá trị cực tiểu $y(1) = 1 - 3 + 1 = -1$.',
  },
  {
    id: 'bq2',
    type: 'multiple_choice',
    section: 'Vòng 2: Tốc Độ Oxyz',
    prompt: 'Trong không gian $Oxyz$, mặt phẳng $(P): 2x - y + 2z - 4 = 0$ có một vectơ pháp tuyến là:',
    options: ['A. $\\vec{n} = (2; -1; 2)$', 'B. $\\vec{n} = (2; 1; 2)$', 'C. $\\vec{n} = (-1; 2; -4)$', 'D. $\\vec{n} = (2; -1; -4)$'],
    correctOptionIndex: 0,
    points: 100,
    difficulty: 'easy',
    explanation: 'Từ phương trình tổng quát $Ax + By + Cz + D = 0$, vectơ pháp tuyến là $\\vec{n} = (A; B; C) = (2; -1; 2)$.',
  },
  {
    id: 'bq3',
    type: 'multiple_choice',
    section: 'Vòng 3: Tăng Tốc Tiếng Anh',
    prompt: 'Choose the word whose underlined part differs from the other three in pronunciation: <u>ch</u>emistry, <u>ch</u>aracter, <u>ch</u>ampion, <u>ch</u>aos.',
    options: ['A. champion', 'B. chemistry', 'C. character', 'D. chaos'],
    correctOptionIndex: 0,
    points: 150,
    difficulty: 'medium',
    explanation: '"champion" phát âm là /tʃ/, trong khi 3 từ còn lại phát âm là /k/.',
  },
  {
    id: 'bq4',
    type: 'multiple_choice',
    section: 'Vòng 4: Logic V-ACT',
    prompt: 'Nếu "Mọi con thiên nga đều màu trắng" là một mệnh đề SAI, thì mệnh đề nào sau đây CHẮC CHẮN ĐÚNG?',
    options: [
      'A. Mọi con thiên nga đều màu đen',
      'B. Có ít nhất một con thiên nga không có màu trắng',
      'C. Không có con thiên nga nào màu trắng',
      'D. Hầu hết các con thiên nga đều màu xám'
    ],
    correctOptionIndex: 1,
    points: 150,
    difficulty: 'medium',
    explanation: 'Phủ định của $\\forall x, P(x)$ là $\\exists x, \\neg P(x)$ ("Có ít nhất một con thiên nga không có màu trắng").',
  },
  {
    id: 'bq5',
    type: 'multiple_choice',
    section: 'Vòng Chung Kết: Quyết Định Thắng Bại',
    prompt: 'Số nghiệm nguyên dương của bất phương trình $2^{x^2 - 4} < 16$ là:',
    options: ['A. 2', 'B. 3', 'C. 1', 'D. 4'],
    correctOptionIndex: 0,
    points: 200,
    difficulty: 'hard',
    explanation: '$2^{x^2 - 4} < 2^4 \\iff x^2 - 4 < 4 \\iff x^2 < 8$. Với $x \\in \\mathbb{Z}^+$, ta có $x \\in \\{1, 2\\}$. Vậy có đúng 2 nghiệm nguyên dương.',
  },
];

export const QuizBattleModal: React.FC<QuizBattleModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [userSelected, setUserSelected] = useState<number | null>(null);
  const [aiSelected, setAiSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [isBattleOver, setIsBattleOver] = useState(false);

  const currentQ = BATTLE_QUESTIONS[currentQIndex];

  // Timer tick
  useEffect(() => {
    if (isRoundFinished || isBattleOver) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isRoundFinished, isBattleOver]);

  // AI bot answer simulation (AI chooses after 3 - 8 seconds with 80% accuracy)
  useEffect(() => {
    if (isRoundFinished || isBattleOver) return;
    setAiSelected(null);

    const aiDelay = Math.floor(Math.random() * 5000) + 3000;
    const aiTimer = setTimeout(() => {
      const isAiCorrect = Math.random() < 0.85;
      const choice = isAiCorrect
        ? currentQ.correctOptionIndex
        : (currentQ.correctOptionIndex + 1) % 4;
      setAiSelected(choice);

      if (isAiCorrect) {
        const speedBonus = Math.max(10, timeLeft * 8);
        setAiScore((prev) => prev + currentQ.points + speedBonus);
      }
    }, aiDelay);

    return () => clearTimeout(aiTimer);
  }, [currentQIndex, isRoundFinished, isBattleOver]);

  const handleSelectOption = (optIdx: number) => {
    if (userSelected !== null || isRoundFinished) return;

    setUserSelected(optIdx);
    const isCorrect = optIdx === currentQ.correctOptionIndex;

    if (isCorrect) {
      const speedBonus = timeLeft * 10;
      const streakBonus = streak * 25;
      setUserScore((prev) => prev + currentQ.points + speedBonus + streakBonus);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setIsRoundFinished(true);
  };

  const handleTimeOut = () => {
    if (userSelected === null) {
      setUserSelected(-1);
      setStreak(0);
    }
    setIsRoundFinished(true);
  };

  const handleNextRound = () => {
    if (currentQIndex + 1 < BATTLE_QUESTIONS.length) {
      setCurrentQIndex((prev) => prev + 1);
      setUserSelected(null);
      setAiSelected(null);
      setTimeLeft(15);
      setIsRoundFinished(false);
    } else {
      setIsBattleOver(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setUserScore(0);
    setAiScore(0);
    setUserSelected(null);
    setAiSelected(null);
    setTimeLeft(15);
    setStreak(0);
    setIsRoundFinished(false);
    setIsBattleOver(false);
  };

  const isUserWinner = userScore > aiScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Đấu Trường Tri Thức 1v1 Tốc Độ Cao
              </h3>
              <p className="text-[11px] text-slate-400">
                Thách đấu đối kháng với Thủ Khoa AI 2027 • Trả lời nhanh nhận điểm thưởng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Board VS */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center relative">
          {/* User Side */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
              <span>{currentUser.name} (Bạn)</span>
              {streak >= 2 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-extrabold flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 fill-current" /> {streak}x
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {userScore}
            </div>
          </div>

          {/* Center VS pill */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-300">
            VS
          </div>

          {/* AI Side */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-sky-400 flex items-center justify-center gap-1">
              <span>Thủ Khoa AI 2027</span>
              <Zap className="w-3 h-3 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
              {aiScore}
            </div>
          </div>
        </div>

        {!isBattleOver ? (
          <div className="space-y-5">
            {/* Round info & Timer bar */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">
                Câu {currentQIndex + 1} / {BATTLE_QUESTIONS.length}: {currentQ.section}
              </span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400">
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Timer visual bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 4 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              />
            </div>

            {/* Question Prompt */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
              <MathText content={currentQ.prompt} />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelectedByUser = userSelected === optIdx;
                const isCorrect = optIdx === currentQ.correctOptionIndex;
                let btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-amber-400';

                if (isRoundFinished) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isSelectedByUser) {
                    btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                  }
                } else if (isSelectedByUser) {
                  btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isRoundFinished}
                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm transition-all duration-200 cursor-pointer ${btnStyle}`}
                  >
                    <MathText content={opt} />
                  </button>
                );
              })}
            </div>

            {/* Round result & Next Round button */}
            {isRoundFinished && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 animate-in fade-in">
                <div className="text-xs">
                  {userSelected === currentQ.correctOptionIndex ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Chính xác! Bạn nhận được điểm thưởng tốc độ.
                    </span>
                  ) : (
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Chưa đúng! Đáp án chính xác là phương án màu xanh.
                    </span>
                  )}
                </div>

                <button
                  onClick={handleNextRound}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
                >
                  <span>{currentQIndex + 1 < BATTLE_QUESTIONS.length ? 'Câu Kế Tiếp' : 'Xem Kết Quả'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Final Result */
          <div className="text-center py-8 space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950">
              {isUserWinner ? (
                <Crown className="w-9 h-9 fill-current" />
              ) : (
                <Trophy className="w-9 h-9 fill-current" />
              )}
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {isUserWinner ? '🎉 CHIẾN THẮNG TUYỆT ĐỐI!' : 'BẠN ĐÃ RẤT NỖ LỰC!'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {isUserWinner
                  ? `Xuất sắc! Bạn đã đánh bại Thủ Khoa AI với tỷ số ${userScore} - ${aiScore}. Phản xạ và kiến thức của bạn xứng đáng dẫn đầu khóa 2027!`
                  : `Tỷ số chung cuộc: Bạn ${userScore} - ${aiScore} Thủ Khoa AI. Hãy rèn luyện thêm để vượt lên trong lượt đấu kế tiếp!`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thách Đấu Lại</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/20"
              >
                <span>Trở Về Ngân Hàng Đề</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
