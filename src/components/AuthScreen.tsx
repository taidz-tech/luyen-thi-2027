import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { GraduationCap, Lock, Mail, User as UserIcon, School, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    const res = StorageService.login(email, password);
    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setError(res.error || 'Email hoặc mật khẩu không chính xác.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !school || !password) {
      setError('Vui lòng điền đầy đủ các thông tin: Họ tên, Email, Trường học, Mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu tự đặt phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    const res = StorageService.registerUser(name, email, school, password);
    if (res.success && res.user) {
      setSuccessMsg('Đăng ký tài khoản thí sinh thành công! Đang chuyển hướng...');
      setTimeout(() => {
        if (res.user) onSuccess(res.user);
      }, 700);
    } else {
      setError(res.error || 'Đăng ký không thành công.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 z-10">
      <div className="w-full max-w-xl">
        {/* Top Emblem & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/30 shadow-2xl shadow-amber-500/10 mb-4 animate-gold-pulse">
            <GraduationCap className="w-10 h-10 text-amber-400" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Chuẩn Cấu Trúc Khảo Thí Quốc Gia 2027
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent drop-shadow-sm">
            Cổng Luyện Thi Hoàng Gia 2027
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-md mx-auto">
            Hệ thống thi thử & ôn tập trọng điểm <span className="text-amber-400 font-semibold">THPTQG & V-ACT 2027</span> chuẩn cấu trúc mới, tích hợp trợ lý Gemini AI.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle top color bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-sky-400 to-amber-400" />

          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-950/60 rounded-xl border border-slate-800 mb-6">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              Đăng Nhập
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Đăng Ký Thí Sinh Mới
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Email tài khoản
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn để đăng nhập"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Mật khẩu bảo mật
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                Vào Phòng Thi / Bảng Điều Khiển
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Register Form for Candidates */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  Họ và tên thí sinh
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Email cá nhân
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ví dụ: thisinh2027@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-amber-400" />
                  Trường THPT / Đơn vị học tập
                </label>
                <input
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Ví dụ: THPT Chuyên Lê Hồng Phong"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Mật khẩu tự đặt
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Nhập lại mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Khớp với mật khẩu trên"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                Hoàn Tất Đăng Ký & Vào Phòng Thi
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Secure privacy notice */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Hệ thống bảo mật dữ liệu thi và phân quyền quản trị chuẩn khảo thí quốc gia 2027.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
