import React from 'react';
import {
  TrendingDown, CalendarDays, CheckCircle2,
  AlertTriangle, ShieldCheck, Target, ArrowDownRight,
  ArrowUpRight, Sparkles
} from 'lucide-react';
import { formatMoney } from '../utils/currencyEngine';

export default function StatCards({
  totalExpenses,
  fixedTotal,
  fixedPaidCount,
  fixedTotalCount,
  dailyAverage,
  budget,
  baseCurrency,
  daysInMonth,
  currentDay,
}) {
  const budgetRemaining = budget > 0 ? budget - totalExpenses : null;
  const budgetPercent = budget > 0 ? Math.min(100, Math.round((totalExpenses / budget) * 100)) : 0;
  const isOverBudget = budget > 0 && totalExpenses > budget;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
      
      {/* 1. Total Monthly Expenses */}
      <div className="glass-card card-shine rounded-2xl p-5 relative overflow-hidden group border-t-2 border-t-emerald-500 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المصروفات</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono">
          {formatMoney(totalExpenses, baseCurrency)}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400">العملة الأساسية:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{baseCurrency}</span>
        </div>
      </div>

      {/* 2. Fixed Commitments (الثوابت) */}
      <div className="glass-card card-shine rounded-2xl p-5 relative overflow-hidden group border-t-2 border-t-indigo-500 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الثوابت الدورية</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300 tracking-tight font-mono">
          {formatMoney(fixedTotal, baseCurrency)}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400">نسبة السداد:</span>
          <span className={`font-black ${fixedPaidCount === fixedTotalCount && fixedTotalCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {fixedPaidCount} من {fixedTotalCount} تم سداده
          </span>
        </div>
      </div>

      {/* 3. Daily Spending Average */}
      <div className="glass-card card-shine rounded-2xl p-5 relative overflow-hidden group border-t-2 border-t-cyan-500 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معدل الصرف اليومي</span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-cyan-700 dark:text-cyan-300 tracking-tight font-mono">
          {formatMoney(dailyAverage, baseCurrency)}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400">الأيام المحسوبة:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{currentDay} من {daysInMonth} يوماً</span>
        </div>
      </div>

      {/* 4. Monthly Budget Status */}
      <div className={`glass-card card-shine rounded-2xl p-5 relative overflow-hidden group border-t-2 ${isOverBudget ? 'border-t-rose-500' : 'border-t-sky-500'} hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الميزانية المستهدفة</span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${isOverBudget ? 'bg-rose-500/15 text-rose-500' : 'bg-sky-500/15 text-sky-500'}`}>
            {isOverBudget ? <AlertTriangle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
          </div>
        </div>

        {budget > 0 ? (
          <>
            <div className={`text-2xl font-black tracking-tight font-mono ${isOverBudget ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
              {isOverBudget ? '-' : ''}{formatMoney(Math.abs(budgetRemaining), baseCurrency)}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">{isOverBudget ? 'تجاوزت بنسبة:' : 'المتبقي من:'}</span>
              <span className={`font-black font-mono ${isOverBudget ? 'text-rose-500' : 'text-sky-600 dark:text-sky-400'}`}>
                {formatMoney(budget, baseCurrency)}
              </span>
            </div>
          </>
        ) : (
          <div className="py-0.5">
            <span className="text-sm font-bold text-slate-400">غير محددة</span>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500">
              اضغط على زر "الميزانية" لتحديد السقف
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
