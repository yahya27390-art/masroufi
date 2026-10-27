import React, { useState, useEffect } from 'react';
import { X, Check, Target, AlertCircle } from 'lucide-react';
import { formatMoney } from '../utils/currencyEngine';

export default function BudgetModal({
  isOpen,
  onClose,
  currentBudget,
  onSaveBudget,
  baseCurrency,
  selectedMonth,
}) {
  const [budgetVal, setBudgetVal] = useState('');

  useEffect(() => {
    setBudgetVal(currentBudget > 0 ? String(currentBudget) : '');
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(budgetVal);
    onSaveBudget(Number.isFinite(num) && num > 0 ? num : 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100">الميزانية الشهرية</h2>
              <p className="text-[11px] text-slate-400">سقف الإنفاق المستهدف لشهر {selectedMonth}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              مبلغ الميزانية التقديرية بالـ ({baseCurrency})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="مثال: 5000"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-3 text-lg font-black text-slate-100 outline-none transition"
            />
            <p className="text-[11px] text-slate-400 mt-2">
              اترك الحقل فارغاً أو صفر إذا كنت لا ترغب في تحديد سقف مالي محدد.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2.5">
            {currentBudget > 0 && (
              <button
                type="button"
                onClick={() => {
                  onSaveBudget(0);
                  onClose();
                }}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 transition"
              >
                إلغاء الميزانية
              </button>
            )}
            <div className="flex items-center gap-2 mr-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-600/25 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>حفظ الميزانية</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
