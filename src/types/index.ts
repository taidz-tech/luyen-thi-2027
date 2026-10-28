export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  school: string;
  role: UserRole;
  password?: string;
  createdAt: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'very_hard';

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  questionCount?: number;
}

export interface BaseQuestionFields {
  id: string;
  points?: number;
  difficulty?: QuestionDifficulty;
  section?: string;
  sectionId?: string;
  imageUrl?: string;
  illustrationSvg?: string;
  explanation: string;
  // Shared reading passage & stimulus fields (English reading comprehension, V-ACT logic/data set)
  passageId?: string; // Group identifier for questions sharing the same stimulus
  passageInstruction?: string; // Prominent bold instruction (e.g. "Read the following passage and mark the letter A, B, C or D...")
  passageContent?: string; // Full stimulus reading text / article / table / experiment
  passageTitle?: string; // Optional title of the passage
  passageRange?: string; // e.g. "Câu 1 - Câu 8"
  passageImageUrl?: string; // Optional illustration image inside passage
  passageSvg?: string; // Optional SVG inside passage
  passageCitation?: string; // e.g. "(Adapted from www.nationalgeographic.com)"
}

export interface MultipleChoiceQuestion extends BaseQuestionFields {
  type: 'multiple_choice';
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

export interface TrueFalseSubItem {
  id: string;
  text: string;
  isCorrect: boolean;
  reason?: string;
}

export interface TrueFalseQuestion extends BaseQuestionFields {
  type: 'true_false';
  prompt: string;
  subQuestions: TrueFalseSubItem[];
  points: number;
}

export interface ShortAnswerQuestion extends BaseQuestionFields {
  type: 'short_answer';
  prompt: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  points: number;
}

export interface RubricStep {
  step: string;
  points: number;
}

export interface EssayQuestion extends BaseQuestionFields {
  type: 'essay';
  prompt: string;
  maxPoints: number;
  rubric: RubricStep[];
  sampleSolution?: string;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | EssayQuestion;

export type ExamCategory = 'thptqg' | 'vact' | 'hsg' | 'practice_quiz';
export type ExamType = 'practice' | 'official';

export interface Exam {
  id: string;
  title: string;
  category: ExamCategory;
  subject: string;
  examType: ExamType;
  timeMinutes: number | null;
  description: string;
  totalPoints: number;
  totalQuestionsCount?: number;
  sections?: ExamSection[];
  questions: Question[];
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  scheduledStartTime?: number;
  resultsPublished?: boolean;
}

export interface TrueFalseUserAnswer {
  a?: boolean;
  b?: boolean;
  c?: boolean;
  d?: boolean;
}

export interface EssayUserAnswer {
  imageBase64?: string;
  aiGraded?: boolean;
  scoreAwarded?: number;
  feedback?: string;
  transcription?: string;
  stepScores?: { step: string; pointsAwarded: number; maxPoints: number; comment?: string }[];
  isGrading?: boolean;
}

export type StudentAnswerValue = number | TrueFalseUserAnswer | string | EssayUserAnswer;

export interface QuestionResultBreakdown {
  questionId: string;
  type: QuestionType;
  scoreAwarded: number;
  maxScore: number;
  isFullyCorrect: boolean;
  explanation: string;
  userAnswer: StudentAnswerValue;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  examType: ExamType;
  category: ExamCategory;
  subject: string;
  userId: string;
  userName: string;
  userEmail: string;
  userSchool: string;
  score: number; // 10.0 scale for THPTQG, 1200 scale for V-ACT
  scaledScore?: number; // Alias for score
  maxScore: number; // 10.0 or 1200
  rawScore: number;
  maxPossibleScore: number;
  timeSpentSeconds: number;
  submittedAt: number;
  answers: Record<string, StudentAnswerValue>;
  breakdown: QuestionResultBreakdown[];
  officialLeaderboardUnlockAt?: number;
  motivationalFeedback?: {
    tier: 'excellent' | 'good' | 'effort';
    title: string;
    message: string;
    quote: string;
  };
}

export interface ExamNotification {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  category: ExamCategory;
  examType: ExamType;
  timeMinutes: number | null;
  scheduledTimeStr: string;
  recipientEmails: string[];
  recipientCount?: number;
  message?: string;
  sentAt: number;
  status: 'sent' | 'delivered';
}

export const STANDARD_SUBJECTS = [
  'Toán',
  'Lí',
  'Hóa',
  'Sinh',
  'Sử',
  'Địa',
  'Văn',
  'Anh',
  'Tin',
  'Giáo dục kinh tế & pháp luật',
  'Công nghệ',
] as const;

export type StandardSubject = typeof STANDARD_SUBJECTS[number];

export interface ErrorNotebookItem {
  id: string;
  userId: string;
  examId: string;
  examTitle: string;
  subject: string;
  question: Question;
  userAnswer: StudentAnswerValue;
  correctAnswerText: string;
  trapsAnalysis?: string;
  addedAt: number;
  resolved?: boolean;
}

export interface KnowledgeTopic {
  id: string;
  subject: string;
  name: string;
  category: string;
  masteryPercent: number; // 0 - 100
  totalAttempted: number;
  correctCount: number;
  weaknessLevel: 'weak' | 'moderate' | 'strong';
  recommendedAction: string;
}
