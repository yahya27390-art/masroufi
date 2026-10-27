import React, { useState } from 'react';
import {
  Wallet, Eye, EyeOff, TrendingDown, ArrowUpRight,
  ShieldCheck, Coins, Sparkles, CreditCard, ChevronRight
} from 'lucide-react';
import { formatMoney, convertCurrency } from '../utils/currencyEngine';

export default function HeroCard({
  totalExpenses,
  budget,
  fixedTotal,
  fixedPaidCount,
  fixedTotalCount,
  baseCurrency,
  customRates,
  selectedMonth,
  onOpenExpenseModal,
  onOpenFixedModal,
  onOpenCurrencyModal,
}) {
  const [showBalance, setShowBalance] = useState(true);

  // Month formatted in Arabic
  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const monthArabic = monthNames[parseInt(monthStr, 10) - 1] || selectedMonth;

  // Secondary currency preview (e.g. USD if base is SAR, or SAR if base is USD)
  const secondaryCurrency = baseCurrency === 'SAR' ? 'USD' : 'SAR';
  const inSecondary = convertCurrency(totalExpenses, baseCurrency, secondaryCurrency, customRates);

  const budgetPercent = budget > 0 ? Math.min(100, Math.round((totalExpenses / budget) * 100)) : 0;
  const isOverBudget = budget > 0 && totalExpenses > budget;

  return (
    <div className="relative overflow-hidden rounded-3xl card-luxury p-6 sm:p-8 text-white shadow-2xl no-print">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col justify-between gap-6">
        
        {/* Top Row: Brand & Month & Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="مصروفي"
              className="w-12 h-12 object-contain rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-emerald-300 uppercase">
                  Masroufi Platinum Card
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <h2 className="text-sm font-extrabold text-slate-200">
                دورة شهر {monthArabic} {yearStr}
              </h2>
            </div>
          </div>

          {/* Contactless symbol & Eye toggle */}
          <div className="flex items-center gap-2 bg-slate-950/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
              title={showBalance ? 'إخفاء الأرقام' : 'إظهار الأرقام'}
            >
              {showBalance ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{showBalance ? 'إخفاء الرصيد' : 'إظهار الرصيد'}</span>
            </button>
          </div>
        </div>

        {/* Center: Total Spending Display */}
        <div className="py-2">
          <span className="text-xs font-bold text-slate-300/90 flex items-center gap-1.5 mb-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>إجمالي المصروفات المنفذة خلال هذا الشهر:</span>
          </span>

          <div className="flex items-baseline flex-wrap gap-3">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
              {showBalance ? formatMoney(totalExpenses, baseCurrency) : '••••••••••'}
            </div>
            {showBalance && (
              <span className="text-sm font-semibold text-emerald-300/80 font-mono bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                ≈ {formatMoney(inSecondary, secondaryCurrency)}
              </span>
            )}
          </div>

          {/* Budget Pace Indicator */}
          {budget > 0 && (
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className={isOverBudget ? 'text-rose-400' : 'text-slate-300'}>
                  {isOverBudget ? '⚠️ تم تجاوز سقف الميزانية المحددة' : `استهلاك ${budgetPercent}% من سقف الميزانية`}
                </span>
                <span className="text-slate-400 font-mono">
                  {showBalance ? formatMoney(budget, baseCurrency) : '••••'}
                </span>
              </div>
              <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-white/10 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverBudget ? 'bg-rose-500' : budgetPercent > 85 ? 'bg-amber-400' : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Action buttons on card */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300 font-medium">الثوابت الشهرية:</span>
              <span className="font-bold text-white font-mono">
                {showBalance ? formatMoney(fixedTotal, baseCurrency) : '••••'}
              </span>
              <span className="text-[11px] text-emerald-300 bg-emerald-900/40 px-1.5 py-0.5 rounded font-bold">
                ({fixedPaidCount}/{fixedTotalCount} مسدد)
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg transition active:scale-95"
            >
              <span>+ تسجيل مصروف</span>
            </button>
            <button
              onClick={onOpenFixedModal}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-white/15 transition active:scale-95"
            >
              <span>إدارة الثوابت</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
