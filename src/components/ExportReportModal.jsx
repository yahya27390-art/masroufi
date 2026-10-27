import React, { useRef, useState } from 'react';
import {
  X, FileSpreadsheet, Printer, Download, Upload,
  ShieldCheck, Check, AlertCircle, FileText
} from 'lucide-react';
import { exportExpensesToExcel, exportFullBackupJSON, readBackupJSON } from '../utils/exportEngine';

export default function ExportReportModal({
  isOpen,
  onClose,
  expenses,
  fixedExpenses,
  categories,
  baseCurrency,
  selectedMonth,
  onRestoreBackup,
  onTriggerPrint,
}) {
  const fileInputRef = useRef(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  if (!isOpen) return null;

  // Monthly filtered expenses
  const monthExpenses = expenses.filter(e => e.date && e.date.startsWith(selectedMonth));

  const handleExportExcel = (all = false) => {
    try {
      const dataToExport = all ? expenses : monthExpenses;
      if (dataToExport.length === 0) {
        setMsg({ text: 'لا توجد بيانات لتصديرها في الفترة المختارة.', type: 'error' });
        return;
      }
      exportExpensesToExcel(dataToExport, categories, baseCurrency, all ? 'شامل' : selectedMonth);
      setMsg({ text: '✓ تم تصدير ملف الإكسيل بنجاح.', type: 'success' });
    } catch (err) {
      setMsg({ text: `فشل التصدير: ${err.message}`, type: 'error' });
    }
  };

  const handleBackup = () => {
    try {
      exportFullBackupJSON({
        version: 1,
        exportedAt: new Date().toISOString(),
        expenses,
        fixedExpenses,
        categories,
        baseCurrency,
      });
      setMsg({ text: '✓ تم تنزيل النسخة الاحتياطية الكاملة (JSON) بنجاح.', type: 'success' });
    } catch (err) {
      setMsg({ text: `فشل إنشاء النسخة: ${err.message}`, type: 'error' });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await readBackupJSON(file);
      if (window.confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم تحديث السجلات الحالية بالبيانات المستوردة.')) {
        onRestoreBackup(parsed);
        setMsg({ text: '✓ تمت استعادة النسخة الاحتياطية بنجاح!', type: 'success' });
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100">التقارير والتصدير والنسخ الاحتياطي</h2>
              <p className="text-[11px] text-slate-400">تصدير إكسيل، طباعة A4، وحفظ بياناتك بأمان</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {msg.text && (
            <div
              className={`p-3 rounded-xl text-xs font-bold border ${
                msg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* 1. Excel Export */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير كشف المصروفات إلى Excel (.xlsx):</span>
            </div>
            <p className="text-[11px] text-slate-400">
              تصدير جدول منظم يحتوي على التاريخ، التصنيف، طريقة الدفع، الملاحظات والمبالغ مع حماية كاملة ضد الاختراق.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleExportExcel(false)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير مصروفات شهر {selectedMonth} ({monthExpenses.length})</span>
              </button>
              <button
                onClick={() => handleExportExcel(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition"
              >
                <span>تصدير كافة السجلات التاريخية ({expenses.length})</span>
              </button>
            </div>
          </div>

          {/* 2. Print Official Statement */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
              <Printer className="w-4 h-4" />
              <span>طباعة كشف مالي رسمي A4:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              تجهيز وطباعة تقرير أنيق بتنسيق A4 لشهر {selectedMonth} يشمل ملخص الإجماليات والثوابت وقائمة المصروفات.
            </p>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => onTriggerPrint(), 250);
              }}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة وطباعة تقرير شهر {selectedMonth}</span>
            </button>
          </div>

          {/* 3. Full Backup & Restore */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>النسخ الاحتياطي ونقل البيانات (Backup & Restore):</span>
            </div>
            <p className="text-[11px] text-slate-400">
              احفظ نسخة آمنة من كافة مصروفاتك وثوابتك وإعداداتك، أو استعد بياناتك على أي جهاز آخر.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleBackup}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>حفظ نسخة احتياطية (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>استعادة نسخة احتياطية</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
