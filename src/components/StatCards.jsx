import React from 'react';
import {
  TrendingDown, CalendarDays, CheckCircle2,
  AlertTriangle, ShieldCheck, PieChart
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
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400">إجمالي مصروفات الشهر</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-100 tracking-tight">
          {formatMoney(totalExpenses, baseCurrency)}
        </div>
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
          <span>شامل كافة العملات بعد التحويل لـ {baseCurrency}</span>
        </p>
      </div>

      {/* 2. Fixed Commitments (الثوابت والالتزامات الشهرية) */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400">الثوابت والالتزامات الشهرية</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-indigo-300 tracking-tight">
          {formatMoney(fixedTotal, baseCurrency)}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">حالة السداد هذا الشهر:</span>
          <span className={`font-bold flex items-center gap-1 ${fixedPaidCount === fixedTotalCount && fixedTotalCount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {fixedPaidCount} من {fixedTotalCount} تم سداده
          </span>
        </div>
      </div>

      {/* 3. Daily Spending Average */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400">معدل الصرف اليومي</span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-cyan-300 tracking-tight">
          {formatMoney(dailyAverage, baseCurrency)}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          محسوب على مدار {currentDay} يوماً مضت من الشهر
        </p>
      </div>

      {/* 4. Monthly Budget Status */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
        <div className={`absolute -left-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-all ${isOverBudget ? 'bg-rose-500/15' : 'bg-sky-500/10'}`}></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400">الميزانية التقديرية</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isOverBudget ? 'bg-rose-500/15 text-rose-400' : 'bg-sky-500/15 text-sky-400'}`}>
            {isOverBudget ? <AlertTriangle className="w-4 h-4" /> : <PieChart className="w-4 h-4" />}
          </div>
        </div>

        {budget > 0 ? (
          <>
            <div className={`text-2xl font-black tracking-tight ${isOverBudget ? 'text-rose-400' : 'text-slate-100'}`}>
              {isOverBudget ? '-' : ''}{formatMoney(Math.abs(budgetRemaining), baseCurrency)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : budgetPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${budgetPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>تم استهلاك {budgetPercent}%</span>
                <span>الميزانية: {formatMoney(budget, baseCurrency)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-1">
            <span className="text-sm font-bold text-slate-400">غير محددة</span>
            <p className="text-[11px] text-slate-500 mt-1">اضغط على زر "الميزانية" بالأعلى لتحديد سقف الإنفاق الشهري.</p>
          </div>
        )}
      </div>

    </div>
  );
}
