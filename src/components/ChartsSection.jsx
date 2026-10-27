import React from 'react';
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { PieChart, BarChart3, Wallet } from 'lucide-react';
import { formatMoney, convertCurrency } from '../utils/currencyEngine';
import CategoryIcon from './CategoryIcon';

export default function ChartsSection({
  expenses,
  categories,
  baseCurrency,
  customRates,
  selectedMonth,
}) {
  if (!expenses || expenses.length === 0) return null;

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  // 1. Group by Category
  const catTotals = {};
  expenses.forEach(exp => {
    const inBase = convertCurrency(exp.amount, exp.currency, baseCurrency, customRates);
    catTotals[exp.categoryId] = (catTotals[exp.categoryId] || 0) + inBase;
  });

  const totalAll = Object.values(catTotals).reduce((a, b) => a + b, 0);

  const categoryData = Object.entries(catTotals).map(([catId, value]) => {
    const cat = catMap[catId] || { name: 'أخرى', color: '#94a3b8' };
    const percent = totalAll > 0 ? Math.round((value / totalAll) * 100) : 0;
    return {
      name: cat.name,
      value: Math.round(value * 100) / 100,
      color: cat.color,
      percent,
      icon: cat.icon,
    };
  }).sort((a, b) => b.value - a.value);

  // 2. Group by Day in Month for Bar Chart
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysCount = new Date(year, month, 0).getDate();

  const dailyTotals = Array.from({ length: daysCount }, (_, i) => ({
    day: `${i + 1}`,
    amount: 0,
  }));

  expenses.forEach(exp => {
    if (exp.date && exp.date.startsWith(selectedMonth)) {
      const dayNum = parseInt(exp.date.split('-')[2], 10);
      if (dayNum >= 1 && dayNum <= daysCount) {
        const inBase = convertCurrency(exp.amount, exp.currency, baseCurrency, customRates);
        dailyTotals[dayNum - 1].amount += inBase;
      }
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 no-print">
      
      {/* Category Breakdown Donut */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">توزيع المصروفات حسب الفئات</h3>
              <p className="text-[11px] text-slate-400">نسب الإنفاق لكل تصنيف خلال الشهر</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl text-right text-xs">
                          <span className="font-bold text-slate-200">{data.name}</span>
                          <div className="text-emerald-400 font-black mt-1">
                            {formatMoney(data.value, baseCurrency)} ({data.percent}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categoryData.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="font-bold text-slate-200 truncate">{item.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-300 ml-1.5">{item.percent}%</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{formatMoney(item.value, baseCurrency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Spending Bar Chart */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">مسار الصرف اليومي</h3>
              <p className="text-[11px] text-slate-400">حركة الإنفاق على مدار أيام شهر {selectedMonth}</p>
            </div>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTotals} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl text-right text-xs">
                        <span className="font-bold text-slate-400">يوم {data.day} من الشهر:</span>
                        <div className="text-cyan-400 font-black mt-1">
                          {formatMoney(data.amount, baseCurrency)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
