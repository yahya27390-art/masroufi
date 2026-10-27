import React from 'react';
import {
  Wallet, Plus, Repeat, ArrowRightLeft, FileSpreadsheet,
  Target, Sun, Moon, Calendar, Coins
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
}) {
  const currentCurr = DEFAULT_CURRENCIES.find(c => c.code === baseCurrency) || { symbol: baseCurrency, flag: '💰' };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="شعار مصروفي"
            className="w-11 h-11 object-contain rounded-2xl shadow-lg shadow-teal-500/20 bg-white/10 p-1 border border-white/15 backdrop-blur-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                مصروفي
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                إصدار Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">إدارة المصروفات والثوابت وتحويل العملات</p>
          </div>
        </div>

        {/* Center: Month Selector & Base Currency Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && onMonthChange(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-200 outline-none cursor-pointer"
              title="اختر شهر المتابعة"
            />
          </div>

          <button
            onClick={onOpenCurrencyModal}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl px-3 py-1.5 transition text-xs font-bold text-amber-400 shadow-sm"
            title="إدارة العملات وأسعار الصرف"
          >
            <Coins className="w-4 h-4 text-amber-400" />
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
            className="flex items-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs px-3 py-2 rounded-xl border border-indigo-500/30 transition shadow-sm active:scale-95"
          >
            <Repeat className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة</span>
            <span>التزام ثابت</span>
          </button>

          <button
            onClick={onOpenCurrencyModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 font-bold text-xs px-3 py-2 rounded-xl border border-slate-800 transition"
            title="محول العملات المباشر"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">محول العملات</span>
          </button>

          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 font-bold text-xs px-3 py-2 rounded-xl border border-slate-800 transition"
            title="تحديد ميزانية الشهر"
          >
            <Target className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">الميزانية</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 font-bold text-xs px-3 py-2 rounded-xl border border-slate-800 transition"
            title="تصدير إكسيل وطباعة التقارير"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>تقارير</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition"
            title={isDark ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}
