import { FinanceData, FinanceCategory } from '../types';

export const FINANCE_CATEGORIES: FinanceCategory[] = [
  // Income
  { id: 'salary', name: 'الراتب والدخل الأساسي', icon: 'Wallet', color: 'emerald', type: 'income' },
  { id: 'freelance', name: 'العمل الحر والمشاريع', icon: 'Briefcase', color: 'teal', type: 'income' },
  { id: 'investments', name: 'الاستثمارات والأرباح', icon: 'TrendingUp', color: 'cyan', type: 'income' },
  { id: 'other_income', name: 'دخل إضافي وهدايا', icon: 'Gift', color: 'blue', type: 'income' },

  // Expenses
  { id: 'housing', name: 'السكن والفواتير', icon: 'Home', color: 'indigo', type: 'expense' },
  { id: 'groceries', name: 'السوبرماركت والمؤن', icon: 'ShoppingCart', color: 'amber', type: 'expense' },
  { id: 'dining', name: 'المطاعم والكافيهات', icon: 'Utensils', color: 'orange', type: 'expense' },
  { id: 'transport', name: 'المواصلات والوقود', icon: 'Car', color: 'sky', type: 'expense' },
  { id: 'health', name: 'الصحة والرعاية', icon: 'HeartPulse', color: 'rose', type: 'expense' },
  { id: 'education', name: 'التعليم والكتب والدورات', icon: 'GraduationCap', color: 'purple', type: 'expense' },
  { id: 'entertainment', name: 'الترفيه والاشتراكات', icon: 'Tv', color: 'pink', type: 'expense' },
  { id: 'savings', name: 'الادخار والاستثمار', icon: 'PiggyBank', color: 'emerald', type: 'expense' },
  { id: 'shopping', name: 'التسوق والملابس', icon: 'ShoppingBag', color: 'violet', type: 'expense' },
  { id: 'other_expense', name: 'مصاريف أخرى ونثرية', icon: 'MoreHorizontal', color: 'slate', type: 'expense' },
];

export const getDefaultFinanceData = (): FinanceData => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return {
    currency: 'ر.س',
    budgets: [
      { category: 'housing', monthlyLimit: 3500 },
      { category: 'groceries', monthlyLimit: 1800 },
      { category: 'dining', monthlyLimit: 700 },
      { category: 'transport', monthlyLimit: 600 },
      { category: 'education', monthlyLimit: 400 },
      { category: 'entertainment', monthlyLimit: 300 },
      { category: 'shopping', monthlyLimit: 500 },
      { category: 'health', monthlyLimit: 400 },
    ],
    transactions: [
      {
        id: 'tx-1',
        title: 'الراتب الشهري',
        amount: 14500,
        type: 'income',
        category: 'salary',
        date: `${year}-${month}-01`,
        paymentMethod: 'تحويل بنكي',
        notes: 'إيداع الراتب الأساسي مع البدلات'
      },
      {
        id: 'tx-2',
        title: 'مشروع تصميم موقع واستشارات',
        amount: 2800,
        type: 'income',
        category: 'freelance',
        date: `${year}-${month}-05`,
        paymentMethod: 'تحويل سريع',
        notes: 'الدفعة الأولى للعميل'
      },
      {
        id: 'tx-3',
        title: 'إيجار السكن الشهري',
        amount: 3200,
        type: 'expense',
        category: 'housing',
        date: `${year}-${month}-02`,
        paymentMethod: 'حساب بنكي',
        notes: 'دفعة الإيجار الدورية'
      },
      {
        id: 'tx-4',
        title: 'تسوق السوبرماركت الأسبوعي',
        amount: 460,
        type: 'expense',
        category: 'groceries',
        date: `${year}-${month}-03`,
        paymentMethod: 'بطاقة مدى',
      },
      {
        id: 'tx-5',
        title: 'فاتورة الكهرباء والإنترنت المنزلي',
        amount: 380,
        type: 'expense',
        category: 'housing',
        date: `${year}-${month}-06`,
        paymentMethod: 'سداد',
      },
      {
        id: 'tx-6',
        title: 'وقود السيارة وغسيل',
        amount: 190,
        type: 'expense',
        category: 'transport',
        date: `${year}-${month}-07`,
        paymentMethod: 'بطاقة مدى',
      },
      {
        id: 'tx-7',
        title: 'اشتراك دورة تقنية وكتب برمجية',
        amount: 220,
        type: 'expense',
        category: 'education',
        date: `${year}-${month}-09`,
        paymentMethod: 'بطاقة ائتمانية',
      },
      {
        id: 'tx-8',
        title: 'عشاء مع العائلة في مطعم',
        amount: 260,
        type: 'expense',
        category: 'dining',
        date: `${year}-${month}-11`,
        paymentMethod: 'Apple Pay',
      },
      {
        id: 'tx-9',
        title: 'تحويل لحساب الادخار والاستثمار',
        amount: 3000,
        type: 'expense',
        category: 'savings',
        date: `${year}-${month}-04`,
        paymentMethod: 'تحويل داخلي',
        notes: 'التوفير التلقائي المستهدف'
      },
    ]
  };
};
