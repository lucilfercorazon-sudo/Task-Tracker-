import { WeeklyPlannerData, DayKey } from '../types';

export const DAYS_CONFIG: { key: DayKey; nameArabic: string; shortName: string }[] = [
  { key: 'sunday', nameArabic: 'الأحد', shortName: 'أحد' },
  { key: 'monday', nameArabic: 'الاثنين', shortName: 'اثنين' },
  { key: 'tuesday', nameArabic: 'الثلاثاء', shortName: 'ثلاثاء' },
  { key: 'wednesday', nameArabic: 'الأربعاء', shortName: 'أربعاء' },
  { key: 'thursday', nameArabic: 'الخميس', shortName: 'خميس' },
  { key: 'friday', nameArabic: 'الجمعة', shortName: 'جمعة' },
  { key: 'saturday', nameArabic: 'السبت', shortName: 'سبت' },
];

export const getDefaultWeeklyPlannerData = (): WeeklyPlannerData => {
  const today = new Date();
  // Get Sunday of current week
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  const sundayStr = sunday.toISOString().split('T')[0];

  return {
    currentWeekStartDate: sundayStr,
    weeklyGoals: [
      { id: 'wg-1', text: 'إنهاء تسليم مشروع العمل بجودة عالية', done: false },
      { id: 'wg-2', text: 'الالتزام بـ 4 جلسات رياضية خلال الأسبوع', done: true },
      { id: 'wg-3', text: 'التحكم في مصاريف الكافيهات والمطاعم تحت الميزانية', done: true },
      { id: 'wg-4', text: 'قراءة 50 صفحة وتلخيص الأفكار الرئيسية', done: false },
    ],
    weeklyNotes: 'التركيز هذا الأسبوع على الإنتاجية العميقة في الصباح وتجنب المشتتات بعد المغرب.',
    days: {
      sunday: [
        { id: 'item-su-1', time: '08:30 ص', title: 'اجتماع تخطيط الأسبوع ومراجعة الأولويات', done: true, priority: 'high', tag: 'عمل' },
        { id: 'item-su-2', time: '11:00 ص', title: 'جلسة عمل مركزة على كود المشروع', done: true, priority: 'high', tag: 'تطوير' },
        { id: 'item-su-3', time: '05:30 م', title: 'تمرين نادي رياضي (صدر وتراي)', done: true, priority: 'medium', tag: 'صحة' },
      ],
      monday: [
        { id: 'item-mo-1', time: '09:00 ص', title: 'مراجعة التصاميم مع فريق العمل', done: true, priority: 'medium', tag: 'عمل' },
        { id: 'item-mo-2', time: '02:00 م', title: 'إرسال التقرير المالي الأسبوعي', done: false, priority: 'high', tag: 'مالية' },
        { id: 'item-mo-3', time: '08:00 م', title: 'قراءة 20 دقيقة قبل النوم', done: true, priority: 'low', tag: 'تطوير' },
      ],
      tuesday: [
        { id: 'item-tu-1', time: '08:00 ص', title: 'تمرين جري صباحي خفيف 5 كم', done: false, priority: 'medium', tag: 'صحة' },
        { id: 'item-tu-2', time: '10:30 ص', title: 'مكالمة هاتفية مع العميل لمناقشة التعديلات', done: true, priority: 'high', tag: 'اجتماع' },
        { id: 'item-tu-3', time: '04:00 م', title: 'تسوق مستلزمات المنزل الأساسية', done: false, priority: 'low', tag: 'منزل' },
      ],
      wednesday: [
        { id: 'item-we-1', time: '09:30 ص', title: 'إطلاق النسخة التجريبية للموقع', done: false, priority: 'high', tag: 'إطلاق' },
        { id: 'item-we-2', time: '06:00 م', title: 'جلسة تدريب وبناء عضلات (ظهر وباي)', done: false, priority: 'medium', tag: 'صحة' },
        { id: 'item-we-3', time: '09:00 م', title: 'متابعة دورة البرمجة وإتمام الاختبار', done: false, priority: 'medium', tag: 'تعليم' },
      ],
      thursday: [
        { id: 'item-th-1', time: '10:00 ص', title: 'إنهاء كافة المهام المعلقة للأسبوع', done: false, priority: 'high', tag: 'عمل' },
        { id: 'item-th-2', time: '03:00 م', title: 'تحديث بيانات ميزانية المصروفات والأرباح', done: false, priority: 'medium', tag: 'مالية' },
        { id: 'item-th-3', time: '07:30 م', title: 'جلسة عائلية / لقاء الأصدقاء', done: false, priority: 'low', tag: 'اجتماعي' },
      ],
      friday: [
        { id: 'item-fr-1', time: '11:30 ص', title: 'صلاة الجمعة وقراءة سورة الكهف', done: false, priority: 'high', tag: 'روحانيات' },
        { id: 'item-fr-2', time: '04:30 م', title: 'زيارة الأقارب وصلة الرحم', done: false, priority: 'medium', tag: 'عائلة' },
        { id: 'item-fr-3', time: '08:30 م', title: 'وقت استرخاء ومتابعة فيلم مفضل', done: false, priority: 'low', tag: 'راحة' },
      ],
      saturday: [
        { id: 'item-sa-1', time: '10:00 ص', title: 'تنظيم وترتيب المنزل وغسيل الملابس', done: false, priority: 'medium', tag: 'منزل' },
        { id: 'item-sa-2', time: '01:00 م', title: 'مراجعة وتقييم إنجازات الأسبوع المنصرم', done: false, priority: 'high', tag: 'تقييم' },
        { id: 'item-sa-3', time: '07:00 م', title: 'تحديد خطة وأولويات الأسبوع القادم', done: false, priority: 'high', tag: 'تخطيط' },
      ],
    }
  };
};
