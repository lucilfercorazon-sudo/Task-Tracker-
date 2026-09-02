import { TaskData } from '../types';

export const getDefaultTaskData = (): TaskData => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  return {
    categories: ['العمل والمشاريع', 'تطوير الذات', 'الصحة واللياقة', 'المنزل والعائلة', 'المالية'],
    tasks: [
      {
        id: 'task-1',
        title: 'مراجعة الميزانية الشهرية وضبط أرقام الادخار',
        completed: true,
        priority: 'high',
        category: 'المالية',
        dueDate: todayStr,
        createdAt: todayStr,
        completedAt: todayStr,
        notes: 'تم فحص بنود الصرف وحجز مبلغ الطوارئ',
      },
      {
        id: 'task-2',
        title: 'تسليم المسودة النهائية لمشروع العميل',
        completed: false,
        priority: 'high',
        category: 'العمل والمشاريع',
        dueDate: todayStr,
        createdAt: todayStr,
        notes: 'إرسال الملفات وملاحظات العرض التقديمي',
      },
      {
        id: 'task-3',
        title: 'قراءة 20 صفحة من كتاب العادات الذرية',
        completed: true,
        priority: 'medium',
        category: 'تطوير الذات',
        dueDate: todayStr,
        createdAt: todayStr,
        completedAt: todayStr,
      },
      {
        id: 'task-4',
        title: 'تمرين المقاومة وتمارين الكارديو (45 دقيقة)',
        completed: false,
        priority: 'high',
        category: 'الصحة واللياقة',
        dueDate: todayStr,
        createdAt: todayStr,
      },
      {
        id: 'task-5',
        title: 'شراء الاحتياجات والمؤن المنزلية للأسبوع',
        completed: false,
        priority: 'medium',
        category: 'المنزل والعائلة',
        dueDate: todayStr,
        createdAt: todayStr,
      },
      {
        id: 'task-6',
        title: 'الاستماع إلى بودكاست في التخطيط والإنتاجية',
        completed: true,
        priority: 'low',
        category: 'تطوير الذات',
        dueDate: todayStr,
        createdAt: todayStr,
        completedAt: todayStr,
      },
      {
        id: 'task-7',
        title: 'تنظيف وترتيب مساحة العمل والمكتب',
        completed: false,
        priority: 'low',
        category: 'المنزل والعائلة',
        dueDate: todayStr,
        createdAt: todayStr,
      }
    ]
  };
};
