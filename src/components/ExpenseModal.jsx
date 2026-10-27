import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import { DEFAULT_CURRENCIES, convertCurrency, formatMoney } from '../utils/currencyEngine';
import { PAYMENT_METHODS } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
  categories,
  baseCurrency,
  customRates,
  selectedMonth,
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [categoryId, setCategoryId] = useState('food');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title || '');
      setAmount(String(expenseToEdit.amount || ''));
      setCurrency(expenseToEdit.currency || baseCurrency);
      setCategoryId(expenseToEdit.categoryId || 'food');
      setDate(expenseToEdit.date || '');
      setPaymentMethod(expenseToEdit.paymentMethod || 'card');
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCurrency(baseCurrency);
      setCategoryId(categories[0]?.id || 'food');
      // Set default date to today, or first day of selected month if different
      const today = new Date().toISOString().slice(0, 10);
      if (today.startsWith(selectedMonth)) {
        setDate(today);
      } else {
        setDate(`${selectedMonth}-01`);
      }
      setPaymentMethod('card');
      setNotes('');
    }
    setError('');
  }, [isOpen, expenseToEdit, baseCurrency, categories, selectedMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى كتابة بيان المصروف');
      return;
    }
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!date) {
      setError('يرجى تحديد تاريخ المصروف');
      return;
    }

    onSave({
      id: expenseToEdit?.id || `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      amount: num,
      currency,
      categoryId,
      date,
      paymentMethod,
      notes: notes.trim(),
      createdAt: expenseToEdit?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  // Converted value in base currency for preview
  const numAmount = parseFloat(amount) || 0;
  const inBaseCurrency = currency !== baseCurrency ? convertCurrency(numAmount, currency, baseCurrency, customRates) : numAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-100">
              {expenseToEdit ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">بيان المصروف *</label>
            <input
              type="text"
              required
              placeholder="مثال: مشتريات البقالة، بنزين، كشف طبي، فاتورة..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition"
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">المبلغ *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-100 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">العملة</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-100 outline-none transition cursor-pointer"
              >
                {DEFAULT_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Currency conversion notice if foreign */}
          {currency !== baseCurrency && numAmount > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
              <span>القيمة المعادلة بالعملة الأساسية:</span>
              <span className="font-extrabold text-sm">{formatMoney(inBaseCurrency, baseCurrency)}</span>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>التصنيف *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition text-right ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cat.bg }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: isSelected ? '#ffffff' : cat.color }} />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>التاريخ *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>طريقة الدفع</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none transition cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>ملاحظات إضافية (اختياري)</span>
            </label>
            <textarea
              rows={2}
              placeholder="أي تفاصيل تخص الفاتورة أو المتجر..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-xs text-slate-100 outline-none transition resize-none"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{expenseToEdit ? 'حفظ التعديلات' : 'تسجيل المصروف'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
