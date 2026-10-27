import React from 'react';
import {
  ShieldCheck, CheckCircle2, Clock, Plus, Trash2, Edit2,
  Calendar, ArrowUpRight, AlertCircle
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

  // Calculate totals
  const totalCommitmentInBase = fixedExpenses.reduce((sum, item) => {
    const inBase = convertCurrency(item.amount, item.currency, baseCurrency, customRates);
    return sum + inBase;
  }, 0);

  const paidItems = fixedExpenses.filter(item => item.paidMonths && item.paidMonths.includes(selectedMonth));
  const unpaidItems = fixedExpenses.filter(item => !item.paidMonths || !item.paidMonths.includes(selectedMonth));

  const totalPaidInBase = paidItems.reduce((sum, item) => {
    return sum + convertCurrency(item.amount, item.currency, baseCurrency, customRates);
  }, 0);

  const totalUnpaidInBase = totalCommitmentInBase - totalPaidInBase;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-5 border border-slate-800/80 no-print">
      
      {/* Top Banner & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-100">الثوابت والالتزامات الشهرية</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {fixedExpenses.length} التزام دوري
              </span>
            </div>
            <p className="text-xs text-slate-400">
              المصروفات الدورية الثابتة (إيجارات، فواتير، أقساط، اشتراكات) مع تتبع سدادها شهرياً
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة التزام ثابت جديد</span>
        </button>
      </div>

      {/* Mini Progress Card */}
      {fixedExpenses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-slate-400">إجمالي الالتزامات الشهرية:</span>
            <div className="text-base font-black text-slate-100 mt-0.5">
              {formatMoney(totalCommitmentInBase, baseCurrency)}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-400">تم سداده لشهر {selectedMonth}:</span>
            <div className="text-base font-black text-emerald-400 mt-0.5">
              {formatMoney(totalPaidInBase, baseCurrency)} ({paidItems.length})
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-400">المتبقي المطلوب سداده:</span>
            <div className="text-base font-black text-amber-400 mt-0.5">
              {formatMoney(totalUnpaidInBase, baseCurrency)} ({unpaidItems.length})
            </div>
          </div>
        </div>
      )}

      {/* List of Fixed Commitments */}
      {fixedExpenses.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">لا توجد التزامات شهرية ثابتة مسجلة بعد</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            أضف التزاماتك المتكررة مثل إيجار السكن، فواتير الاتصالات والكهرباء، أقساط القروض، أو اشتراكات البرامج لتتبعها بسهولة.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل أول التزام ثابت</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fixedExpenses.map((item) => {
            const cat = catMap[item.categoryId] || { name: 'أخرى', icon: 'MoreHorizontal', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' };
            const isPaidThisMonth = item.paidMonths && item.paidMonths.includes(selectedMonth);
            const inBase = convertCurrency(item.amount, item.currency, baseCurrency, customRates);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isPaidThisMonth
                    ? 'bg-emerald-950/20 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                    : 'bg-slate-900/70 border-slate-800 hover:border-indigo-500/30'
                }`}
              >
                <div>
                  {/* Top: Category & Due Day */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat.bg }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: cat.color }} />
                      </div>
                      <span className="text-xs font-bold text-slate-300 truncate">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      <span>يوم {item.dueDay || '1'}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-slate-100">
                        {formatMoney(item.amount, item.currency)}
                      </span>
                      {item.currency !== baseCurrency && (
                        <span className="block text-[11px] font-semibold text-slate-400">
                          ≈ {formatMoney(inBase, baseCurrency)}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPaidThisMonth ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم السداد ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          مستحق السداد
                        </span>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-1 italic">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditFixed(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      title="تعديل الالتزام الثابت"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteFixed(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="حذف الالتزام الثابت"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 1-Click Pay or Paid notification */}
                  {isPaidThisMonth ? (
                    <span className="text-[10px] text-emerald-400/80 font-bold">
                      مُدرج في مصروفات {selectedMonth}
                    </span>
                  ) : (
                    <button
                      onClick={() => onPayFixed(item)}
                      className="flex items-center gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl shadow-md transition active:scale-95"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>تأكيد السداد الآن</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
