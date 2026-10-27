// Export & Reports Engine for Masroufi
import * as XLSX from 'xlsx';

/**
 * Sanitize cell to prevent Formula Injection in spreadsheets
 */
export function sanitizeCellValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // If starts with dangerous spreadsheet formula triggers, prepend apostrophe
  if (/^[\s\u0000-\u001f]*[=+@\-]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Export expenses list to Excel (.xlsx) file
 */
export function exportExpensesToExcel(expenses, categories, baseCurrency, monthStr) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const rows = expenses.map((exp, index) => ({
    '#': index + 1,
    'التاريخ': sanitizeCellValue(exp.date),
    'بيان المصروف': sanitizeCellValue(exp.title),
    'التصنيف': sanitizeCellValue(catMap[exp.categoryId] || exp.categoryId),
    'المبلغ': Number(exp.amount) || 0,
    'العملة': sanitizeCellValue(exp.currency),
    'طريقة الدفع': sanitizeCellValue(
      exp.paymentMethod === 'card' ? 'بطاقة بنكية' :
      exp.paymentMethod === 'cash' ? 'نقدي (كاش)' :
      exp.paymentMethod === 'transfer' ? 'تحويل بنكي' :
      exp.paymentMethod === 'wallet' ? 'محفظة رقمية' : exp.paymentMethod
    ),
    'ملاحظات': sanitizeCellValue(exp.notes || ''),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'المصروفات');

  // Trigger download
  const filename = `مصروفي_${monthStr || 'شامل'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Export full application data backup as JSON
 */
export function exportFullBackupJSON(data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `masroufi_backup_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Read and restore full data backup from a JSON file
 */
export function readBackupJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || !Array.isArray(parsed.expenses)) {
          throw new Error('ملف النسخة الاحتياطية غير صالح أو تالف.');
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error('فشل قراءة الملف: تأكد من اختيار ملف JSON صالح لتطبيق مصروفي.'));
      }
    };
    reader.onerror = () => reject(new Error('خطأ أثناء قراءة الملف.'));
    reader.readAsText(file);
  });
}
