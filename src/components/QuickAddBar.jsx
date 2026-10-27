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
      className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print"
    >
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-black text-slate-200">تسجيل فوري سريع:</span>
      </div>

      {/* Input Title */}
      <div className="flex-1 min-w-[160px]">
        <input
          type="text"
          placeholder="بيان المصروف (قهوة، بنزين، غداء...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none transition"
        />
      </div>

      {/* Input Amount */}
      <div className="w-28 shrink-0">
        <div className="relative">
          <input
            type="number"
            step="any"
            min="0.01"
            placeholder="المبلغ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none transition font-mono"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold pointer-events-none">
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition shrink-0 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <CategoryIcon name={cat.icon} className="w-3 h-3" style={{ color: isSelected ? '#ffffff' : cat.color }} />
              <span>{cat.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!title.trim() || !amount}
        className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-md active:scale-95 shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>إضافة</span>
      </button>
    </form>
  );
}
