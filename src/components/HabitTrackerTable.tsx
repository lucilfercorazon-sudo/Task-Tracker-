import React, { useState } from 'react';
import { Habit, MonthData } from '../types';
import { calculateHabitStats, calculateDailyStats } from '../utils/calculations';
import { CATEGORY_LABELS } from '../data/defaultData';
import { Check, Flame, Trophy, Plus, Trash2, Edit2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HabitTrackerTableProps {
  monthData: MonthData;
  onToggleCheck: (habitId: string, day: number) => void;
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateHabitName: (habitId: string, newName: string) => void;
}

export const HabitTrackerTable: React.FC<HabitTrackerTableProps> = ({
  monthData,
  onToggleCheck,
  onAddHabit,
  onDeleteHabit,
  onUpdateHabitName,
}) => {
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'health' | 'learning' | 'productivity' | 'mindfulness'>('learning');

  const days = monthData.daysCount;
  const habits = monthData.habits;
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const isCurrentMonth = monthData.month === currentMonth && monthData.year === new Date().getFullYear();

  const handleCellClick = (habitId: string, day: number, currentState: boolean) => {
    onToggleCheck(habitId, day);
    if (!currentState) {
      // Trigger tiny celebratory sparkle
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
      });
    }
  };

  const handleStartEdit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditingName(habit.name);
  };

  const handleSaveEdit = (habitId: string) => {
    if (editingName.trim()) {
      onUpdateHabitName(habitId, editingName.trim());
    }
    setEditingHabitId(null);
  };

  const handleCreateHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit({
      name: newHabitName.trim(),
      category: newHabitCategory,
    });
    setNewHabitName('');
    setIsAddingHabit(false);
  };

  return (
    <div id="habit-tracker-table-container" className="rounded-2xl border border-[#30363D] bg-[#161B22] shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Table Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 border-b border-[#30363D] gap-4 bg-[#111620]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            جدول تتبع العادات اليومية - {monthData.monthNameArabic} {monthData.year}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            اضغط على أي مربع لتسجيل إنجاز اليوم، وستُحدث كافة النسب والصيغ والإحصائيات مباشرة وبشكل فوري
          </p>
        </div>

        <button
          id="btn-add-new-habit"
          onClick={() => setIsAddingHabit(!isAddingHabit)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عادة جديدة</span>
        </button>
      </div>

      {/* Add Habit Form Modal/Drawer */}
      {isAddingHabit && (
        <form onSubmit={handleCreateHabitSubmit} className="p-4 bg-[#0D1117] border-b border-[#30363D] flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="اسم العادة الجديدة (مثلاً: قراءة 15 دقيقة)"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="flex-1 min-w-[240px] px-3.5 py-2 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            autoFocus
          />
          <select
            value={newHabitCategory}
            onChange={(e) => setNewHabitCategory(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-[#161B22] border border-[#30363D] text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            <option value="learning">تعلم وتطوير</option>
            <option value="health">صحة ولياقة</option>
            <option value="productivity">إنتاجية وعمل</option>
            <option value="mindfulness">راحة ووعي</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
          >
            حفظ العادة
          </button>
          <button
            type="button"
            onClick={() => setIsAddingHabit(false)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#21262D] hover:bg-[#30363D] text-slate-300 transition-all"
          >
            إلغاء
          </button>
        </form>
      )}

      {/* Responsive Scrollable Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse select-none min-w-[1100px]">
          <thead>
            {/* Header Row 1: Columns title */}
            <tr className="bg-[#111620] border-b border-[#30363D] text-xs font-bold text-slate-300">
              <th className="sticky right-0 z-20 bg-[#111620] py-3 px-4 min-w-[260px] border-l border-[#30363D] shadow-md">
                العادة اليومية ({habits.length})
              </th>
              <th className="py-3 px-2 text-center min-w-[90px] border-l border-[#21262D]">
                التصنيف
              </th>

              {/* Day Headers 1 to N */}
              {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                const isToday = isCurrentMonth && day === today;
                return (
                  <th
                    key={`day-header-${day}`}
                    className={`py-2 px-1 text-center min-w-[34px] w-9 border-l border-[#21262D] transition-colors ${
                      isToday ? 'bg-indigo-950/60 text-indigo-300 font-extrabold ring-1 ring-indigo-400/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] opacity-70">يوم</span>
                      <span className={`text-xs ${isToday ? 'text-indigo-300 font-bold' : ''}`}>{day}</span>
                    </div>
                  </th>
                );
              })}

              <th className="py-3 px-3 text-center min-w-[85px] border-l border-[#30363D] text-emerald-400">
                الأيام
              </th>
              <th className="py-3 px-3 text-center min-w-[100px] border-l border-[#30363D] text-indigo-400">
                النسبة %
              </th>
              <th className="py-3 px-3 text-center min-w-[100px] text-amber-400">
                سلسلة
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#21262D] text-xs">
            {habits.map((habit, index) => {
              const stats = calculateHabitStats(habit, monthData);
              const catInfo = CATEGORY_LABELS[habit.category] || CATEGORY_LABELS.learning;

              return (
                <tr
                  key={habit.id}
                  id={`habit-row-${habit.id}`}
                  className="hover:bg-[#1c232c]/50 transition-colors group"
                >
                  {/* Habit Name Column (Sticky on RTL) */}
                  <td className="sticky right-0 z-10 bg-[#161B22] group-hover:bg-[#1c232c] py-2.5 px-4 border-l border-[#30363D] shadow-md">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-[10px] text-slate-500 font-mono w-4">{index + 1}</span>
                        {editingHabitId === habit.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleSaveEdit(habit.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(habit.id)}
                            className="bg-[#0B0E14] border border-indigo-400 text-white rounded px-2 py-0.5 text-xs focus:outline-none w-full"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-slate-200 truncate group-hover:text-indigo-200 transition-colors">
                            {habit.name}
                          </span>
                        )}
                      </div>

                      {/* Action buttons (Rename / Delete) */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(habit)}
                          title="تعديل اسم العادة"
                          className="p-1 hover:text-indigo-400 text-slate-500 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          title="حذف العادة"
                          className="p-1 hover:text-rose-400 text-slate-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Category Pill */}
                  <td className="py-2 px-2 text-center border-l border-[#21262D]">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border ${catInfo.badgeBg} whitespace-nowrap`}>
                      {catInfo.label}
                    </span>
                  </td>

                  {/* Day Checkboxes */}
                  {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                    const isChecked = monthData.records[day]?.[habit.id] ?? false;
                    const isToday = isCurrentMonth && day === today;

                    return (
                      <td
                        key={`cell-${habit.id}-${day}`}
                        className={`py-1 px-1 text-center border-l border-[#21262D] ${
                          isToday ? 'bg-indigo-950/20' : ''
                        }`}
                      >
                        <button
                          type="button"
                          id={`checkbox-${habit.id}-day-${day}`}
                          onClick={() => handleCellClick(habit.id, day, isChecked)}
                          className={`w-6 h-6 mx-auto rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isChecked
                              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 scale-105 hover:from-indigo-500 hover:to-purple-500'
                              : 'bg-[#0D1117] border border-[#30363D] hover:border-indigo-500/60 hover:bg-indigo-950/30 text-transparent'
                          } ${isToday && !isChecked ? 'ring-1 ring-indigo-500/40' : ''}`}
                          title={`يوم ${day} - ${habit.name}: ${isChecked ? 'مكتمل ✓' : 'غير مكتمل'}`}
                        >
                          <Check className={`w-3.5 h-3.5 stroke-[3] ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                      </td>
                    );
                  })}

                  {/* Completed Days Count */}
                  <td className="py-2.5 px-3 text-center border-l border-[#30363D] font-semibold text-emerald-400 bg-[#0D1117]/40">
                    {stats.completedDays} / {days}
                  </td>

                  {/* Commitment Percentage */}
                  <td className="py-2.5 px-3 text-center border-l border-[#30363D] bg-[#0D1117]/40">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`font-bold ${stats.percentage >= 70 ? 'text-indigo-400' : stats.percentage >= 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {stats.percentage}%
                      </span>
                    </div>
                  </td>

                  {/* Best / Current Streak */}
                  <td className="py-2.5 px-3 text-center text-amber-300 font-semibold bg-[#0D1117]/40">
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400 inline" />
                      <span>{stats.bestStreak} د</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer with Automated Daily Column Calculations */}
          <tfoot className="border-t-2 border-[#30363D] text-xs font-bold">
            {/* Daily Total Completed Row */}
            <tr className="bg-[#111620] text-slate-300 border-b border-[#30363D]">
              <td className="sticky right-0 z-20 bg-[#111620] py-3 px-4 border-l border-[#30363D] text-slate-200">
                📌 إجمالي الإنجاز اليومي
              </td>
              <td className="py-3 px-2 text-center text-slate-400 border-l border-[#21262D]">
                مجموع
              </td>
              {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                const daily = calculateDailyStats(day, monthData);
                const isToday = isCurrentMonth && day === today;
                return (
                  <td
                    key={`daily-sum-${day}`}
                    className={`py-2 px-1 text-center font-bold border-l border-[#21262D] ${
                      isToday ? 'bg-indigo-950/50 text-indigo-300' : daily.completedCount > 0 ? 'text-indigo-300' : 'text-slate-500'
                    }`}
                  >
                    {daily.completedCount}
                  </td>
                );
              })}
              <td className="py-3 px-3 text-center border-l border-[#30363D] text-emerald-400 font-extrabold">
                {habits.reduce((acc, h) => acc + calculateHabitStats(h, monthData).completedDays, 0)}
              </td>
              <td className="py-3 px-3 text-center border-l border-[#30363D] text-indigo-400" colSpan={2}>
                المجموع العام
              </td>
            </tr>

            {/* Daily Percentage Rate Row */}
            <tr className="bg-[#0D1117] text-slate-300">
              <td className="sticky right-0 z-20 bg-[#0D1117] py-3 px-4 border-l border-[#30363D] text-indigo-300">
                ⚡ نسبة الالتزام اليومية %
              </td>
              <td className="py-3 px-2 text-center text-slate-400 border-l border-[#21262D]">
                معدل
              </td>
              {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                const daily = calculateDailyStats(day, monthData);
                const isToday = isCurrentMonth && day === today;
                return (
                  <td
                    key={`daily-pct-${day}`}
                    className={`py-2 px-1 text-center font-bold text-[11px] border-l border-[#21262D] ${
                      isToday ? 'bg-indigo-950/60 text-indigo-300' : daily.percentage >= 70 ? 'text-emerald-400' : daily.percentage >= 40 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {daily.percentage}%
                  </td>
                );
              })}
              <td className="py-3 px-3 text-center border-l border-[#30363D] text-indigo-300 font-extrabold" colSpan={3}>
                معدل الشهر
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
