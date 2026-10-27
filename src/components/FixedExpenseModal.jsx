import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Calendar, Tag, FileText } from 'lucide-react';
import { DEFAULT_CURRENCIES, convertCurrency, formatMoney } from '../utils/currencyEngine';
import { PAYMENT_METHODS } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function FixedExpenseModal({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  categories,
  baseCurrency,
  customRates,
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [categoryId, setCategoryId] = useState('housing');
  const [dueDay, setDueDay] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setAmount(String(itemToEdit.amount || ''));
      setCurrency(itemToEdit.currency || baseCurrency);
      setCategoryId(itemToEdit.categoryId || 'housing');
      setDueDay(String(itemToEdit.dueDay || '1'));
      setPaymentMethod(itemToEdit.paymentMethod || 'card');
      setNotes(itemToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCurrency(baseCurrency);
      setCategoryId('housing');
      setDueDay('1');
      setPaymentMethod('card');
      setNotes('');
    }
    setError('');
  }, [isOpen, itemToEdit, baseCurrency]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى كتابة اسم الالتزام الثابت');
      return;
    }
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    const day = parseInt(dueDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      setError('يرجى تحديد يوم استحقاق صالح (بين 1 و 31)');
      return;
    }

    onSave({
      id: itemToEdit?.id || `fixed_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      amount: num,
      currency,
      categoryId,
      dueDay: day,
      paymentMethod,
      notes: notes.trim(),
      paidMonths: itemToEdit?.paidMonths || [],
      createdAt: itemToEdit?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  const numAmount = parseFloat(amount) || 0;
  const inBaseCurrency = currency !== baseCurrency ? convertCurrency(numAmount, currency, baseCurrency, customRates) : numAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-100">
              {itemToEdit ? 'تعديل الالتزام الثابت' : 'إضافة التزام شهري ثابت'}
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
            <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الالتزام *</label>
            <input
              type="text"
              required
              placeholder="مثال: إيجار الشقة، فاتورة الكهرباء، قسط السيارة، نتفلكس..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition"
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">المبلغ الشهري *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-100 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">العملة</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-100 outline-none transition cursor-pointer"
              >
                {DEFAULT_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Converted value */}
          {currency !== baseCurrency && numAmount > 0 && (
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
              <span>القيمة المعادلة بالعملة الأساسية:</span>
              <span className="font-extrabold text-sm">{formatMoney(inBaseCurrency, baseCurrency)}</span>
            </div>
          )}

          {/* Due Day & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>يوم الاستحقاق شهرياً (1 - 31) *</span>
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>التصنيف</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-100 outline-none transition cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">طريقة السداد المتوقعة</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 outline-none transition cursor-pointer"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>ملاحظات (اختياري)</span>
            </label>
            <textarea
              rows={2}
              placeholder="رقم الحساب، رقم العقد، رابط الفاتورة أو أي تفاصيل..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-100 outline-none transition resize-none"
            />
          </div>

          {/* Submit */}
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
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{itemToEdit ? 'حفظ التعديلات' : 'إضافة الالتزام'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
