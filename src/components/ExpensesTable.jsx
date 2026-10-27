import React, { useState } from 'react';
import {
  Search, Filter, Trash2, Edit2, Calendar, CreditCard,
  Tag, ArrowUpDown, ChevronDown, Plus, Inbox
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
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const payMap = Object.fromEntries(PAYMENT_METHODS.map(p => [p.id, p]));

  // Filtering
  const filtered = expenses.filter(exp => {
    // Filter by month
    if (!exp.date || !exp.date.startsWith(selectedMonth)) return false;

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (exp.title || '').toLowerCase().includes(q);
      const matchNotes = (exp.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }

    // Filter by category
    if (selectedCategory !== 'all' && exp.categoryId !== selectedCategory) return false;

    // Filter by payment method
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

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800/80 space-y-4 no-print">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-100">سجل المصروفات اليومية</h2>
          <p className="text-xs text-slate-400">
            {sorted.length} عملية مسجلة لشهر {selectedMonth}
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مصروف جديد</span>
        </button>
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
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 outline-none transition"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition cursor-pointer appearance-none"
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
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition cursor-pointer appearance-none"
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
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition cursor-pointer appearance-none"
          >
            <option value="date-desc">التاريخ (الأحدث أولاً)</option>
            <option value="date-asc">التاريخ (الأقدم أولاً)</option>
            <option value="amount-desc">المبلغ (الأعلى أولاً)</option>
            <option value="amount-asc">المبلغ (الأقل أولاً)</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Table / List */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-300">لا توجد مصروفات مسجلة تطابق البحث لهذا الشهر</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {expenses.length === 0
              ? 'ابدأ بتسجيل أول مصروف لك هذا الشهر لتتبع إنفاقك والتحكم في ميزانيتك.'
              : 'جرب تغيير خيارات التصفية أو مسح كلمة البحث لرؤية العمليات.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف الآن</span>
          </button>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">بيان المصروف</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sorted.map((exp) => {
                  const cat = catMap[exp.categoryId] || { name: 'أخرى', icon: 'MoreHorizontal', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
                  const pay = payMap[exp.paymentMethod] || { name: 'أخرى', icon: 'CreditCard' };
                  const inBase = convertCurrency(exp.amount, exp.currency, baseCurrency, customRates);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                      
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono font-bold">
                        {exp.date}
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-100 text-sm">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-slate-400 italic line-clamp-1">{exp.notes}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{ backgroundColor: cat.bg, color: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: cat.color }} />
                          <span>{cat.name}</span>
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
                          <span>{pay.name}</span>
                        </span>
                      </td>

                      {/* Amount */}
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

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-850 transition"
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
