import { Habit, MonthData } from '../types';

export const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', name: 'الاستيقاظ الساعة 6:00 صباحًا', category: 'productivity', color: '#6366f1' },
  { id: 'h2', name: 'تطبيق مشروع AI صغير', category: 'learning', color: '#8b5cf6' },
  { id: 'h3', name: 'مشاهدة دورة تعليمية', category: 'learning', color: '#a855f7' },
  { id: 'h4', name: 'المشي 1 كم', category: 'health', color: '#06b6d4' },
  { id: 'h5', name: 'ترك الهاتف أول 60 دقيقة بعد الاستيقاظ', category: 'mindfulness', color: '#ec4899' },
  { id: 'h6', name: 'تعلم لغة جديدة 15 دقيقة', category: 'learning', color: '#3b82f6' },
  { id: 'h7', name: 'تنظيم الملفات والملاحظات', category: 'productivity', color: '#10b981' },
  { id: 'h8', name: 'تعلم مهارة جديدة', category: 'learning', color: '#8b5cf6' },
  { id: 'h9', name: 'تعلم مهارة لمدة 20 دقيقة', category: 'learning', color: '#6366f1' },
  { id: 'h10', name: 'أكل وجبات صحية', category: 'health', color: '#10b981' },
  { id: 'h11', name: 'شرب 10 أكواب ماء', category: 'health', color: '#06b6d4' },
  { id: 'h12', name: 'القراءة 10 صفحات', category: 'mindfulness', color: '#f59e0b' },
  { id: 'h13', name: 'التمرين الرياضي', category: 'health', color: '#ef4444' },
  { id: 'h14', name: 'تعلم أداة من أدوات الذكاء الاصطناعي', category: 'learning', color: '#a855f7' },
  { id: 'h15', name: 'الابتعاد عن الشاشات قبل النوم بـ60 دقيقة', category: 'mindfulness', color: '#ec4899' },
  { id: 'h16', name: 'النوم 7–8 ساعات يوميًا', category: 'health', color: '#6366f1' },
];

export const ARABIC_MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const DAYS_ARABIC_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function generateInitialMonthData(year?: number, month?: number): MonthData {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? (now.getMonth() + 1);
  const daysCount = getDaysInMonth(y, m);
  
  // Sample realistic initial checked states for pre-filling days before today for an engaging experience
  const currentDay = now.getDate();
  const sampleRecords: { [day: number]: { [habitId: string]: boolean } } = {};
  
  for (let day = 1; day <= daysCount; day++) {
    sampleRecords[day] = {};
    if (day <= Math.min(currentDay, 18)) {
      // populate with realistic sample data
      DEFAULT_HABITS.forEach((h, idx) => {
        // High completion for morning / water / sleep, moderate for others
        const seed = (day * 17 + idx * 23) % 100;
        const threshold = (idx === 0 || idx === 10 || idx === 15) ? 25 : (idx % 2 === 0 ? 40 : 55);
        sampleRecords[day][h.id] = seed > threshold;
      });
    } else {
      DEFAULT_HABITS.forEach(h => {
        sampleRecords[day][h.id] = false;
      });
    }
  }

  return {
    year: y,
    month: m,
    monthNameArabic: ARABIC_MONTH_NAMES[m - 1],
    daysCount,
    habits: DEFAULT_HABITS,
    records: sampleRecords,
    notes: {}
  };
}

export const CATEGORY_LABELS: Record<string, { label: string; color: string; badgeBg: string }> = {
  health: { label: 'صحة ولياقة', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  learning: { label: 'تعلم وتطوير', color: 'text-purple-400', badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
  productivity: { label: 'إنتاجية وعمل', color: 'text-blue-400', badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  mindfulness: { label: 'راحة ووعي', color: 'text-pink-400', badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/20' },
};
