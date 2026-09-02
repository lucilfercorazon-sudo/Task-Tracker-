export interface Habit {
  id: string;
  name: string;
  category: 'health' | 'learning' | 'productivity' | 'mindfulness';
  targetDays?: number;
  color?: string;
  icon?: string;
}

export interface DayRecord {
  // habitId -> boolean
  [habitId: string]: boolean;
}

export interface MonthData {
  year: number;
  month: number; // 1 to 12
  monthNameArabic: string;
  daysCount: number;
  habits: Habit[];
  records: {
    // day number 1-31 -> { habitId: boolean }
    [day: number]: DayRecord;
  };
  notes?: {
    [day: number]: string;
  };
  connectedSheetId?: string;
  connectedSheetUrl?: string;
  lastSyncedAt?: string;
}

export interface HabitStats {
  habitId: string;
  habitName: string;
  category: string;
  completedDays: number;
  totalDays: number;
  percentage: number;
  currentStreak: number;
  bestStreak: number;
}

export interface DailyStats {
  day: number;
  completedCount: number;
  totalHabits: number;
  percentage: number;
}

export interface OverallSummary {
  totalCompletedChecks: number;
  totalPossibleChecks: number;
  totalUncompletedChecks: number;
  overallCompletionRate: number;
  activeHabitsCount: number;
  bestStreakDays: number;
  currentStreakDays: number;
  topHabits: HabitStats[];
  bottomHabits: HabitStats[];
  weeklyProgress: {
    week: number;
    name: string;
    completed: number;
    total: number;
    percentage: number;
  }[];
}

// ==========================================
// 💰 Finance Tracker Types
// ==========================================
export type TransactionType = 'income' | 'expense';

export interface FinanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  notes?: string;
}

export interface BudgetLimit {
  category: string;
  monthlyLimit: number;
}

export interface FinanceData {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  currency: string;
}

// ==========================================
// ✅ Task Tracker Types
// ==========================================
export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  category: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface TaskData {
  tasks: TaskItem[];
  categories: string[];
}

// ==========================================
// 📅 Weekly Planner Types
// ==========================================
export type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface WeeklyPlanItem {
  id: string;
  time?: string;
  title: string;
  done: boolean;
  priority?: TaskPriority;
  tag?: string;
}

export interface DaySchedule {
  dayKey: DayKey;
  dayNameArabic: string;
  dateStr: string;
  items: WeeklyPlanItem[];
}

export interface WeeklyPlannerData {
  currentWeekStartDate: string; // YYYY-MM-DD (Sunday)
  weeklyGoals: { id: string; text: string; done: boolean }[];
  weeklyNotes: string;
  days: {
    [key in DayKey]: WeeklyPlanItem[];
  };
}

