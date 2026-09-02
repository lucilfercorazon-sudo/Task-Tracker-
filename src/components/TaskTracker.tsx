import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Filter, 
  Calendar, 
  Tag, 
  AlertCircle, 
  Clock, 
  Sparkles,
  CheckSquare,
  ListTodo,
  TrendingUp,
  Search,
  Check,
  Edit2
} from 'lucide-react';
import { TaskData, TaskItem, TaskPriority } from '../types';

interface TaskTrackerProps {
  taskData: TaskData;
  onUpdateTaskData: (newData: TaskData) => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; badgeClass: string; dotClass: string }> = {
  high: { label: 'أولوية عالية', badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/20', dotClass: 'bg-rose-500' },
  medium: { label: 'أولوية متوسطة', badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20', dotClass: 'bg-amber-500' },
  low: { label: 'أولوية منخفضة', badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', dotClass: 'bg-indigo-500' },
};

export const TaskTracker: React.FC<TaskTrackerProps> = ({
  taskData,
  onUpdateTaskData,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Add State
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newCategory, setNewCategory] = useState(taskData.categories[0] || 'عام');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [customCatInput, setCustomCatInput] = useState('');

  // Stats Calculations
  const stats = useMemo(() => {
    const total = taskData.tasks.length;
    const completed = taskData.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const highPriorityRemaining = taskData.tasks.filter(t => !t.completed && t.priority === 'high').length;

    return { total, completed, pending, rate, highPriorityRemaining };
  }, [taskData.tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return taskData.tasks.filter((task) => {
      if (filterStatus === 'pending' && task.completed) return false;
      if (filterStatus === 'completed' && !task.completed) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchCat = task.category.toLowerCase().includes(q);
        const matchNotes = task.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchNotes) return false;
      }
      return true;
    });
  }, [taskData.tasks, filterStatus, filterPriority, filterCategory, searchQuery]);

  // Handlers
  const handleToggleTask = (id: string) => {
    const now = new Date().toISOString().split('T')[0];
    const updated = taskData.tasks.map((task) => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? now : undefined,
        };
      }
      return task;
    });
    onUpdateTaskData({ ...taskData, tasks: updated });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let categoryToUse = newCategory;
    let categoriesList = [...taskData.categories];

    if (isAddingNewCat && customCatInput.trim()) {
      categoryToUse = customCatInput.trim();
      if (!categoriesList.includes(categoryToUse)) {
        categoriesList.push(categoryToUse);
      }
    }

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      category: categoryToUse,
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onUpdateTaskData({
      categories: categoriesList,
      tasks: [newTask, ...taskData.tasks],
    });

    setNewTitle('');
    setCustomCatInput('');
    setIsAddingNewCat(false);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTaskData({
      ...taskData,
      tasks: taskData.tasks.filter(t => t.id !== id),
    });
  };

  const handleClearCompleted = () => {
    if (window.confirm('هل تريد حذف جميع المهام المنجزة؟')) {
      onUpdateTaskData({
        ...taskData,
        tasks: taskData.tasks.filter(t => !t.completed),
      });
    }
  };

  return (
    <div id="task-tracker-container" className="space-y-6 text-right">
      {/* 1. Task Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ListTodo className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 px-2 py-0.5 rounded-full bg-[#21262D] border border-[#30363D]">
              إجمالي المهام
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats.total} <span className="text-sm font-normal text-slate-400">مهمة</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">المسجلة في جدولك الحالي</p>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              ما تم إنجازه ✓
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {stats.completed} <span className="text-sm font-normal text-slate-400">مكتملة</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">تمت بنجاح وإتقان</p>
          </div>
        </div>

        {/* Remaining Tasks */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              ما تبقى للعمل
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              {stats.pending} <span className="text-sm font-normal text-slate-400">مهمة باقية</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.highPriorityRemaining > 0 ? `منها ${stats.highPriorityRemaining} مهمة ذات أولوية عالية` : 'كل المهام ذات وتيرة منتظمة'}
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              نسبة الإنجاز %
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 tracking-tight">
              {stats.rate}%
            </div>
            <div className="w-full bg-[#21262D] rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.rate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Add Task Form Box */}
      <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>إضافة مهمة جديدة</span>
        </h3>

        <form onSubmit={handleAddTask} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="اكتب عنوان المهمة المراد إنجازها..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة المهمة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Priority Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">الأولوية</label>
              <div className="grid grid-cols-3 gap-1 bg-[#0D1117] p-1 rounded-xl border border-[#30363D]">
                {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p)}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                      newPriority === p
                        ? p === 'high'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : p === 'medium'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p === 'high' ? 'عالية' : p === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">التصنيف</label>
              {!isAddingNewCat ? (
                <div className="flex gap-1.5">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-white focus:outline-none focus:border-indigo-400"
                  >
                    {taskData.categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(true)}
                    title="إضافة تصنيف مخصص"
                    className="px-2 py-1 bg-[#21262D] hover:bg-[#30363D] rounded-xl text-xs text-indigo-300 border border-[#30363D]"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="اسم التصنيف..."
                    value={customCatInput}
                    onChange={(e) => setCustomCatInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#0D1117] border border-indigo-500/50 text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(false)}
                    className="px-2 py-1 bg-[#21262D] rounded-xl text-xs text-slate-400"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
        </form>
      </div>

      {/* 3. Task List & Filters */}
      <div className="rounded-2xl border border-[#30363D] bg-[#161B22] shadow-xl overflow-hidden">
        {/* Filter Controls Header */}
        <div className="p-4 bg-[#111620] border-b border-[#30363D] flex flex-wrap gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#0D1117] p-1 rounded-xl border border-[#30363D]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              المتبقية ({stats.pending})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              المنجزة ({stats.completed})
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-slate-300 focus:outline-none"
            >
              <option value="all">كافة الأولويات</option>
              <option value="high">أولوية عالية</option>
              <option value="medium">أولوية متوسطة</option>
              <option value="low">أولوية منخفضة</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-slate-300 focus:outline-none"
            >
              <option value="all">كافة التصنيفات</option>
              {taskData.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في المهام..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-7 pl-2 py-1.5 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Clear completed button */}
            {stats.completed > 0 && (
              <button
                onClick={handleClearCompleted}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#21262D] hover:bg-[#30363D] text-slate-300 border border-[#30363D] transition-colors"
              >
                مسح المنجزة
              </button>
            )}
          </div>
        </div>

        {/* Task List Feed */}
        <div className="divide-y divide-[#21262D]">
          {filteredTasks.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <span>لا توجد مهام تطابق الفلترة الحالية</span>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
              const isToday = task.dueDate === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={task.id}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors group ${
                    task.completed ? 'bg-[#0D1117]/30 hover:bg-[#0D1117]/50' : 'hover:bg-[#1c232c]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    {/* Checkbox Toggle Button */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                        task.completed
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-[#0D1117] border border-[#30363D] hover:border-indigo-500 text-transparent'
                      }`}
                      title={task.completed ? 'تعيين كغير منجزة' : 'تعيين كمنجزة'}
                    >
                      <Check className={`w-3.5 h-3.5 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                    </button>

                    {/* Task Title & Details */}
                    <div className="overflow-hidden flex-1">
                      <div className={`text-xs sm:text-sm font-semibold truncate transition-all ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-indigo-200'
                      }`}>
                        {task.title}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px]">
                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 rounded-full border ${priority.badgeClass} font-semibold flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.dotClass}`}></span>
                          <span>{priority.label}</span>
                        </span>

                        {/* Category Badge */}
                        <span className="px-2 py-0.5 rounded-full bg-[#21262D] text-slate-300 border border-[#30363D]">
                          {task.category}
                        </span>

                        {/* Due Date Badge */}
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                            isToday ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' : 'text-slate-400'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate} {isToday && '(اليوم)'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      title="حذف المهمة"
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-[#21262D] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
