import React, { useState, useEffect, useMemo } from 'react';
import { Habit, MonthData, FinanceData, TaskData, WeeklyPlannerData } from './types';
import { generateInitialMonthData, ARABIC_MONTH_NAMES, getDaysInMonth } from './data/defaultData';
import { getDefaultFinanceData } from './data/defaultFinance';
import { getDefaultTaskData } from './data/defaultTasks';
import { getDefaultWeeklyPlannerData } from './data/defaultPlanner';
import { calculateOverallSummary } from './utils/calculations';
import { StatsOverview } from './components/StatsOverview';
import { HabitTrackerTable } from './components/HabitTrackerTable';
import { AnalyticsAndRankings } from './components/AnalyticsAndRankings';
import { FinanceTracker } from './components/FinanceTracker';
import { TaskTracker } from './components/TaskTracker';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { SheetsSyncModal } from './components/SheetsSyncModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { GoogleSheetsService } from './services/googleSheets';
import { 
  FileSpreadsheet, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Smartphone,
  SlidersHorizontal,
  Laptop,
  Download,
  Wallet,
  CheckSquare,
  Flame,
  LayoutDashboard
} from 'lucide-react';

const HABIT_STORAGE_KEY = 'habit_tracker_pro_v1';
const FINANCE_STORAGE_KEY = 'finance_tracker_pro_v1';
const TASK_STORAGE_KEY = 'task_tracker_pro_v1';
const PLANNER_STORAGE_KEY = 'planner_tracker_pro_v1';

type AppTab = 'habits' | 'finance' | 'tasks' | 'planner';

