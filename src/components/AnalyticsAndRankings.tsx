import React from 'react';
import { MonthData, OverallSummary } from '../types';
import { calculateDailyStats } from '../utils/calculations';
import { Trophy, AlertTriangle, Sparkles, TrendingDown, ArrowUpRight, Flame, BarChart3 } from 'lucide-react';
import { CATEGORY_LABELS } from '../data/defaultData';

interface AnalyticsAndRankingsProps {
  monthData: MonthData;
  summary: OverallSummary;
}

export const AnalyticsAndRankings: React.FC<AnalyticsAndRankingsProps> = ({ monthData, summary }) => {
  const days = monthData.daysCount;
  
  // Calculate max completion for scaling chart
  const dailyData = Array.from({ length: days }, (_, i) => calculateDailyStats(i + 1, monthData));
  const maxRate = 100;

  return (
    <div className="space-y-6">
      {/* 1. Monthly Commitment Evolution Chart */}
      <div id="analytics-chart-card" className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">رسم بياني لتطور الالتزام اليومي خلال الشهر</h3>
              <p className="text-xs text-slate-400">تتبع نسبة إنجاز كافة العادات اليومية يوماً بيوم</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">ممتاز (&gt;=70%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-slate-300">متوسط (40-69%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-700"></span>
              <span className="text-slate-300">منخفض (&lt;40%)</span>
            </div>
          </div>
        </div>

        {/* Visual Dynamic Bar Chart */}
        <div className="relative pt-6 pb-2">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pb-8">
            <div className="border-b border-[#30363D] w-full flex justify-end pr-2 text-[10px] text-slate-400">100%</div>
            <div className="border-b border-[#30363D] w-full flex justify-end pr-2 text-[10px] text-slate-400">75%</div>
            <div className="border-b border-[#30363D] w-full flex justify-end pr-2 text-[10px] text-slate-400">50%</div>
            <div className="border-b border-[#30363D] w-full flex justify-end pr-2 text-[10px] text-slate-400">25%</div>
            <div className="border-b border-[#30363D] w-full"></div>
          </div>

          <div className="grid grid-flow-col auto-cols-fr gap-1 sm:gap-2 items-end h-48 sm:h-56 z-10 relative px-1">
            {dailyData.map((d) => {
              const heightPercent = Math.max(4, (d.percentage / maxRate) * 100);
              const isHigh = d.percentage >= 70;
              const isMedium = d.percentage >= 40 && d.percentage < 70;
              const isToday = d.day === new Date().getDate() && monthData.month === (new Date().getMonth() + 1);

              return (
                <div key={`chart-bar-${d.day}`} className="flex flex-col items-center group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 bg-[#0B0E14] border border-[#30363D] text-white text-[11px] rounded-lg px-2.5 py-1 shadow-xl pointer-events-none whitespace-nowrap z-30">
                    يوم {d.day}: <span className="text-indigo-400 font-bold">{d.percentage}%</span> ({d.completedCount}/{d.totalHabits})
                  </div>

                  {/* The Bar */}
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative group-hover:brightness-125 ${
                      isHigh
                        ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 shadow-md shadow-emerald-500/20'
                        : isMedium
                        ? 'bg-gradient-to-t from-indigo-800 via-indigo-600 to-purple-400 shadow-md shadow-indigo-600/20'
                        : d.completedCount > 0
                        ? 'bg-gradient-to-t from-slate-800 to-slate-700'
                        : 'bg-[#21262D]'
                    } ${isToday ? 'ring-2 ring-indigo-400' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {d.percentage > 0 && (
                      <span className="hidden sm:block text-[9px] font-bold text-center text-white/90 pt-1">
                        {d.percentage >= 50 ? `${d.percentage}%` : ''}
                      </span>
                    )}
                  </div>

                  {/* Day Label */}
                  <span className={`text-[10px] mt-2 font-mono ${isToday ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Top 5 Best Habits & Bottom 5 Habits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Habits */}
        <div id="top-habits-card" className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">أكثر العادات التزامًا (Top 5)</h3>
                <p className="text-xs text-slate-400">العادات الأكثر إنجازاً واستقراراً هذا الشهر</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              أبطال الالتزام 🏆
            </span>
          </div>

          <div className="space-y-3">
            {summary.topHabits.map((habit, idx) => {
              const catInfo = CATEGORY_LABELS[habit.category] || CATEGORY_LABELS.learning;
              return (
                <div
                  key={`top-habit-${habit.habitId}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117]/70 border border-[#21262D] hover:border-[#238636]/60 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                        {habit.habitName}
                      </h4>
                      <span className="text-[10px] text-slate-400">{catInfo.label} • أنجزت {habit.completedDays} يوماً</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400">{habit.percentage}%</span>
                      <div className="w-16 sm:w-24 bg-[#21262D] rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                          style={{ width: `${habit.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom 5 Habits */}
        <div id="bottom-habits-card" className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">أقل العادات التزامًا</h3>
                <p className="text-xs text-slate-400">عادات تحتاج إلى تركيز ومضاعفة الجهد لتثبيتها</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              فرصة للتطوير 🎯
            </span>
          </div>

          <div className="space-y-3">
            {summary.bottomHabits.map((habit, idx) => {
              const catInfo = CATEGORY_LABELS[habit.category] || CATEGORY_LABELS.learning;
              return (
                <div
                  key={`bottom-habit-${habit.habitId}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117]/70 border border-[#21262D] hover:border-rose-500/40 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-300 font-bold text-xs flex items-center justify-center border border-rose-500/30">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                        {habit.habitName}
                      </h4>
                      <span className="text-[10px] text-slate-400">{catInfo.label} • أنجزت {habit.completedDays} يوماً فقط</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-rose-400">{habit.percentage}%</span>
                      <div className="w-16 sm:w-24 bg-[#21262D] rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
                          style={{ width: `${Math.max(4, habit.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Weekly Progress Breakdown */}
      <div id="weekly-progress-card" className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-2xl backdrop-blur-md">
        <h3 className="text-base font-bold text-white mb-1">التقدم الأسبوعي التراكمي</h3>
        <p className="text-xs text-slate-400 mb-4">معدل الإنجاز موزعاً على أسابيع الشهر الأربعة</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.weeklyProgress.map((wp) => (
            <div
              key={`weekly-prog-${wp.week}`}
              className="p-4 rounded-xl bg-[#0D1117]/70 border border-[#21262D] hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-300">{wp.name}</span>
                <span className="font-extrabold text-indigo-400">{wp.percentage}%</span>
              </div>
              <div className="w-full bg-[#21262D] rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${wp.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>المنجز: {wp.completed}</span>
                <span>المستهدف: {wp.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
