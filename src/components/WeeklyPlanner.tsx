import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  Sparkles, 
  Target, 
  FileText, 
  Check, 
  RotateCcw,
  Sun,
  Flame
} from 'lucide-react';
import { WeeklyPlannerData, DayKey, WeeklyPlanItem } from '../types';
import { DAYS_CONFIG } from '../data/defaultPlanner';

interface WeeklyPlannerProps {
  plannerData: WeeklyPlannerData;
  onUpdatePlannerData: (newData: WeeklyPlannerData) => void;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  plannerData,
  onUpdatePlannerData,
}) => {
  const [activeDayKey, setActiveDayKey] = useState<DayKey>('sunday');
  const [newGoalText, setNewGoalText] = useState('');
  const [editingNotes, setEditingNotes] = useState(plannerData.weeklyNotes);

  // Quick Add Item per day state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('');
  const [quickTag, setQuickTag] = useState('عمل');

  // Compute total items and completion across the 7 days
  const weeklySummary = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;

    DAYS_CONFIG.forEach((dayCfg) => {
      const items = plannerData.days[dayCfg.key] || [];
      totalItems += items.length;
      completedItems += items.filter((i: WeeklyPlanItem) => i.done).length;
    });

    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const goalsCompleted = plannerData.weeklyGoals.filter(g => g.done).length;
    const goalsTotal = plannerData.weeklyGoals.length;

    return { totalItems, completedItems, completionRate, goalsCompleted, goalsTotal };
  }, [plannerData]);

  // Compute dates for the 7 days starting from Sunday
  const daysWithDates = useMemo(() => {
    const startDate = new Date(plannerData.currentWeekStartDate);
    return DAYS_CONFIG.map((dayConfig, index) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + index);
      const monthStr = d.toLocaleDateString('ar-EG', { month: 'short' });
      const dayNum = d.getDate();
      return {
        ...dayConfig,
        formattedDate: `${dayNum} ${monthStr}`,
        isToday: d.toDateString() === new Date().toDateString(),
      };
    });
  }, [plannerData.currentWeekStartDate]);

  // Handlers for Items
  const handleToggleItem = (dayKey: DayKey, itemId: string) => {
    const updatedDayItems = plannerData.days[dayKey].map((item) => {
      if (item.id === itemId) {
        return { ...item, done: !item.done };
      }
      return item;
    });

    onUpdatePlannerData({
      ...plannerData,
      days: {
        ...plannerData.days,
        [dayKey]: updatedDayItems,
      },
    });
  };

  const handleAddItemToDay = (dayKey: DayKey, e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newItem: WeeklyPlanItem = {
      id: `item-${dayKey}-${Date.now()}`,
      title: quickTitle.trim(),
      time: quickTime.trim() || undefined,
      done: false,
      tag: quickTag.trim() || undefined,
    };

    onUpdatePlannerData({
      ...plannerData,
      days: {
        ...plannerData.days,
        [dayKey]: [...plannerData.days[dayKey], newItem],
      },
    });

    setQuickTitle('');
    setQuickTime('');
  };

  const handleDeleteItem = (dayKey: DayKey, itemId: string) => {
    onUpdatePlannerData({
      ...plannerData,
      days: {
        ...plannerData.days,
        [dayKey]: plannerData.days[dayKey].filter(i => i.id !== itemId),
      },
    });
  };

  // Weekly Goals handlers
  const handleToggleGoal = (goalId: string) => {
    const updatedGoals = plannerData.weeklyGoals.map((g) => {
      if (g.id === goalId) {
        return { ...g, done: !g.done };
      }
      return g;
    });
    onUpdatePlannerData({ ...plannerData, weeklyGoals: updatedGoals });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    const newGoal = {
      id: `goal-${Date.now()}`,
      text: newGoalText.trim(),
      done: false,
    };

    onUpdatePlannerData({
      ...plannerData,
      weeklyGoals: [...plannerData.weeklyGoals, newGoal],
    });

    setNewGoalText('');
  };

  const handleDeleteGoal = (goalId: string) => {
    onUpdatePlannerData({
      ...plannerData,
      weeklyGoals: plannerData.weeklyGoals.filter(g => g.id !== goalId),
    });
  };

  const handleSaveNotes = () => {
    onUpdatePlannerData({
      ...plannerData,
      weeklyNotes: editingNotes,
    });
  };

  // Week shift handlers
  const handleShiftWeek = (offsetDays: number) => {
    const current = new Date(plannerData.currentWeekStartDate);
    current.setDate(current.getDate() + offsetDays);
    const newStartStr = current.toISOString().split('T')[0];
    onUpdatePlannerData({
      ...plannerData,
      currentWeekStartDate: newStartStr,
    });
  };

  return (
    <div id="weekly-planner-container" className="space-y-6 text-right">
      {/* 1. Week Header & Progress Overview */}
      <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>المخطط الأسبوعي (من الأحد إلى السبت)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تنظيم جدول الأسبوع، المواعيد، ومهام كل يوم بتسلسل زمني واضح
              </p>
            </div>
          </div>

          {/* Week Shift Navigator */}
          <div className="flex items-center gap-2 bg-[#0D1117] p-1.5 rounded-2xl border border-[#30363D]">
            <button
              onClick={() => handleShiftWeek(7)}
              title="الأسبوع التالي"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#21262D] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-200 px-3 font-mono">
              أسبوع: {plannerData.currentWeekStartDate}
            </span>
            <button
              onClick={() => handleShiftWeek(-7)}
              title="الأسبوع السابق"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#21262D] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117] border border-[#21262D]">
            <span className="text-slate-400">إجمالي مهام الأسبوع:</span>
            <span className="font-bold text-white font-mono">{weeklySummary.totalItems} مهمة</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117] border border-[#21262D]">
            <span className="text-slate-400">المنجز منها:</span>
            <span className="font-bold text-emerald-400 font-mono">{weeklySummary.completedItems} مكتملة ({weeklySummary.completionRate}%)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117] border border-[#21262D]">
            <span className="text-slate-400">أهداف الأسبوع الكبرى:</span>
            <span className="font-bold text-indigo-400 font-mono">{weeklySummary.goalsCompleted} من {weeklySummary.goalsTotal}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Weekly Goals & Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Goals */}
        <div className="lg:col-span-2 rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-[#30363D] pb-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>أهداف الأسبوع الكبرى (Weekly Objectives)</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {weeklySummary.goalsCompleted}/{weeklySummary.goalsTotal} منجز
            </span>
          </div>

          {/* Add Goal Input */}
          <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="اكتب هدفاً أسبوعياً مهماً..."
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-all"
            >
              إضافة هدف
            </button>
          </form>

          {/* Goals List */}
          <div className="space-y-2">
            {plannerData.weeklyGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#30363D] transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                  <button
                    onClick={() => handleToggleGoal(goal.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                      goal.done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#161B22] border border-[#30363D]'
                    }`}
                  >
                    {goal.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className={`text-xs truncate ${goal.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {goal.text}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Focus Notes */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-3 border-b border-[#30363D] pb-3">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>ملاحظات وتركيز الأسبوع</span>
            </div>
            <textarea
              rows={5}
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              placeholder="اكتب التوجيهات أو الملاحظات التي تود تذكرها طوال هذا الأسبوع..."
              className="w-full p-3 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 leading-relaxed resize-none"
            />
          </div>
          <button
            onClick={handleSaveNotes}
            className="w-full mt-3 py-2 rounded-xl text-xs font-bold bg-[#21262D] hover:bg-[#30363D] text-indigo-300 border border-[#30363D] transition-colors"
          >
            حفظ الملاحظات ✓
          </button>
        </div>
      </div>

      {/* 3. The 7 Days Grid (Sunday -> Saturday) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>جدول أيام الأسبوع (الأحد - السبت)</span>
            <span className="text-xs font-normal text-slate-400">({daysWithDates.length} أيام)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3.5">
          {daysWithDates.map((day) => {
            const items = plannerData.days[day.key] || [];
            const dayCompleted = items.filter(i => i.done).length;
            const dayTotal = items.length;

            return (
              <div
                key={day.key}
                className={`rounded-2xl border bg-[#161B22] flex flex-col justify-between shadow-xl transition-all ${
                  day.isToday ? 'border-indigo-500/80 shadow-indigo-500/10' : 'border-[#30363D]'
                }`}
              >
                {/* Day Header */}
                <div className={`p-3 border-b border-[#30363D] ${day.isToday ? 'bg-indigo-950/30' : 'bg-[#111620]'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white">{day.nameArabic}</span>
                    {day.isToday && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold">
                        اليوم
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>{day.formattedDate}</span>
                    <span>{dayCompleted}/{dayTotal}</span>
                  </div>
                </div>

                {/* Day Items List */}
                <div className="p-2.5 space-y-2 flex-1 min-h-[140px] max-h-[280px] overflow-y-auto custom-scrollbar">
                  {items.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-[11px]">
                      لا توجد مهام أو مواعيد
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-xl border text-xs transition-colors group ${
                          item.done
                            ? 'bg-[#0D1117]/40 border-[#21262D] text-slate-500'
                            : 'bg-[#0D1117] border-[#30363D] text-slate-200 hover:border-indigo-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-start gap-1.5 flex-1 overflow-hidden">
                            <button
                              onClick={() => handleToggleItem(day.key, item.id)}
                              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                item.done ? 'bg-emerald-600 text-white' : 'border border-[#484F58]'
                              }`}
                            >
                              {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span className={`text-[11px] leading-tight break-words ${item.done ? 'line-through' : 'font-semibold'}`}>
                              {item.title}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteItem(day.key, item.id)}
                            className="text-slate-600 hover:text-rose-400 p-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Time & Tag */}
                        {(item.time || item.tag) && (
                          <div className="flex items-center gap-1.5 mt-1.5 pt-1 border-t border-[#21262D] text-[10px] text-slate-400">
                            {item.time && (
                              <span className="flex items-center gap-1 font-mono text-indigo-300">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{item.time}</span>
                              </span>
                            )}
                            {item.tag && (
                              <span className="px-1.5 py-0.2 rounded bg-[#21262D] text-slate-300">
                                {item.tag}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Day Quick Add Item Footer */}
                <div className="p-2 border-t border-[#30363D] bg-[#0D1117]/60">
                  <form
                    onSubmit={(e) => {
                      if (activeDayKey === day.key) {
                        handleAddItemToDay(day.key, e);
                      }
                    }}
                    className="flex flex-col gap-1.5"
                  >
                    <input
                      type="text"
                      placeholder="+ إضافة موعد/مهمة..."
                      onFocus={() => setActiveDayKey(day.key)}
                      onChange={(e) => {
                        setActiveDayKey(day.key);
                        setQuickTitle(e.target.value);
                      }}
                      value={activeDayKey === day.key ? quickTitle : ''}
                      className="w-full px-2 py-1.5 text-[11px] rounded-lg bg-[#161B22] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                    {activeDayKey === day.key && quickTitle.trim() && (
                      <div className="flex gap-1 animate-fade-in">
                        <input
                          type="text"
                          placeholder="الوقت (مثلاً 09:00 ص)"
                          value={quickTime}
                          onChange={(e) => setQuickTime(e.target.value)}
                          className="w-1/2 px-1.5 py-1 text-[10px] rounded bg-[#161B22] border border-[#30363D] text-slate-300"
                        />
                        <button
                          type="submit"
                          className="w-1/2 py-1 text-[10px] font-bold rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                          حفظ ✓
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
