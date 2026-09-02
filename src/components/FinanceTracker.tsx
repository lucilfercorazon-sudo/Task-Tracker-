import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  Filter, 
  Search, 
  Calendar, 
  Tag, 
  DollarSign, 
  PieChart as PieChartIcon, 
  CheckCircle2, 
  AlertTriangle,
  CreditCard,
  Layers,
  ChevronDown
} from 'lucide-react';
import { FinanceData, Transaction, TransactionType, BudgetLimit } from '../types';
import { FINANCE_CATEGORIES } from '../data/defaultFinance';

interface FinanceTrackerProps {
  financeData: FinanceData;
  onUpdateFinanceData: (newData: FinanceData) => void;
}

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({
  financeData,
  onUpdateFinanceData,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [isEditingBudgets, setIsEditingBudgets] = useState(false);

  // New Transaction Form State
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txCategory, setTxCategory] = useState('groceries');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txPaymentMethod, setTxPaymentMethod] = useState('بطاقة مدى');
  const [txNotes, setTxNotes] = useState('');

  // Calculations
  const { totalIncome, totalExpense, netSavings, savingsRate, categoryExpenses, budgetComparison } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap: Record<string, number> = {};

    financeData.transactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
    });

    const net = income - expense;
    const rate = income > 0 ? Math.round((net / income) * 100) : 0;

    // Build category sorted list
    const sortedCategories = Object.entries(catMap)
      .map(([catId, spent]) => {
        const catInfo = FINANCE_CATEGORIES.find(c => c.id === catId) || {
          name: catId,
          color: 'slate',
        };
        const budget = financeData.budgets.find(b => b.category === catId)?.monthlyLimit || 0;
        const percentOfExpense = expense > 0 ? Math.round((spent / expense) * 100) : 0;
        const budgetUsagePercent = budget > 0 ? Math.round((spent / budget) * 100) : null;

        return {
          catId,
          name: catInfo.name,
          spent,
          percentOfExpense,
          budget,
          budgetUsagePercent,
          color: catInfo.color,
        };
      })
      .sort((a, b) => b.spent - a.spent);

    return {
      totalIncome: income,
      totalExpense: expense,
      netSavings: net,
      savingsRate: rate,
      categoryExpenses: sortedCategories,
      budgetComparison: sortedCategories.filter(c => c.budget > 0),
    };
  }, [financeData]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return financeData.transactions
      .filter((tx) => {
        if (filterType !== 'all' && tx.type !== filterType) return false;
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(query);
          const matchCat = FINANCE_CATEGORIES.find(c => c.id === tx.category)?.name.toLowerCase().includes(query);
          const matchNotes = tx.notes?.toLowerCase().includes(query);
          if (!matchTitle && !matchCat && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financeData.transactions, filterType, selectedCategory, searchQuery]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount || Number(txAmount) <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: txTitle.trim(),
      amount: Number(txAmount),
      type: txType,
      category: txCategory,
      date: txDate || new Date().toISOString().split('T')[0],
      paymentMethod: txPaymentMethod,
      notes: txNotes.trim() || undefined,
    };

    onUpdateFinanceData({
      ...financeData,
      transactions: [newTx, ...financeData.transactions],
    });

    // Reset Form
    setTxTitle('');
    setTxAmount('');
    setTxNotes('');
    setIsAddingTx(false);
  };

  const handleDeleteTransaction = (id: string) => {
    onUpdateFinanceData({
      ...financeData,
      transactions: financeData.transactions.filter(t => t.id !== id),
    });
  };

  const handleUpdateBudgetLimit = (category: string, newLimit: number) => {
    const existingIndex = financeData.budgets.findIndex(b => b.category === category);
    let updatedBudgets = [...financeData.budgets];
    if (existingIndex >= 0) {
      updatedBudgets[existingIndex] = { ...updatedBudgets[existingIndex], monthlyLimit: newLimit };
    } else {
      updatedBudgets.push({ category, monthlyLimit: newLimit });
    }
    onUpdateFinanceData({
      ...financeData,
      budgets: updatedBudgets,
    });
  };

  return (
    <div id="finance-tracker-container" className="space-y-6 text-right">
      {/* 1. Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              إجمالي الدخل
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {totalIncome.toLocaleString()} <span className="text-sm font-normal text-slate-400">{financeData.currency}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">الرواتب، المشاريع والدخل الإضافي</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              إجمالي المصروفات
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {totalExpense.toLocaleString()} <span className="text-sm font-normal text-slate-400">{financeData.currency}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">المصاريف المباشرة والالتزامات</p>
          </div>
        </div>

        {/* Net Savings */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-xl border ${netSavings >= 0 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${netSavings >= 0 ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' : 'text-amber-300 bg-amber-500/10 border-amber-500/20'}`}>
              صافي التوفير
            </span>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${netSavings >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {netSavings.toLocaleString()} <span className="text-sm font-normal text-slate-400">{financeData.currency}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {netSavings >= 0 ? 'فائض مالي متاح للادخار والاستثمار' : 'عجز في الميزانية، يرجى ترشيد الإنفاق'}
            </p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              معدل الادخار %
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight">
              {savingsRate}%
            </div>
            <div className="w-full bg-[#21262D] rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  savingsRate >= 30 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : savingsRate >= 10 ? 'bg-indigo-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. "Where does your money go?" (أين تذهب أموالك؟) + Budget Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-5 border-b border-[#30363D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <PieChartIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">أين تذهب أموالك؟ (توزيع المصروفات)</h3>
                <p className="text-xs text-slate-400">تحليل فئات الإنفاق ونسبة كل فئة من المجموع</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingBudgets(!isEditingBudgets)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-indigo-300 border border-[#30363D] transition-colors"
            >
              {isEditingBudgets ? 'تم ضبط الميزانيات' : '⚙️ تعديل سقوف الميزانية'}
            </button>
          </div>

          {categoryExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              لا توجد مصروفات مسجلة حتى الآن. أضف معاملتك الأولى!
            </div>
          ) : (
            <div className="space-y-4">
              {categoryExpenses.map((item) => {
                const isOverBudget = item.budget > 0 && item.spent > item.budget;
                return (
                  <div key={`cat-breakdown-${item.catId}`} className="space-y-1.5 p-3 rounded-xl bg-[#0D1117]/60 border border-[#21262D]">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <span>{item.name}</span>
                        {item.budget > 0 && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${isOverBudget ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'}`}>
                            {isOverBudget ? '⚠️ تجاوز الميزانية' : `الميزانية: ${item.budget} ${financeData.currency}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-white text-sm">
                          {item.spent.toLocaleString()} {financeData.currency}
                        </span>
                        <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md">
                          {item.percentOfExpense}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#21262D] rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget
                            ? 'bg-rose-500'
                            : item.percentOfExpense > 30
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${Math.min(100, item.percentOfExpense)}%` }}
                      />
                    </div>

                    {/* Budget Edit Form Inline if open */}
                    {isEditingBudgets && (
                      <div className="flex items-center gap-2 pt-2 mt-2 border-t border-[#21262D] text-[11px]">
                        <span className="text-slate-400">سقف الميزانية الشهري:</span>
                        <input
                          type="number"
                          defaultValue={item.budget || ''}
                          placeholder="مثلاً 1500"
                          onBlur={(e) => handleUpdateBudgetLimit(item.catId, Number(e.target.value) || 0)}
                          className="w-24 px-2 py-1 bg-[#161B22] border border-[#30363D] rounded-lg text-white text-xs focus:outline-none focus:border-indigo-400"
                        />
                        <span className="text-slate-500">{financeData.currency}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial Quick Tip & Monthly Rule */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>قاعدة 50 / 30 / 20 المالية</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              دليل إدارة وتوزيع الدخل الذكي لتحقيق الاستقرار والاستقلال المالي:
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <div className="font-bold text-indigo-300 mb-1">50% الاحتياجات الأساسية</div>
                <div className="text-slate-400 text-[11px]">السكن، الفواتير، الغذاء، والمواصلات الأساسية</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20">
                <div className="font-bold text-purple-300 mb-1">30% الرغبات والكماليات</div>
                <div className="text-slate-400 text-[11px]">المطاعم، الترفيه، التسوق، والرحلات</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                <div className="font-bold text-emerald-300 mb-1">20% الادخار والاستثمار</div>
                <div className="text-slate-400 text-[11px]">صندوق الطوارئ، الأسهم، والعوائد التراكمية</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Add Transaction Toolbar & History */}
      <div className="rounded-2xl border border-[#30363D] bg-[#161B22] shadow-xl overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 border-b border-[#30363D] gap-4 bg-[#111620]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              سجل المعاملات والدخل والمصروفات ({filteredTransactions.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              إدارة وتسجيل العمليات المالية بدقة وسرعة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-transaction"
              onClick={() => setIsAddingTx(!isAddingTx)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل عملية جديدة</span>
            </button>
          </div>
        </div>

        {/* Add Transaction Form Drawer */}
        {isAddingTx && (
          <form onSubmit={handleAddTransaction} className="p-5 bg-[#0D1117] border-b border-[#30363D] space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setTxType('expense'); setTxCategory('groceries'); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  txType === 'expense'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                    : 'bg-[#161B22] text-slate-400 border-[#30363D]'
                }`}
              >
                مصروف (- تسجيل صرف)
              </button>
              <button
                type="button"
                onClick={() => { setTxType('income'); setTxCategory('salary'); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  txType === 'income'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-[#161B22] text-slate-400 border-[#30363D]'
                }`}
              >
                دخل (+ تسجيل إيراد)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">بيان العملية / الوصف</label>
                <input
                  type="text"
                  placeholder="مثلاً: شراء بقالة ومستلزمات"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">المبلغ ({financeData.currency})</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="any"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">التصنيف</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-white focus:outline-none focus:border-indigo-400"
                >
                  {FINANCE_CATEGORIES.filter(c => c.type === txType).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">التاريخ</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">طريقة الدفع (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثلاً: مدى، Apple Pay، تحويل بنكي، كاش"
                  value={txPaymentMethod}
                  onChange={(e) => setTxPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">ملاحظات إضافية (اختياري)</label>
                <input
                  type="text"
                  placeholder="تفاصيل إضافية عن الفاتورة أو البند"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingTx(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#21262D] hover:bg-[#30363D] text-slate-300"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
              >
                حفظ العملية ✓
              </button>
            </div>
          </form>
        )}

        {/* Filter Controls Bar */}
        <div className="p-3 bg-[#0D1117] border-b border-[#30363D] flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Filter Buttons */}
            <div className="flex items-center bg-[#161B22] p-0.5 rounded-xl border border-[#30363D]">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الدخل (+)
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                المصروفات (-)
              </button>
            </div>

            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-slate-200 focus:outline-none"
            >
              <option value="all">جميع التصنيفات</option>
              {FINANCE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في المعاملات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[650px] text-xs">
            <thead>
              <tr className="bg-[#111620] border-b border-[#30363D] text-slate-400 font-bold">
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">بيان العملية</th>
                <th className="py-3 px-4 text-center">التصنيف</th>
                <th className="py-3 px-4 text-center">طريقة الدفع</th>
                <th className="py-3 px-4 text-left">المبلغ</th>
                <th className="py-3 px-3 text-center w-12">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    لا توجد معاملات مطابقة للبحث والفلترة الحالية
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const cat = FINANCE_CATEGORIES.find(c => c.id === tx.category);

                  return (
                    <tr key={tx.id} className="hover:bg-[#1c232c]/50 transition-colors group">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                          {tx.title}
                        </div>
                        {tx.notes && (
                          <div className="text-[10px] text-slate-500 mt-0.5">{tx.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full border ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                        }`}>
                          {cat ? cat.name : tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                        {tx.paymentMethod || '—'}
                      </td>
                      <td className={`py-3 px-4 text-left font-mono font-extrabold whitespace-nowrap ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isIncome ? '+' : '-'}{tx.amount.toLocaleString()} {financeData.currency}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          title="حذف العملية"
                          className="p-1 hover:text-rose-400 text-slate-500 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
