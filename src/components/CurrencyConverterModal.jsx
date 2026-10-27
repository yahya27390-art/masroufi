import React, { useState } from 'react';
import {
  X, ArrowRightLeft, RefreshCw, Check,
  Sparkles, Coins, DollarSign
} from 'lucide-react';
import { DEFAULT_CURRENCIES, convertCurrency, formatMoney, fetchLiveRates } from '../utils/currencyEngine';

export default function CurrencyConverterModal({
  isOpen,
  onClose,
  baseCurrency,
  onUpdateBaseCurrency,
  customRates,
  onUpdateRates,
}) {
  const [calcAmount, setCalcAmount] = useState('100');
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState(baseCurrency);
  const [isUpdatingLive, setIsUpdatingLive] = useState(false);
  const [notice, setNotice] = useState('');
  const [editingRates, setEditingRates] = useState({ ...customRates });

  if (!isOpen) return null;

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  // Convert calculation
  const amountNum = parseFloat(calcAmount) || 0;
  const result = convertCurrency(amountNum, fromCode, toCode, editingRates);

  // Live update
  const handleFetchLive = async () => {
    setIsUpdatingLive(true);
    setNotice('');
    const res = await fetchLiveRates();
    setIsUpdatingLive(false);
    if (res.success && res.rates) {
      setEditingRates(prev => ({ ...prev, ...res.rates }));
      onUpdateRates({ ...customRates, ...res.rates });
      setNotice('✓ تم تحديث أسعار الصرف المباشرة بنجاح.');
    } else {
      setNotice('⚠️ تعذر جلب الأسعار المباشرة؛ تم الإبقاء على الأسعار المحفوظة.');
    }
  };

  // Save customized rates
  const handleSaveRates = () => {
    onUpdateRates(editingRates);
    setNotice('✓ تم حفظ أسعار الصرف المعتمدة للنظام بنجاح.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100">محول ومسعر العملات</h2>
              <p className="text-[11px] text-slate-400">حاسبة سريعة وإدارة أسعار الصرف في النظام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {notice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-in fade-in">
              {notice}
            </div>
          )}

          {/* 1. Quick Converter Section */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الحاسبة الفورية للتحويل بين العملات:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
              {/* Amount & From */}
              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="المبلغ"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-bold text-slate-100 outline-none"
                />
                <select
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-200 outline-none cursor-pointer"
                >
                  {DEFAULT_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 transition shadow-sm active:scale-95"
                  title="تبديل العملات"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* To Currency */}
              <div className="sm:col-span-2">
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm font-black text-emerald-400 truncate">
                  {formatMoney(result, toCode)}
                </div>
                <select
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-200 outline-none cursor-pointer"
                >
                  {DEFAULT_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. System Base Currency Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-300">العملة الأساسية للنظام (Base Currency):</span>
              <p className="text-[11px] text-slate-400 mt-0.5">تُعرض الإحصائيات والمجاميع والميزانية بهذه العملة</p>
            </div>
            <select
              value={baseCurrency}
              onChange={(e) => onUpdateBaseCurrency(e.target.value)}
              className="bg-slate-900 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              {DEFAULT_CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Exchange Rates Table & Live Update */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-300">أسعار الصرف المعتمدة (مقابل الريال السعودي SAR):</span>
                <p className="text-[10px] text-slate-500">يمكنك تعديل أي سعر يدوياً أو تحديثها بالكامل من الإنترنت</p>
              </div>

              <button
                type="button"
                onClick={handleFetchLive}
                disabled={isUpdatingLive}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingLive ? 'animate-spin' : ''}`} />
                <span>تحديث الأسعار آلياً</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">العملة</th>
                    <th className="py-2.5 px-3">الرمز</th>
                    <th className="py-2.5 px-3">سعر الصرف (1 وحدة = X ر.س)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {DEFAULT_CURRENCIES.map(c => {
                    const currentRate = editingRates[c.code] !== undefined ? editingRates[c.code] : c.rateToSAR;
                    const isBase = c.code === 'SAR';

                    return (
                      <tr key={c.code} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span className="font-bold text-slate-200">{c.name}</span>
                          <span className="text-[10px] text-slate-400">({c.code})</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-300">{c.symbol}</td>
                        <td className="py-2 px-3">
                          {isBase ? (
                            <span className="text-emerald-400 font-bold">1.00 (الأساس)</span>
                          ) : (
                            <input
                              type="number"
                              step="any"
                              value={currentRate}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEditingRates(prev => ({ ...prev, [c.code]: val }));
                              }}
                              className="w-24 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-100 outline-none"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveRates}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow-md active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التعديلات في أسعار الصرف</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
