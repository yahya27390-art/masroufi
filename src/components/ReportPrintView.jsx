import React from 'react';
import { Printer, X, Wallet, ShieldCheck } from 'lucide-react';
import { formatMoney, convertCurrency } from '../utils/currencyEngine';

export default function ReportPrintView({
  selectedMonth,
  expenses,
  fixedExpenses,
  categories,
  baseCurrency,
  customRates,
  budget,
  onClose,
}) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const monthExpenses = expenses.filter(e => e.date && e.date.startsWith(selectedMonth));

  const totalExpensesInBase = monthExpenses.reduce((sum, e) => {
    return sum + convertCurrency(e.amount, e.currency, baseCurrency, customRates);
  }, 0);

  const totalFixedInBase = fixedExpenses.reduce((sum, f) => {
    return sum + convertCurrency(f.amount, f.currency, baseCurrency, customRates);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 overflow-y-auto p-6 sm:p-10 font-sans print:p-0 print:m-0" dir="rtl">
      
      {/* Floating control bar (hidden on paper) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">معاينة التقرير المالي قبل الطباعة</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الآن (Ctrl + P)</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 py-2 rounded-xl transition"
          >
            <X className="w-4 h-4" />
            <span>إغلاق</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-4xl mx-auto border border-slate-300 p-8 sm:p-10 rounded-2xl print:border-none print:p-0 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-950">كشف المصروفات والالتزامات الشهرية</h1>
            <p className="text-sm text-slate-600 font-bold mt-1">
              تقرير دورة شهر: <span className="text-emerald-700 font-black">{selectedMonth}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-lg font-black text-slate-900">مصروفي · Masroufi</div>
              <p className="text-xs text-slate-500">تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            <img src="/logo.png" alt="مصروفي" className="w-12 h-12 object-contain rounded-xl border border-slate-200 p-0.5" />
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-right">
            <span className="text-xs font-bold text-slate-600">إجمالي المصروفات:</span>
            <div className="text-lg font-black text-slate-900 mt-1">
              {formatMoney(totalExpensesInBase, baseCurrency)}
            </div>
            <span className="text-[10px] text-slate-500">عدد العمليات: {monthExpenses.length}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-right">
            <span className="text-xs font-bold text-slate-600">إجمالي الثوابت الشهرية:</span>
            <div className="text-lg font-black text-indigo-900 mt-1">
              {formatMoney(totalFixedInBase, baseCurrency)}
            </div>
            <span className="text-[10px] text-slate-500">عدد الالتزامات: {fixedExpenses.length}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-right">
            <span className="text-xs font-bold text-slate-600">الميزانية المستهدفة:</span>
            <div className="text-lg font-black text-slate-900 mt-1">
              {budget > 0 ? formatMoney(budget, baseCurrency) : 'غير محددة'}
            </div>
            {budget > 0 && (
              <span className={`text-[10px] font-bold ${totalExpensesInBase > budget ? 'text-rose-600' : 'text-emerald-700'}`}>
                {totalExpensesInBase > budget ? 'تجاوز للميزانية' : 'ضمن حدود الميزانية'}
              </span>
            )}
          </div>
        </div>

        {/* Fixed Commitments Table if any */}
        {fixedExpenses.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              1. جدول الالتزامات والثوابت الدورية
            </h3>
            <table className="w-full text-right text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-300">
                  <th className="p-2 border-l border-slate-300">الالتزام</th>
                  <th className="p-2 border-l border-slate-300">يوم الاستحقاق</th>
                  <th className="p-2 border-l border-slate-300">التصنيف</th>
                  <th className="p-2 border-l border-slate-300">المبلغ</th>
                  <th className="p-2">حالة السداد</th>
                </tr>
              </thead>
              <tbody>
                {fixedExpenses.map((item, idx) => {
                  const isPaid = item.paidMonths && item.paidMonths.includes(selectedMonth);
                  return (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-2 font-bold border-l border-slate-300">{item.title}</td>
                      <td className="p-2 border-l border-slate-300">يوم {item.dueDay}</td>
                      <td className="p-2 border-l border-slate-300">{catMap[item.categoryId] || item.categoryId}</td>
                      <td className="p-2 font-mono font-bold border-l border-slate-300">{formatMoney(item.amount, item.currency)}</td>
                      <td className="p-2 font-bold">
                        {isPaid ? <span className="text-emerald-700 font-bold">تم السداد ✓</span> : <span className="text-amber-700">بانتظار السداد</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed Expenses Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            2. كشف العمليات والمصروفات المسجلة
          </h3>
          {monthExpenses.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 border rounded-lg bg-slate-50">
              لا توجد مصروفات مسجلة خلال هذا الشهر.
            </p>
          ) : (
            <table className="w-full text-right text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-300">
                  <th className="p-2 border-l border-slate-300">#</th>
                  <th className="p-2 border-l border-slate-300">التاريخ</th>
                  <th className="p-2 border-l border-slate-300">بيان المصروف</th>
                  <th className="p-2 border-l border-slate-300">التصنيف</th>
                  <th className="p-2 border-l border-slate-300">طريقة الدفع</th>
                  <th className="p-2 border-l border-slate-300">المبلغ</th>
                  <th className="p-2">الملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {monthExpenses.map((exp, idx) => {
                  const inBase = convertCurrency(exp.amount, exp.currency, baseCurrency, customRates);
                  return (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-2 font-mono border-l border-slate-300">{idx + 1}</td>
                      <td className="p-2 font-mono font-bold border-l border-slate-300">{exp.date}</td>
                      <td className="p-2 font-bold border-l border-slate-300">{exp.title}</td>
                      <td className="p-2 border-l border-slate-300">{catMap[exp.categoryId] || exp.categoryId}</td>
                      <td className="p-2 border-l border-slate-300">
                        {exp.paymentMethod === 'card' ? 'بطاقة بنكية' :
                         exp.paymentMethod === 'cash' ? 'نقدي (كاش)' :
                         exp.paymentMethod === 'transfer' ? 'تحويل بنكي' : 'محفظة رقمية'}
                      </td>
                      <td className="p-2 font-mono font-black border-l border-slate-300">
                        {formatMoney(exp.amount, exp.currency)}
                        {exp.currency !== baseCurrency && (
                          <span className="block text-[10px] text-slate-500 font-normal">
                            ({formatMoney(inBase, baseCurrency)})
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-slate-600 text-[11px]">{exp.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-300 flex justify-between text-xs text-slate-500">
          <span>تم استخراج هذا التقرير آلياً عبر نظام مصروفي</span>
          <span>صفحة 1 من 1</span>
        </div>

      </div>

    </div>
  );
}
