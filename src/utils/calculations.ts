import { MonthData, HabitStats, DailyStats, OverallSummary, Habit } from '../types';
import { getDaysInMonth, ARABIC_MONTH_NAMES } from '../data/defaultData';

export function calculateHabitStats(habit: Habit, monthData: MonthData): HabitStats {
  let completedDays = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const days = monthData.daysCount;
  
  for (let d = 1; d <= days; d++) {
    const isDone = monthData.records[d]?.[habit.id] ?? false;
    if (isDone) {
      completedDays++;
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak backwards from today or last filled day
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = monthData.month === currentMonth && monthData.year === currentYear;

  const startDayForCurrentStreak = isCurrentMonth ? Math.min(today, days) : days;
  let cur = 0;
  for (let d = startDayForCurrentStreak; d >= 1; d--) {
    const isDone = monthData.records[d]?.[habit.id] ?? false;
    if (isDone) {
      cur++;
    } else {
      // If today is not done yet, don't break streak if yesterday was done
      if (d === startDayForCurrentStreak && isCurrentMonth) {
        continue;
      }
      break;
    }
  }
  currentStreak = cur;

  const percentage = days > 0 ? Math.round((completedDays / days) * 100) : 0;

  return {
    habitId: habit.id,
    habitName: habit.name,
    category: habit.category,
    completedDays,
    totalDays: days,
    percentage,
    currentStreak,
    bestStreak
  };
}

export function calculateDailyStats(day: number, monthData: MonthData): DailyStats {
  const habits = monthData.habits;
  const totalHabits = habits.length;
  if (totalHabits === 0) {
    return { day, completedCount: 0, totalHabits: 0, percentage: 0 };
  }

  let completedCount = 0;
  habits.forEach(h => {
    if (monthData.records[day]?.[h.id]) {
      completedCount++;
    }
  });

  const percentage = Math.round((completedCount / totalHabits) * 100);

  return {
    day,
    completedCount,
    totalHabits,
    percentage
  };
}

export function calculateOverallSummary(monthData: MonthData): OverallSummary {
  const habits = monthData.habits;
  const days = monthData.daysCount;
  const totalPossibleChecks = habits.length * days;

  let totalCompletedChecks = 0;

  const habitStatsList = habits.map(h => calculateHabitStats(h, monthData));

  habitStatsList.forEach(s => {
    totalCompletedChecks += s.completedDays;
  });

  const totalUncompletedChecks = Math.max(0, totalPossibleChecks - totalCompletedChecks);
  const overallCompletionRate = totalPossibleChecks > 0 ? Math.round((totalCompletedChecks / totalPossibleChecks) * 100) : 0;

  // Sorted habits
  const sortedHabits = [...habitStatsList].sort((a, b) => b.percentage - a.percentage);
  const topHabits = sortedHabits.slice(0, 5);
  const bottomHabits = [...sortedHabits].reverse().slice(0, 5);

  // Overall daily streaks
  let bestDayStreak = 0;
  let currentDayStreak = 0;
  let tempStreak = 0;

  for (let d = 1; d <= days; d++) {
    const daily = calculateDailyStats(d, monthData);
    // If completed at least 50% of habits or any habit done
    if (daily.completedCount > 0 && daily.percentage >= 40) {
      tempStreak++;
      if (tempStreak > bestDayStreak) bestDayStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = monthData.month === currentMonth && monthData.year === currentYear;
  const startDay = isCurrentMonth ? Math.min(today, days) : days;

  let curStreak = 0;
  for (let d = startDay; d >= 1; d--) {
    const daily = calculateDailyStats(d, monthData);
    if (daily.percentage >= 40) {
      curStreak++;
    } else {
      if (d === startDay && isCurrentMonth) continue;
      break;
    }
  }
  currentDayStreak = curStreak;

  // Weekly breakdown (Week 1: days 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22-28, Week 5: 29-end)
  const weeks = [
    { week: 1, name: 'الأسبوع الأول (1 - 7)', start: 1, end: Math.min(7, days) },
    { week: 2, name: 'الأسبوع الثاني (8 - 14)', start: 8, end: Math.min(14, days) },
    { week: 3, name: 'الأسبوع الثالث (15 - 21)', start: 15, end: Math.min(21, days) },
    { week: 4, name: 'الأسبوع الرابع (22 - 28)', start: 22, end: Math.min(28, days) },
  ];
  if (days > 28) {
    weeks.push({ week: 5, name: `الأسبوع الخامس (29 - ${days})`, start: 29, end: days });
  }

  const weeklyProgress = weeks.map(w => {
    let weekCompleted = 0;
    const weekDays = (w.end - w.start) + 1;
    const weekTotal = habits.length * weekDays;

    for (let d = w.start; d <= w.end; d++) {
      habits.forEach(h => {
        if (monthData.records[d]?.[h.id]) {
          weekCompleted++;
        }
      });
    }

    const percentage = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
    return {
      week: w.week,
      name: w.name,
      completed: weekCompleted,
      total: weekTotal,
      percentage
    };
  });

  return {
    totalCompletedChecks,
    totalPossibleChecks,
    totalUncompletedChecks,
    overallCompletionRate,
    activeHabitsCount: habits.length,
    bestStreakDays: bestDayStreak,
    currentStreakDays: currentDayStreak,
    topHabits,
    bottomHabits,
    weeklyProgress
  };
}
