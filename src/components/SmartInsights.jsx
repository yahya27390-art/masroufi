import React from 'react';
import {
  Sparkles, AlertCircle, ArrowUpRight, CheckCircle2,
  Calendar, Flame, TrendingDown, Clock
} from 'lucide-react';
import { formatMoney, convertCurrency } from '../utils/currencyEngine';
import CategoryIcon from './CategoryIcon';

export default function SmartInsights({
  expenses,
  fixedExpenses,
  categories,
  budget,
  baseCurrency,
  customRates,
  selectedMonth,
}) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  // 1. Calculate top spending category
  const catTotals = {};
  expenses.forEach(e => {
    const inBase = convertCurrency(e.amount, e.currency, baseCurrency, customRates);
    catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + inBase;
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCats.length > 0 ? { id: sortedCats[0][0], total: sortedCats[0][1] } : null;
  const topCatObj = topCat ? catMap[topCat.id] : null;

  const totalSpent = Object.values(catTotals).reduce((a, b) => a + b, 0);
  const topCatPercent = topCat && totalSpent > 0 ? Math.round((topCat.total / totalSpent) * 100) : 0;

  // 2. Upcoming fixed commitments
  const todayDate = new Date();
  const currentDay = todayDate.getDate();
  const unpaidFixed = fixedExpenses.filter(f => !f.paidMonths || !f.paidMonths.includes(selectedMonth));
  const upcomingFixed = unpaidFixed.filter(f => f.dueDay >= currentDay && f.dueDay <= currentDay + 7);

  // 3. Daily pace recommendation
  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const budgetLeft = budget > totalSpent ? budget - totalSpent : 0;
  const safeDailyPace = budgetLeft > 0 ? budgetLeft / daysRemaining : 0;

  if (expenses.length === 0 && fixedExpenses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 no-print">
      
      {/* 1. Top Category Insight */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
          <Flame className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            أعلى استهلاك شهري
          </span>
          {topCatObj ? (
            <div className="mt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-100">{topCatObj.name}</span>
                <span className="text-xs font-mono font-black text-amber-400">{topCatPercent}% من المصروفات</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                إجمالي المصروف: {formatMoney(topCat.total, baseCurrency)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1">لا توجد عمليات كافية بعد لتحليل الفئات.</p>
          )}
        </div>
      </div>

      {/* 2. Daily Pace Insight */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            المسار اليومي الآمن
          </span>
          {budget > 0 ? (
            <div className="mt-1">
              <div className="text-xs font-black text-slate-100">
                {safeDailyPace > 0 ? `${formatMoney(safeDailyPace, baseCurrency)} / يومياً` : 'تجاوزت الميزانية'}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                معدل الصرف المقترح للأيام الـ {daysRemaining} المتبقية من الشهر.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1">
              حدد سقفاً للميزانية الشهرية لتفعيل حساب معدل الأمان اليومي.
            </p>
          )}
        </div>
      </div>

      {/* 3. Upcoming Fixed Due Alert */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
            استحقاقات الأيام القادمة
          </span>
          <div className="mt-1">
            {upcomingFixed.length > 0 ? (
              <div>
                <span className="text-xs font-black text-slate-100">
                  {upcomingFixed.length} التزام يستحق خلال 7 أيام
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  أقربها: {upcomingFixed[0].title} (يوم {upcomingFixed[0].dueDay})
                </p>
              </div>
            ) : unpaidFixed.length > 0 ? (
              <div>
                <span className="text-xs font-black text-slate-200">
                  {unpaidFixed.length} التزام بانتظار السداد
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  جميع مواعيد الاستحقاق القريبة مجدولة بانتظام.
                </p>
              </div>
            ) : (
              <p className="text-xs text-emerald-400 font-bold mt-1">
                ✓ تم سداد كافة التزامات هذا الشهر بالكامل!
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
