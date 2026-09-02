import React from 'react';
import { CheckCircle2, XCircle, TrendingUp, Flame, ListCheck, Calendar, Sparkles } from 'lucide-react';
import { OverallSummary, MonthData } from '../types';

interface StatsOverviewProps {
  summary: OverallSummary;
  monthData: MonthData;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ summary, monthData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Completed Habits Counter */}
      <div 
        id="kpi-completed-card" 
        className="relative overflow-hidden rounded-2xl bg-[#161B22] border border-[#30363D] p-5 shadow-lg shadow-black/30 backdrop-blur-sm group hover:border-[#238636] transition-all duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wide text-slate-400">إجمالي العادات المكتملة</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{summary.totalCompletedChecks}</span>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                من أصل {summary.totalPossibleChecks}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>المعدل المنجز حتى الآن</span>
          <span className="text-slate-200 font-semibold">{summary.overallCompletionRate}%</span>
        </div>
      </div>

      {/* 2. Uncompleted Habits Counter */}
      <div 
        id="kpi-uncompleted-card" 
        className="relative overflow-hidden rounded-2xl bg-[#161B22] border border-[#30363D] p-5 shadow-lg shadow-black/30 backdrop-blur-sm group hover:border-rose-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wide text-slate-400">إجمالي غير المكتملة</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{summary.totalUncompletedChecks}</span>
              <span className="text-xs text-slate-400 font-medium bg-[#21262D] px-2 py-0.5 rounded-full border border-[#30363D]">
                باقي للمتابعة
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>فرص الإنجاز المتبقية</span>
          <span className="text-rose-300 font-semibold">{100 - summary.overallCompletionRate}%</span>
        </div>
      </div>

      {/* 3. Overall Commitment Average % */}
      <div 
        id="kpi-average-card" 
        className="relative overflow-hidden rounded-2xl bg-[#161B22] border border-[#30363D] p-5 shadow-lg shadow-black/30 backdrop-blur-sm group hover:border-indigo-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wide text-slate-400">متوسط الالتزام العام</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-400 tracking-tight">{summary.overallCompletionRate}%</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                summary.overallCompletionRate >= 70
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : summary.overallCompletionRate >= 50
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
              }`}>
                {summary.overallCompletionRate >= 80 ? 'أداء استثنائي' : summary.overallCompletionRate >= 60 ? 'تقدم مستمر' : 'في بداية المسار'}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 w-full bg-[#21262D] rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, summary.overallCompletionRate))}%` }}
          />
        </div>
      </div>

      {/* 4. Best Streak Days */}
      <div 
        id="kpi-streak-card" 
        className="relative overflow-hidden rounded-2xl bg-[#161B22] border border-[#30363D] p-5 shadow-lg shadow-black/30 backdrop-blur-sm group hover:border-amber-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wide text-slate-400">أفضل سلسلة أيام متتالية</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400 tracking-tight">{summary.bestStreakDays}</span>
              <span className="text-xs text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                أيام متواصلة 🔥
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>السلسلة الحالية</span>
          <span className="text-amber-300 font-semibold">{summary.currentStreakDays} أيام</span>
        </div>
      </div>
    </div>
  );
};
