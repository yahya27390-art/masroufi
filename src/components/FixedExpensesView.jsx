import React from 'react';
import {
  ShieldCheck, CheckCircle2, Clock, Plus, Trash2, Edit2,
  Calendar, ArrowUpRight, AlertCircle, Sparkles, Check
} from 'lucide-react';
import { formatMoney, convertCurrency } from '../utils/currencyEngine';
import CategoryIcon from './CategoryIcon';

export default function FixedExpensesView({
  fixedExpenses,
  selectedMonth,
  baseCurrency,
  customRates,
  categories,
  onPayFixed,
  onEditFixed,
  onDeleteFixed,
  onOpenAddModal,
}) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  // Current date & day
  const today = new Date();
  const currentDay = today.getDate();

  // Calculate totals
  const totalCommitmentInBase = fixedExpenses.reduce((sum, item) => {
    return sum + convertCurrency(item.amount, item.currency, baseCurrency, customRates);
  }, 0);

  const paidItems = fixedExpenses.filter(item => item.paidMonths && item.paidMonths.includes(selectedMonth));
  const unpaidItems = fixedExpenses.filter(item => !item.paidMonths || !item.paidMonths.includes(selectedMonth));

  // Sort unpaid by urgency (nearest upcoming day)
  const sortedUnpaid = [...unpaidItems].sort((a, b) => (a.dueDay || 1) - (b.dueDay || 1));
  const sortedPaid = [...paidItems].sort((a, b) => (a.dueDay || 1) - (b.dueDay || 1));

  const totalPaidInBase = paidItems.reduce((sum, item) => {
    return sum + convertCurrency(item.amount, item.currency, baseCurrency, customRates);
  }, 0);

  const totalUnpaidInBase = totalCommitmentInBase - totalPaidInBase;
  const progressPercent = totalCommitmentInBase > 0 ? Math.round((totalPaidInBase / totalCommitmentInBase) * 100) : 0;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 space-y-6 border border-slate-800/80 no-print">
      
      {/* Top Banner & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-100">الثوابت والالتزامات الشهرية</h2>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {fixedExpenses.length} التزام دوري
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة الإيجارات، الفواتير، الأقساط، والاشتراكات الدورية وسدادها بضغطة زر واحدة
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة التزام ثابت جديد</span>
        </button>
      </div>

      {/* Progress & Stat Capsule */}
      {fixedExpenses.length > 0 && (
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/90 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400">إجمالي الالتزامات الشهرية:</span>
              <div className="text-xl font-black text-slate-100 mt-0.5 font-mono">
                {formatMoney(totalCommitmentInBase, baseCurrency)}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم سداده لشهر {selectedMonth}:</span>
              </span>
              <div className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
                {formatMoney(totalPaidInBase, baseCurrency)}
                <span className="text-xs font-normal text-slate-400 ml-1">({paidItems.length} من {fixedExpenses.length})</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>المتبقي المطلوب سداده:</span>
              </span>
              <div className="text-xl font-black text-amber-400 mt-0.5 font-mono">
                {formatMoney(totalUnpaidInBase, baseCurrency)}
                <span className="text-xs font-normal text-slate-400 ml-1">({unpaidItems.length} التزام)</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-[11px] font-bold mb-1">
              <span className="text-slate-400">نسبة إنجاز سداد الثوابت لهذا الشهر:</span>
              <span className="text-emerald-400 font-mono font-black">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* List of Fixed Commitments */}
      {fixedExpenses.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">لا توجد التزامات شهرية ثابتة مسجلة بعد</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            أضف التزاماتك الدورية (إيجار، كهرباء، باقة إنترنت، قسط سيارة، اشتراك نادي) لتتولى المنظومة تذكيرك وتوثيق سدادها شهرياً.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل أول التزام ثابت</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Section 1: Unpaid Commitments (Pending) */}
          {sortedUnpaid.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>التزامات بانتظار السداد ({sortedUnpaid.length}):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {sortedUnpaid.map((item) => {
                  const cat = catMap[item.categoryId] || { name: 'أخرى', icon: 'MoreHorizontal', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' };
                  const inBase = convertCurrency(item.amount, item.currency, baseCurrency, customRates);
                  const isNear = item.dueDay >= currentDay && item.dueDay <= currentDay + 5;

                  return (
                    <div
                      key={item.id}
                      className={`glass-card rounded-2xl p-4 border flex flex-col justify-between transition-all hover:-translate-y-1 ${
                        isNear
                          ? 'border-amber-500/40 bg-amber-950/10 shadow-lg shadow-amber-500/5'
                          : 'border-slate-800'
                      }`}
                    >
                      <div>
                        {/* Top: Category & Due Day */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                              style={{ backgroundColor: cat.bg }}
                            >
                              <CategoryIcon name={cat.icon} className="w-4 h-4" style={{ color: cat.color }} />
                            </div>
                            <span className="text-xs font-black text-slate-100 truncate">{item.title}</span>
                          </div>

                          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                            isNear ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}>
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            <span>يوم {item.dueDay}</span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="my-2">
                          <span className="text-xl font-black text-slate-100 font-mono">
                            {formatMoney(item.amount, item.currency)}
                          </span>
                          {item.currency !== baseCurrency && (
                            <span className="block text-[11px] font-bold text-slate-400 font-mono mt-0.5">
                              ≈ {formatMoney(inBase, baseCurrency)}
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-slate-400/80 italic mt-1 line-clamp-1">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditFixed(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                            title="تعديل الالتزام"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteFixed(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onPayFixed(item)}
                          className="flex items-center gap-1.5 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-xl shadow-md transition active:scale-95"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>تأكيد السداد الآن</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Paid Commitments */}
          {sortedPaid.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم سدادها بنجاح لهذا الشهر ({sortedPaid.length}):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {sortedPaid.map((item) => {
                  const cat = catMap[item.categoryId] || { name: 'أخرى', icon: 'MoreHorizontal', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' };
                  const inBase = convertCurrency(item.amount, item.currency, baseCurrency, customRates);

                  return (
                    <div
                      key={item.id}
                      className="glass-card rounded-2xl p-4 border border-emerald-500/25 bg-emerald-950/10 flex flex-col justify-between opacity-90"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: cat.bg }}
                            >
                              <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: cat.color }} />
                            </div>
                            <span className="text-xs font-extrabold text-slate-200 truncate">{item.title}</span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            تم السداد
                          </span>
                        </div>

                        <div className="my-1.5">
                          <span className="text-lg font-black text-slate-200 font-mono">
                            {formatMoney(item.amount, item.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-400/80 font-bold">
                        <span>مُدرج وموثق في مصروفات {selectedMonth}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditFixed(item)}
                            className="p-1 rounded text-slate-400 hover:text-slate-100 transition"
                            title="تعديل"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
