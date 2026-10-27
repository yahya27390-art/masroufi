import React, { useState } from 'react';
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  ShieldCheck, Sparkles, Sun, Moon, CheckCircle2
} from 'lucide-react';
import { loginUser, registerUser } from '../utils/auth';
import masroufiLogo from '../assets/logo.png';

export default function AuthScreen({ onLoginSuccess, isDark, onToggleTheme }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');
    setLoading(true);

    try {
      let session;
      if (isRegister) {
        session = await registerUser({ email, password, fullName });
        setSuccessNotice('✓ تم إنشاء الحساب وتسجيل الدخول بنجاح');
      } else {
        session = await loginUser(email, password);
        setSuccessNotice('✓ تم تسجيل الدخول بنجاح');
      }
      setTimeout(() => {
        onLoginSuccess(session);
      }, 300);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors font-sans relative overflow-hidden ${
      isDark ? 'bg-mesh text-slate-100' : 'bg-slate-50 text-slate-900'
    }`} dir="rtl">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

      {/* Theme Toggle Button top corner */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onToggleTheme}
          className={`p-2.5 rounded-2xl border transition shadow-sm ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400'
              : 'bg-white border-slate-200 text-slate-600 hover:text-amber-500'
          }`}
          title={isDark ? 'التحويل للواجهة النهارية (Light)' : 'التحويل للواجهة الليلية (Dark)'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Card */}
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-2xl transition-all ${
          isDark
            ? 'glass-panel border-white/10'
            : 'bg-white/90 border-slate-200 shadow-slate-200/50'
        }`}>
          
          {/* Logo & Welcome Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 rounded-3xl bg-emerald-500/25 blur-2xl"></div>
              <img
                src={masroufiLogo}
                alt="شعار مصروفي"
                className="relative w-32 h-32 object-contain rounded-3xl p-2.5 border-2 border-emerald-500/30 shadow-2xl mx-auto bg-white hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              مصروفي · Masroufi
            </h1>
            <p className="text-xs text-slate-400 font-bold mt-1">
              نظام إدارة المصروفات الشهرية والالتزامات المالية
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className={`flex rounded-2xl p-1 mb-6 border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                !isRegister
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                isRegister
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
              {error}
            </div>
          )}
          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name when registering */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-300">الاسم الكامل</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: يحيى محمد"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none border transition ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100'
                        : 'bg-white border-slate-200 focus:border-emerald-500 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Username or Email */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-300">اسم المستخدم أو البريد الإلكتروني</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="emy.ali أو name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none border transition text-right ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100'
                      : 'bg-white border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-300">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl pr-10 pl-10 py-2.5 text-xs font-bold outline-none border transition text-right ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100'
                      : 'bg-white border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
            >
              <span>{isRegister ? 'إنشاء الحساب وبدء الاستخدام' : 'تسجيل الدخول'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security guarantee */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>بياناتك مشفرة ومحمية محلياً بنظام SHA-256</span>
          </div>

        </div>

      </div>
    </div>
  );
}
