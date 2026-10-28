/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Exam, ExamAttempt, StudentAnswerValue, ExamNotification } from './types';
import { StorageService } from './services/storage';
import { ParticlesBackground } from './components/ParticlesBackground';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { ExamList } from './components/ExamList';
import { ExamRoom } from './components/ExamRoom';
import { ResultModal } from './components/ResultModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { MyHistory } from './components/MyHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { KnowledgeGraphModal } from './components/KnowledgeGraphModal';
import { ErrorNotebookModal } from './components/ErrorNotebookModal';
import { VisionTutorModal } from './components/VisionTutorModal';
import { QuizBattleModal } from './components/QuizBattleModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'exams' | 'admin' | 'my_history' | 'leaderboard'>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [notifications, setNotifications] = useState<ExamNotification[]>([]);

  // Advanced 2027 AI Suite Modals
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const [showErrorNotebook, setShowErrorNotebook] = useState(false);
  const [showVisionTutor, setShowVisionTutor] = useState(false);
  const [showQuizBattle, setShowQuizBattle] = useState(false);

  // Active taking exam
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Result modal state
  const [activeResultAttempt, setActiveResultAttempt] = useState<ExamAttempt | null>(null);

  // Initial load & live sync across admin and candidate views
  useEffect(() => {
    StorageService.init();
    setCurrentUser(StorageService.getCurrentUser());
    refreshData();

    const handleSync = () => {
      refreshData();
    };

    window.addEventListener('vact_exams_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('vact_exams_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const refreshData = () => {
    setExams(StorageService.getExams());
    setAttempts(StorageService.getAttempts());
    setNotifications(StorageService.getNotifications());
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    refreshData();
    setCurrentView('exams');
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setActiveExam(null);
    setActiveResultAttempt(null);
  };

  // Start taking an exam
  const handleSelectExam = (exam: Exam) => {
    setActiveExam(exam);
  };

  const handleSelectExamById = (examId: string) => {
    const found = exams.find((e) => e.id === examId);
    if (found) {
      setActiveExam(found);
    }
  };

  // Submit exam and grade
  const handleSubmitExam = (
    answers: Record<string, StudentAnswerValue>,
    timeSpentSeconds: number
  ) => {
    if (!activeExam || !currentUser) return;

    const grading = StorageService.gradeExam(activeExam, answers);

    const isOfficial = activeExam.examType === 'official';
    const now = Date.now();

    const newAttempt: ExamAttempt = {
      id: 'att-' + now + '-' + Math.random().toString(36).substring(2, 6),
      examId: activeExam.id,
      examTitle: activeExam.title,
      examType: activeExam.examType,
      category: activeExam.category,
      subject: activeExam.subject,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userSchool: currentUser.school,
      score: grading.scaledScore,
      maxScore: grading.maxScore,
      rawScore: grading.rawScore,
      maxPossibleScore: grading.maxPossibleScore,
      timeSpentSeconds,
      submittedAt: now,
      answers,
      breakdown: grading.breakdown,
      officialLeaderboardUnlockAt: isOfficial ? now + 5 * 60 * 1000 : now,
      motivationalFeedback: grading.motivationalFeedback,
    };

    StorageService.saveAttempt(newAttempt);
    refreshData();
    setActiveExam(null);
    setActiveResultAttempt(newAttempt);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative font-sans">
      {/* Dynamic ambient particles background */}
      <ParticlesBackground />

      {/* Screen 1: Mandatory Secure Login / Register if not logged in */}
      {!currentUser ? (
        <AuthScreen onSuccess={handleAuthSuccess} />
      ) : activeExam ? (
        /* Screen 2: Test Room */
        <ExamRoom
          exam={activeExam}
          currentUser={currentUser}
          onExit={() => setActiveExam(null)}
          onSubmitExam={handleSubmitExam}
        />
      ) : (
        /* Screen 3: Main Portal with Header & Views */
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header
            currentUser={currentUser}
            currentView={currentView}
            notifications={notifications}
            onChangeView={(v) => {
              if (v === 'admin' && currentUser.role !== 'admin') return;
              setCurrentView(v);
            }}
            onLogout={handleLogout}
            onSelectExamById={handleSelectExamById}
            onOpenKnowledgeGraph={() => setShowKnowledgeGraph(true)}
            onOpenErrorNotebook={() => setShowErrorNotebook(true)}
            onOpenVisionTutor={() => setShowVisionTutor(true)}
            onOpenQuizBattle={() => setShowQuizBattle(true)}
          />

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
            {currentView === 'exams' && (
              <ExamList
                exams={exams}
                attempts={attempts}
                notifications={notifications}
                currentUser={currentUser}
                onSelectExam={handleSelectExam}
                onOpenKnowledgeGraph={() => setShowKnowledgeGraph(true)}
                onOpenErrorNotebook={() => setShowErrorNotebook(true)}
                onOpenVisionTutor={() => setShowVisionTutor(true)}
                onOpenQuizBattle={() => setShowQuizBattle(true)}
              />
            )}

            {currentView === 'admin' && currentUser.role === 'admin' && (
              <AdminDashboard
                currentUser={currentUser}
                exams={exams}
                attempts={attempts}
                onExamsUpdated={refreshData}
              />
            )}

            {currentView === 'my_history' && (
              <MyHistory
                currentUser={currentUser}
                attempts={attempts}
                exams={exams}
                onSelectAttempt={(att) => setActiveResultAttempt(att)}
              />
            )}

            {currentView === 'leaderboard' && (
              <LeaderboardModal
                exams={exams}
                attempts={attempts}
                currentUser={currentUser}
                onClose={() => setCurrentView('exams')}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                © 2027 Cổng Luyện Thi & Thi Thử THPT Quốc Gia - V-ACT Hoàng Gia. All rights reserved.
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>Chuẩn cấu trúc 2027 Bộ GD&ĐT</span>
                <span>•</span>
                <span>ĐHQG TP.HCM & Hà Nội</span>
                <span>•</span>
                <span>Gemini AI Engine</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Result Modal if active */}
      {activeResultAttempt && (
        <ResultModal
          attempt={activeResultAttempt}
          exam={
            exams.find((e) => e.id === activeResultAttempt.examId) || {
              id: activeResultAttempt.examId,
              title: activeResultAttempt.examTitle,
              category: activeResultAttempt.category,
              subject: activeResultAttempt.subject,
              examType: activeResultAttempt.examType,
              timeMinutes: 45,
              totalPoints: activeResultAttempt.category === 'vact' ? 1200 : 10.0,
              description: '',
              questions: [],
              createdBy: '',
              createdAt: Date.now(),
            }
          }
          onRetake={() => {
            const found = exams.find((e) => e.id === activeResultAttempt.examId);
            setActiveResultAttempt(null);
            if (found) setActiveExam(found);
          }}
          onGoHome={() => setActiveResultAttempt(null)}
          onViewLeaderboard={() => {
            setActiveResultAttempt(null);
            setCurrentView('leaderboard');
          }}
        />
      )}

      {/* 2027 AI Suite Modals */}
      {showKnowledgeGraph && currentUser && (
        <KnowledgeGraphModal
          currentUser={currentUser}
          onClose={() => setShowKnowledgeGraph(false)}
          onStartCustomExam={(customExam) => {
            setShowKnowledgeGraph(false);
            setActiveExam(customExam);
          }}
        />
      )}

      {showErrorNotebook && currentUser && (
        <ErrorNotebookModal
          currentUser={currentUser}
          onClose={() => setShowErrorNotebook(false)}
          onStartCustomExam={(customExam) => {
            setShowErrorNotebook(false);
            setActiveExam(customExam);
          }}
        />
      )}

      {showVisionTutor && currentUser && (
        <VisionTutorModal
          currentUser={currentUser}
          onClose={() => setShowVisionTutor(false)}
        />
      )}

      {showQuizBattle && currentUser && (
        <QuizBattleModal
          currentUser={currentUser}
          onClose={() => setShowQuizBattle(false)}
        />
      )}
    </div>
  );
}