export default function App() {
  // Current active main application tab
  const [activeMainTab, setActiveMainTab] = useState<AppTab>('habits');

  // Habit Data State
  const [monthData, setMonthData] = useState<MonthData>(() => {
    try {
      const saved = localStorage.getItem(HABIT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load habit state', e);
    }
    return generateInitialMonthData();
  });

  // Finance Data State
  const [financeData, setFinanceData] = useState<FinanceData>(() => {
    try {
      const saved = localStorage.getItem(FINANCE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load finance state', e);
    }
    return getDefaultFinanceData();
  });

  // Task Data State
  const [taskData, setTaskData] = useState<TaskData>(() => {
    try {
      const saved = localStorage.getItem(TASK_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load task state', e);
    }
    return getDefaultTaskData();
  });

  // Weekly Planner Data State
  const [plannerData, setPlannerData] = useState<WeeklyPlannerData>(() => {
    try {
      const saved = localStorage.getItem(PLANNER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load planner state', e);
    }
    return getDefaultWeeklyPlannerData();
  });

  const [habitSubTab, setHabitSubTab] = useState<'tracker' | 'analytics'>('tracker');
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Initialize Google SDK
  useEffect(() => {
    const clientId = '142678910119-ehm60khbkn6d8j5e1o2v0f7m8p2n74vg.apps.googleusercontent.com';
    GoogleSheetsService.initClient(clientId).catch(console.error);
  }, []);

  // Save states to local storage
  useEffect(() => {
    try {
      localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(monthData));
    } catch (e) {
      console.error('Failed to save habit state', e);
    }
  }, [monthData]);

  useEffect(() => {
    try {
      localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(financeData));
    } catch (e) {
      console.error('Failed to save finance state', e);
    }
  }, [financeData]);

  useEffect(() => {
    try {
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(taskData));
    } catch (e) {
      console.error('Failed to save task state', e);
    }
  }, [taskData]);

  useEffect(() => {
    try {
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plannerData));
    } catch (e) {
      console.error('Failed to save planner state', e);
    }
  }, [plannerData]);

  const summary = useMemo(() => calculateOverallSummary(monthData), [monthData]);

  // Habit Handlers
  const handleToggleCheck = (habitId: string, day: number) => {
    setMonthData((prev) => {
      const currentDayRecords = prev.records[day] || {};
      const newChecked = !currentDayRecords[habitId];

      return {
        ...prev,
        records: {
          ...prev.records,
          [day]: {
            ...currentDayRecords,
            [habitId]: newChecked,
          },
        },
      };
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id'>) => {
    const id = 'h_' + Date.now();
    const habitToAdd: Habit = {
      ...newHabit,
      id,
    };

    setMonthData((prev) => ({
      ...prev,
      habits: [...prev.habits, habitToAdd],
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    setMonthData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  };

  const handleUpdateHabitName = (habitId: string, newName: string) => {
    setMonthData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, name: newName } : h)),
    }));
  };

  const handleMonthChange = (delta: number) => {
    let newMonth = monthData.month + delta;
    let newYear = monthData.year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    const newDays = getDaysInMonth(newYear, newMonth);
    const newRecords: { [day: number]: { [habitId: string]: boolean } } = {};
    for (let d = 1; d <= newDays; d++) {
      newRecords[d] = {};
      monthData.habits.forEach((h) => {
        newRecords[d][h.id] = false;
      });
    }

    setMonthData((prev) => ({
      ...prev,
      year: newYear,
      month: newMonth,
      monthNameArabic: ARABIC_MONTH_NAMES[newMonth - 1],
      daysCount: newDays,
      records: newRecords,
      connectedSheetId: undefined,
      connectedSheetUrl: undefined,
    }));
  };

  const handleResetData = () => {
    if (activeMainTab === 'habits') {
      if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط بيانات هذا الشهر للعادات؟')) {
        const reset = generateInitialMonthData(monthData.year, monthData.month);
        setMonthData(reset);
      }
    } else if (activeMainTab === 'finance') {
      if (window.confirm('هل تريد إعادة تعيين بيانات متابع المالية إلى الوضع الافتراضي؟')) {
        setFinanceData(getDefaultFinanceData());
      }
    } else if (activeMainTab === 'tasks') {
      if (window.confirm('هل تريد إعادة تعيين بيانات متابع المهام إلى الوضع الافتراضي؟')) {
        setTaskData(getDefaultTaskData());
      }
    } else if (activeMainTab === 'planner') {
      if (window.confirm('هل تريد إعادة تعيين جدول المخطط الأسبوعي؟')) {
        setPlannerData(getDefaultWeeklyPlannerData());
      }
    }
  };

  const handleSheetCreated = (spreadsheetId: string, spreadsheetUrl: string) => {
    setMonthData((prev) => ({
      ...prev,
      connectedSheetId: spreadsheetId,
      connectedSheetUrl: spreadsheetUrl,
      lastSyncedAt: new Date().toLocaleTimeString('ar-SA'),
    }));
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-indigo-500 selection:text-white pb-16">
      {/* Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-60 left-10 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* Main Header Bar */}
      <header className="relative z-10 border-b border-[#30363D] bg-[#161B22]/90 backdrop-blur-xl sticky top-0 px-4 sm:px-8 py-3.5 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Main App Title */}
          <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B0E14] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>منظومة الإنتاجية الشاملة</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold tracking-wide">
                    PRO SUITE
                  </span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  متتبع العادات • متابع المالية • متابع المهام • المخطط الأسبوعي
                </p>
              </div>
            </div>

            {/* Mobile Month Switcher for Habits */}
            {activeMainTab === 'habits' && (
              <div className="flex md:hidden items-center gap-1 bg-[#0D1117] border border-[#30363D] rounded-xl p-1">
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-1 hover:bg-[#21262D] rounded-lg text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-indigo-300 px-2">
                  {monthData.monthNameArabic}
                </span>
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-1 hover:bg-[#21262D] rounded-lg text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Actions & Utilities */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Desktop Month Selector (for habits) */}
            {activeMainTab === 'habits' && (
              <div className="hidden md:flex items-center gap-2 bg-[#0D1117] border border-[#30363D] rounded-2xl px-3 py-1.5 shadow-inner">
                <button
                  id="btn-next-month"
                  onClick={() => handleMonthChange(1)}
                  title="الشهر التالي"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#21262D] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 px-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {monthData.monthNameArabic} {monthData.year}
                  </span>
                </div>
                <button
                  id="btn-prev-month"
                  onClick={() => handleMonthChange(-1)}
                  title="الشهر السابق"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#21262D] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Reset Button */}
            <button
              id="btn-reset-data"
              onClick={handleResetData}
              title="إعادة ضبط بيانات القسم الحالي"
              className="p-2 rounded-xl bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Install PWA Button */}
            <button
              id="btn-install-app"
              onClick={() => setIsInstallModalOpen(true)}
              title="تثبيت التطبيق على جهازك (PWA)"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#21262D] hover:bg-[#30363D] border border-indigo-500/40 text-indigo-300 hover:text-white shadow-md active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>تثبيت على الجهاز</span>
            </button>

            {/* Google Sheets Sync Button */}
            <button
              id="btn-open-sheets-modal"
              onClick={() => setIsSheetsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {monthData.connectedSheetUrl ? 'مزامنة Google Sheets' : 'تصدير Google Sheets'}
              </span>
            </button>
          </div>
        </div>

        {/* Global Module Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3.5 pt-2 border-t border-[#30363D]/60 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {/* Tab 1: Habit Tracker */}
          <button
            onClick={() => setActiveMainTab('habits')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeMainTab === 'habits'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#21262D]'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>متتبع العادات (Habits)</span>
          </button>

          {/* Tab 2: Finance Tracker */}
          <button
            onClick={() => setActiveMainTab('finance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeMainTab === 'finance'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#21262D]'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>💰 متابع المالية (Finance)</span>
          </button>

          {/* Tab 3: Task Tracker */}
          <button
            onClick={() => setActiveMainTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeMainTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#21262D]'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>✅ متابع المهام (Tasks)</span>
          </button>

          {/* Tab 4: Weekly Planner */}
          <button
            onClick={() => setActiveMainTab('planner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeMainTab === 'planner'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#21262D]'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>📅 المخطط الأسبوعي (Planner)</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6 space-y-6 flex-1">
        {/* Module 1: HABIT TRACKER */}
        {activeMainTab === 'habits' && (
          <div className="space-y-6">
            {/* Connected Sheet Banner if linked */}
            {monthData.connectedSheetUrl && (
              <div className="p-3 sm:p-4 rounded-2xl bg-[#161B22] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
                <div className="flex items-center gap-2.5 text-emerald-300 font-semibold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>الجدول مربوط مباشرة مع Google Sheets (تنسيق تفاعلي وصيغ حسابية كاملة)</span>
                </div>
                <a
                  href={monthData.connectedSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/30 font-bold transition-colors"
                >
                  <span>فتح المستند في Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Top Counter Overview (KPIs) */}
            <StatsOverview summary={summary} monthData={monthData} />

            {/* Sub Tabs: Tracker Table / Analytics */}
            <div className="flex items-center gap-2 border-b border-[#30363D] pb-2">
              <button
                onClick={() => setHabitSubTab('tracker')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  habitSubTab === 'tracker'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B22]'
                }`}
              >
                <span>جدول تتبع العادات اليومية (31 يوماً)</span>
                <span className="px-2 py-0.5 rounded-full bg-[#21262D] text-[10px] text-slate-300 font-mono border border-[#30363D]">
                  {monthData.habits.length}
                </span>
              </button>

              <button
                onClick={() => setHabitSubTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  habitSubTab === 'analytics'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B22]'
                }`}
              >
                <span>الرسوم البيانية والتحليل المتقدم</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              </button>
            </div>

            {habitSubTab === 'tracker' ? (
              <div className="space-y-6">
                <HabitTrackerTable
                  monthData={monthData}
                  onToggleCheck={handleToggleCheck}
                  onAddHabit={handleAddHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onUpdateHabitName={handleUpdateHabitName}
                />
                <AnalyticsAndRankings monthData={monthData} summary={summary} />
              </div>
            ) : (
              <AnalyticsAndRankings monthData={monthData} summary={summary} />
            )}
          </div>
        )}

        {/* Module 2: FINANCE TRACKER */}
        {activeMainTab === 'finance' && (
          <FinanceTracker
            financeData={financeData}
            onUpdateFinanceData={setFinanceData}
          />
        )}

        {/* Module 3: TASK TRACKER */}
        {activeMainTab === 'tasks' && (
          <TaskTracker
            taskData={taskData}
            onUpdateTaskData={setTaskData}
          />
        )}

        {/* Module 4: WEEKLY PLANNER */}
        {activeMainTab === 'planner' && (
          <WeeklyPlanner
            plannerData={plannerData}
            onUpdatePlannerData={setPlannerData}
          />
        )}
      </main>

      {/* Auto-save notification toast */}
      {saveToast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161B22] border border-emerald-500/40 text-xs text-emerald-300 shadow-2xl shadow-black/60 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>تم الحساب والتحديث التلقائي ✓</span>
        </div>
      )}

      {/* Google Sheets Synchronization Modal */}
      <SheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        monthData={monthData}
        onSheetCreated={handleSheetCreated}
      />

      {/* PWA Device Installation Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}

