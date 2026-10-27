import React, { useState } from 'react';
import {
  Search, Filter, Trash2, Edit2, Calendar, CreditCard,
  Tag, ArrowUpDown, ChevronDown, Plus, Inbox,
  LayoutGrid, List, Sparkles, Receipt
} from 'lucide-react';
import { formatMoney, convertCurrency } from '../utils/currencyEngine';
import { PAYMENT_METHODS } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function ExpensesTable({
  expenses,
  categories,
  baseCurrency,
  customRates,
  selectedMonth,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (Revolut style) or 'table'

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const payMap = Object.fromEntries(PAYMENT_METHODS.map(p => [p.id, p]));

  // Filtering
  const filtered = expenses.filter(exp => {
    if (!exp.date || !exp.date.startsWith(selectedMonth)) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (exp.title || '').toLowerCase().includes(q);
      const matchNotes = (exp.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }

    if (selectedCategory !== 'all' && exp.categoryId !== selectedCategory) return false;
    if (selectedPayment !== 'all' && exp.paymentMethod !== selectedPayment) return false;

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
    if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
    const amountA = convertCurrency(a.amount, a.currency, baseCurrency, customRates);
    const amountB = convertCurrency(b.amount, b.currency, baseCurrency, customRates);
    if (sortBy === 'amount-desc') return amountB - amountA;
    if (sortBy === 'amount-asc') return amountA - amountB;
    return 0;
  });

  // Group by Date for modern stream view
  const groupedByDate = {};
  sorted.forEach(exp => {
    const d = exp.date;
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(exp);
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const getDateLabel = (dateStr) => {
    if (dateStr === todayStr) return 'اليوم';
    if (dateStr === yesterdayStr) return 'أمس';
    return dateStr;
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800/80 space-y-5 no-print">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100">سجل المصروفات المباشر</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {sorted.length} عملية مسجلة
              </span>
            </div>
            <p className="text-xs text-slate-400">
              كشف تفصيلي لكافة المشتريات والمصروفات لشهر {selectedMonth}
            </p>
          </div>
        </div>

        {/* View Switcher & Add Button */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="عرض البطاقات المصرفية"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">بطاقات</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="عرض الجدول المالي"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">جدول</span>
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالبيان أو الملاحظات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 outline-none transition"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition cursor-pointer appearance-none"
          >
            <option value="all">كافة التصنيفات</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Payment Filter */}
        <div className="relative">
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition cursor-pointer appearance-none"
          >
            <option value="all">كافة طرق الدفع</option>
            {PAYMENT_METHODS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition cursor-pointer appearance-none"
          >
            <option value="date-desc">التاريخ (الأحدث أولاً)</option>
            <option value="date-asc">التاريخ (الأقدم أولاً)</option>
            <option value="amount-desc">المبلغ (الأعلى أولاً)</option>
            <option value="amount-asc">المبلغ (الأقل أولاً)</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Empty State */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">لا توجد مصروفات مسجلة تطابق التصفية</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {expenses.length === 0
              ? 'سجّل أول مصروفاتك لتبدأ لوحة التحكم بالعمل وتحليل استهلاكك المالي.'
              : 'جرب تعديل خيارات التصفية أو مسح عبارة البحث لرؤية العمليات المسجلة.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* 1. Modern Banking Stream Cards View */
        <div className="space-y-5">
          {Object.entries(groupedByDate).map(([dateStr, items]) => {
            const dayTotal = items.reduce((sum, item) => {
              return sum + convertCurrency(item.amount, item.currency, baseCurrency, customRates);
            }, 0);

            return (
              <div key={dateStr} className="space-y-2">
                {/* Day Header Divider */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-200 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                      {getDateLabel(dateStr)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{dateStr}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-400 text-[11px]">
                    مجموع اليوم: <span className="text-emerald-400 font-black">{formatMoney(dayTotal, baseCurrency)}</span>
                  </span>
                </div>

                {/* Cards in this day */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {items.map((exp) => {
                    const cat = catMap[exp.categoryId] || { name: 'أخرى', icon: 'MoreHorizontal', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
                    const pay = payMap[exp.paymentMethod] || { name: 'أخرى', icon: 'CreditCard' };
                    const inBase = convertCurrency(exp.amount, exp.currency, baseCurrency, customRates);

                    return (
                      <div
                        key={exp.id}
                        className="glass-card rounded-2xl p-3.5 border border-slate-800/80 flex items-center justify-between gap-3 group"
                      >
                        {/* Icon & Title */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                            style={{ backgroundColor: cat.bg }}
                          >
                            <CategoryIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-slate-100 truncate group-hover:text-emerald-300 transition">
                              {exp.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {pay.name}
                              </span>
                            </div>
                            {exp.notes && (
                              <p className="text-[10px] text-slate-400/80 italic mt-0.5 truncate">
                                {exp.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-left font-mono">
                            <div className="text-sm font-black text-slate-100">
                              -{formatMoney(exp.amount, exp.currency)}
                            </div>
                            {exp.currency !== baseCurrency && (
                              <div className="text-[10px] font-bold text-emerald-400">
                                ≈ {formatMoney(inBase, baseCurrency)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onEditExpense(exp)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteExpense(exp.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* 2. Dense Financial Table View */
        <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">بيان المصروف</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {sorted.map((exp) => {
                  const cat = catMap[exp.categoryId] || { name: 'أخرى', icon: 'MoreHorizontal', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
                  const pay = payMap[exp.paymentMethod] || { name: 'أخرى', icon: 'CreditCard' };
                  const inBase = convertCurrency(exp.amount, exp.currency, baseCurrency, customRates);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono font-bold">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-100 text-sm">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-slate-400 italic line-clamp-1">{exp.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{ backgroundColor: cat.bg, color: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: cat.color }} />
                          <span>{cat.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        {pay.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <div className="font-black text-slate-100 text-sm">
                          {formatMoney(exp.amount, exp.currency)}
                        </div>
                        {exp.currency !== baseCurrency && (
                          <div className="text-[10px] font-bold text-emerald-400">
                            ≈ {formatMoney(inBase, baseCurrency)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
