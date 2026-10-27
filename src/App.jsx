import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroCard from './components/HeroCard';
import StatCards from './components/StatCards';
import QuickAddBar from './components/QuickAddBar';
import SmartInsights from './components/SmartInsights';
import ChartsSection from './components/ChartsSection';
import ExpensesTable from './components/ExpensesTable';
import FixedExpensesView from './components/FixedExpensesView';
import ExpenseModal from './components/ExpenseModal';
import FixedExpenseModal from './components/FixedExpenseModal';
import CurrencyConverterModal from './components/CurrencyConverterModal';
import BudgetModal from './components/BudgetModal';
import ExportReportModal from './components/ExportReportModal';
import ReportPrintView from './components/ReportPrintView';
import AuthScreen from './components/AuthScreen';
import { loadAppData, saveAppData } from './utils/storage';
import { convertCurrency } from './utils/currencyEngine';
import { getCurrentSession, logoutUser } from './utils/auth';
import {
  LayoutDashboard, ShieldCheck, PieChart, Sparkles,
  Receipt, Wallet
} from 'lucide-react';

export default function App() {
  const [userSession, setUserSession] = useState(() => getCurrentSession());
  const [data, setData] = useState(() => loadAppData(userSession?.userId, userSession?.email));
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'fixed', 'analytics'
  
  // Theme state with localStorage persistence
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('masroufi_theme');
    return saved ? saved === 'dark' : true;
  });

  // Reload user-isolated data when session changes
  useEffect(() => {
    if (userSession?.userId) {
      setData(loadAppData(userSession.userId, userSession.email));
    }
  }, [userSession?.userId, userSession?.email]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('masroufi_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [fixedToEdit, setFixedToEdit] = useState(null);

  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  // Persist data scoped strictly to current active user
  const updateData = (updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveAppData(next, userSession?.userId);
      return next;
    });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Toggle dark/light class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDark]);

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج من حسابك؟')) {
      logoutUser();
      setUserSession(null);
      showToast('✓ تم تسجيل الخروج بنجاح');
    }
  };

  const baseCurrency = data.baseCurrency || 'SAR';
  const customRates = data.currencyRates || {};

  const currentMonthExpenses = useMemo(() => {
    return data.expenses.filter(e => e.date && e.date.startsWith(selectedMonth));
  }, [data.expenses, selectedMonth]);

  const totalExpensesInBase = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => {
      return sum + convertCurrency(e.amount, e.currency, baseCurrency, customRates);
    }, 0);
  }, [currentMonthExpenses, baseCurrency, customRates]);

  const totalFixedInBase = useMemo(() => {
    return data.fixedExpenses.reduce((sum, f) => {
      return sum + convertCurrency(f.amount, f.currency, baseCurrency, customRates);
    }, 0);
  }, [data.fixedExpenses, baseCurrency, customRates]);

  const fixedPaidCount = useMemo(() => {
    return data.fixedExpenses.filter(f => f.paidMonths && f.paidMonths.includes(selectedMonth)).length;
  }, [data.fixedExpenses, selectedMonth]);

  // Days in month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const now = new Date();
  const isCurrentMonth = now.toISOString().slice(0, 7) === selectedMonth;
  const currentDay = isCurrentMonth ? now.getDate() : daysInMonth;
  const dailyAverage = currentDay > 0 ? totalExpensesInBase / currentDay : 0;

  // Handlers for Expenses
  const handleSaveExpense = (expense) => {
    updateData(prev => {
      const exists = prev.expenses.some(e => e.id === expense.id);
      const nextExpenses = exists
        ? prev.expenses.map(e => e.id === expense.id ? expense : e)
        : [expense, ...prev.expenses];
      return { ...prev, expenses: nextExpenses };
    });
    showToast(expenseToEdit ? '✓ تم تحديث المصروف بنجاح' : '✓ تم تسجيل المصروف الجديد بنجاح');
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      updateData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id),
      }));
      showToast('✓ تم حذف المصروف بنجاح');
    }
  };

  // Handlers for Fixed Expenses
  const handleSaveFixed = (item) => {
    updateData(prev => {
      const exists = prev.fixedExpenses.some(f => f.id === item.id);
      const nextFixed = exists
        ? prev.fixedExpenses.map(f => f.id === item.id ? item : f)
        : [item, ...prev.fixedExpenses];
      return { ...prev, fixedExpenses: nextFixed };
    });
    showToast(fixedToEdit ? '✓ تم تحديث الالتزام الثابت' : '✓ تم إضافة الالتزام الثابت بنجاح');
  };

  const handleDeleteFixed = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الالتزام الثابت؟')) {
      updateData(prev => ({
        ...prev,
        fixedExpenses: prev.fixedExpenses.filter(f => f.id !== id),
      }));
      showToast('✓ تم حذف الالتزام الثابت');
    }
  };

  // 1-Click Pay Fixed Commitment for this month
  const handlePayFixed = (item) => {
    const updatedMonths = Array.from(new Set([...(item.paidMonths || []), selectedMonth]));
    const dayStr = String(Math.min(item.dueDay || 1, 28)).padStart(2, '0');
    const autoExpenseDate = `${selectedMonth}-${dayStr}`;

    const newExpense = {
      id: `exp_fixed_${item.id}_${selectedMonth}`,
      title: `[سداد ثابت] ${item.title}`,
      amount: item.amount,
      currency: item.currency,
      categoryId: item.categoryId,
      date: autoExpenseDate,
      paymentMethod: item.paymentMethod || 'card',
      notes: `تم السداد تلقائياً للالتزام الشهري (${item.title}) لشهر ${selectedMonth}`,
      createdAt: new Date().toISOString(),
    };

    updateData(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(f => f.id === item.id ? { ...f, paidMonths: updatedMonths } : f),
      expenses: [newExpense, ...prev.expenses],
    }));

    showToast(`✓ تم تأكيد سداد (${item.title}) وإدراجه في كشف مصروفات الشهر بنجاح`);
  };

  // Currency Handlers
  const handleUpdateRates = (newRates) => {
    updateData(prev => ({
      ...prev,
      currencyRates: newRates,
      ratesLastUpdated: new Date().toISOString(),
    }));
    showToast('✓ تم تحديث أسعار الصرف في النظام');
  };

  const handleUpdateBaseCurrency = (newBase) => {
    updateData(prev => ({ ...prev, baseCurrency: newBase }));
    showToast(`✓ تم تعيين ${newBase} كعملة أساسية للنظام`);
  };

  // Budget Handler
  const handleSaveBudget = (amount) => {
    updateData(prev => ({ ...prev, monthlyBudget: amount }));
    showToast(amount > 0 ? '✓ تم تحديث سقف الميزانية الشهرية' : '✓ تم إلغاء سقف الميزانية');
  };

  // Backup Restore
  const handleRestoreBackup = (backup) => {
    updateData({
      ...data,
      ...backup,
    });
    showToast('✓ تمت استعادة النسخة الاحتياطية بنجاح');
  };

  // If not logged in, render the AuthScreen
  if (!userSession) {
    return (
      <AuthScreen
        onLoginSuccess={(session) => {
          setUserSession(session);
          setData(loadAppData(session.userId, session.email));
          showToast(`مرحباً بك، ${session.fullName || session.username || session.email}`);
        }}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-mesh text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden`}>
      
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-[100px] animate-orb-1"></div>
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[110px] animate-orb-2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[130px] animate-orb-3"></div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 left-6 z-50 border font-extrabold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300 ${
          isDark
            ? 'bg-slate-900 border-emerald-500/40 text-emerald-400'
            : 'bg-white border-emerald-300 text-emerald-700 shadow-slate-200'
        }`}>
          <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        baseCurrency={baseCurrency}
        onOpenExpenseModal={() => {
          setExpenseToEdit(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenFixedModal={() => {
          setFixedToEdit(null);
          setIsFixedModalOpen(true);
        }}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10">
        
        {/* 1. Master Fintech Hero Card */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <HeroCard
            totalExpenses={totalExpensesInBase}
            budget={data.monthlyBudget || 0}
            fixedTotal={totalFixedInBase}
            fixedPaidCount={fixedPaidCount}
            fixedTotalCount={data.fixedExpenses.length}
            baseCurrency={baseCurrency}
            customRates={customRates}
            selectedMonth={selectedMonth}
            onOpenExpenseModal={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            onOpenFixedModal={() => {
              setFixedToEdit(null);
              setIsFixedModalOpen(true);
            }}
            onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
          />
        </div>

        {/* 2. Quick Add Bar */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
          <QuickAddBar
            categories={data.categories}
            baseCurrency={baseCurrency}
            selectedMonth={selectedMonth}
            onQuickAdd={handleSaveExpense}
          />
        </div>

        {/* 3. Metric Stat Cards */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.18s' }}>
          <StatCards
            totalExpenses={totalExpensesInBase}
            fixedTotal={totalFixedInBase}
            fixedPaidCount={fixedPaidCount}
            fixedTotalCount={data.fixedExpenses.length}
            dailyAverage={dailyAverage}
            budget={data.monthlyBudget || 0}
            baseCurrency={baseCurrency}
            daysInMonth={daysInMonth}
            currentDay={currentDay}
          />
        </div>

        {/* 4. Smart Insights AI Coach */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.24s' }}>
          <SmartInsights
            expenses={currentMonthExpenses}
            fixedExpenses={data.fixedExpenses}
            categories={data.categories}
            budget={data.monthlyBudget || 0}
            baseCurrency={baseCurrency}
            customRates={customRates}
            selectedMonth={selectedMonth}
          />
        </div>

        {/* 5. Navigation Tabs */}
        <div className={`animate-fade-in-up flex items-center gap-2 border-b pb-3 no-print pt-2 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`} style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`btn-interactive flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'expenses'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>المصروفات اليومية</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              isDark ? 'bg-slate-950/50' : 'bg-slate-100 text-slate-700'
            }`}>
              {currentMonthExpenses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fixed')}
            className={`btn-interactive flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'fixed'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>الثوابت والالتزامات</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              isDark ? 'bg-slate-950/50' : 'bg-slate-100 text-slate-700'
            }`}>
              {data.fixedExpenses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn-interactive flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'analytics'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>الرسوم البيانية والتحليلات</span>
          </button>
        </div>

        {/* Tab 1: Daily Expenses */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <ExpensesTable
              expenses={data.expenses}
              categories={data.categories}
              baseCurrency={baseCurrency}
              customRates={customRates}
              selectedMonth={selectedMonth}
              onEditExpense={(exp) => {
                setExpenseToEdit(exp);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onOpenAddModal={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 2: Fixed Commitments */}
        {activeTab === 'fixed' && (
          <FixedExpensesView
            fixedExpenses={data.fixedExpenses}
            selectedMonth={selectedMonth}
            baseCurrency={baseCurrency}
            customRates={customRates}
            categories={data.categories}
            onPayFixed={handlePayFixed}
            onEditFixed={(item) => {
              setFixedToEdit(item);
              setIsFixedModalOpen(true);
            }}
            onDeleteFixed={handleDeleteFixed}
            onOpenAddModal={() => {
              setFixedToEdit(null);
              setIsFixedModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Detailed Analytics & Charts */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <ChartsSection
              expenses={currentMonthExpenses}
              categories={data.categories}
              baseCurrency={baseCurrency}
              customRates={customRates}
              selectedMonth={selectedMonth}
            />
          </div>
        )}

      </main>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
        categories={data.categories}
        baseCurrency={baseCurrency}
        customRates={customRates}
        selectedMonth={selectedMonth}
      />

      <FixedExpenseModal
        isOpen={isFixedModalOpen}
        onClose={() => setIsFixedModalOpen(false)}
        onSave={handleSaveFixed}
        itemToEdit={fixedToEdit}
        categories={data.categories}
        baseCurrency={baseCurrency}
        customRates={customRates}
      />

      <CurrencyConverterModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        baseCurrency={baseCurrency}
        onUpdateBaseCurrency={handleUpdateBaseCurrency}
        customRates={customRates}
        onUpdateRates={handleUpdateRates}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={data.monthlyBudget || 0}
        onSaveBudget={handleSaveBudget}
        baseCurrency={baseCurrency}
        selectedMonth={selectedMonth}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        expenses={data.expenses}
        fixedExpenses={data.fixedExpenses}
        categories={data.categories}
        baseCurrency={baseCurrency}
        selectedMonth={selectedMonth}
        onRestoreBackup={handleRestoreBackup}
        onTriggerPrint={() => setIsPrinting(true)}
      />

      {/* Printable Report View */}
      {isPrinting && (
        <ReportPrintView
          selectedMonth={selectedMonth}
          expenses={data.expenses}
          fixedExpenses={data.fixedExpenses}
          categories={data.categories}
          baseCurrency={baseCurrency}
          customRates={customRates}
          budget={data.monthlyBudget || 0}
          onClose={() => setIsPrinting(false)}
        />
      )}

    </div>
  );
}
