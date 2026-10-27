import React, { useState } from 'react';
import { Plus, Zap, Check } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function QuickAddBar({
  categories,
  baseCurrency,
  selectedMonth,
  onQuickAdd,
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('food');

  const popularCats = categories.slice(0, 5);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || !Number.isFinite(num) || num <= 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const dateToUse = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;

    onQuickAdd({
      id: `exp_quick_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      amount: num,
      currency: baseCurrency,
      categoryId,
      date: dateToUse,
      paymentMethod: 'card',
      notes: 'تسجيل سريع',
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setAmount('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel card-shine rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md hover:shadow-xl transition-all duration-300 no-print"
    >
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
          <Zap className="w-4 h-4 animate-bounce" style={{ animationDuration: '2s' }} />
        </div>
        <span className="text-xs font-black text-slate-800 dark:text-slate-200">تسجيل فوري سريع:</span>
      </div>

      {/* Input Title */}
      <div className="flex-1 min-w-[160px]">
        <input
          type="text"
          placeholder="بيان المصروف (قهوة، بنزين، غداء...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition shadow-inner"
        />
      </div>

      {/* Input Amount */}
      <div className="w-32 shrink-0">
        <div className="relative">
          <input
            type="number"
            step="any"
            min="0.01"
            placeholder="المبلغ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition font-mono shadow-inner"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold pointer-events-none">
            {baseCurrency}
          </span>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {popularCats.map((cat) => {
          const isSelected = categoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 shrink-0 hover:scale-105 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: isSelected ? '#ffffff' : cat.color }} />
              <span>{cat.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!title.trim() || !amount}
        className="btn-shimmer btn-interactive flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/30 shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>إضافة</span>
      </button>
    </form>
  );
}
