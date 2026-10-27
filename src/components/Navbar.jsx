import React from 'react';
import {
  Wallet, Plus, Repeat, ArrowRightLeft, FileSpreadsheet,
  Target, Sun, Moon, Calendar, Coins, User, LogOut
} from 'lucide-react';
import { DEFAULT_CURRENCIES } from '../utils/currencyEngine';

export default function Navbar({
  selectedMonth,
  onMonthChange,
  baseCurrency,
  onOpenExpenseModal,
  onOpenFixedModal,
  onOpenCurrencyModal,
  onOpenBudgetModal,
  onOpenExportModal,
  isDark,
  onToggleTheme,
  userSession,
  onLogout,
}) {
  const currentCurr = DEFAULT_CURRENCIES.find(c => c.code === baseCurrency) || { symbol: baseCurrency, flag: '💰' };

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors no-print ${
      isDark
        ? 'border-slate-800/80 bg-slate-950/80 text-slate-100'
        : 'border-slate-200/90 bg-white/85 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="شعار مصروفي"
            className={`w-11 h-11 object-contain rounded-2xl shadow-md p-1 border transition ${
              isDark
                ? 'bg-white/10 border-white/15 shadow-teal-500/20'
                : 'bg-slate-100 border-slate-200 shadow-slate-200'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                مصروفي
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                إصدار Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">إدارة المصروفات والثوابت وتحويل العملات</p>
          </div>
        </div>

        {/* Center: Month Selector & Base Currency Badge */}
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 shadow-inner transition ${
            isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <Calendar className="w-4 h-4 text-emerald-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && onMonthChange(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              title="اختر شهر المتابعة"
            />
          </div>

          <button
            onClick={onOpenCurrencyModal}
            className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 transition text-xs font-bold shadow-sm ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-amber-500/40 text-amber-400'
                : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
            }`}
            title="إدارة العملات وأسعار الصرف"
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>العملة: {baseCurrency} ({currentCurr.symbol})</span>
          </button>
        </div>

        {/* Actions & Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>مصروف جديد</span>
          </button>

          <button
            onClick={onOpenFixedModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl border border-indigo-500/30 transition shadow-sm active:scale-95"
          >
            <Repeat className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة</span>
            <span>التزام ثابت</span>
          </button>

          <button
            onClick={onOpenCurrencyModal}
            className={`flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-xl border transition ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="محول العملات المباشر"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">محول العملات</span>
          </button>

          <button
            onClick={onOpenBudgetModal}
            className={`flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-xl border transition ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="تحديد ميزانية الشهر"
          >
            <Target className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden lg:inline">الميزانية</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className={`flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-xl border transition ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="تصدير إكسيل وطباعة التقارير"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>تقارير</span>
          </button>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition font-bold text-xs ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
            title={isDark ? 'التحويل للواجهة النهارية (Light)' : 'التحويل للواجهة الليلية (Dark)'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline">الواجهة النهارية</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden xl:inline">الواجهة الليلية</span>
              </>
            )}
          </button>

          {/* User Profile & Logout */}
          {userSession && (
            <div className={`flex items-center gap-2 border px-2.5 py-1.5 rounded-xl ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-bold truncate max-w-[120px]">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span className="truncate">{userSession.fullName || userSession.email.split('@')[0]}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
