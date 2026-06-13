import { BookOpen, CheckSquare, Clock } from 'lucide-react'

const StatsRow = ({ subjects, events }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const activeSubjectsCount = subjects.length;
  
  const pendingTasksCount = events.filter(
    e => (e.type === 'Assignment' || e.type === 'Test') && e.status !== 'Submitted' && e.status !== 'Completed'
  ).length;

  const upcomingExamsCount = events.filter(
    e => e.type === 'Exam' && e.date >= todayStr
  ).length;

  return (
    <>
      {/* Mobile Stats Row (flex overflow-x-auto) */}
      <div className="flex lg:hidden overflow-x-auto gap-3 pb-2 no-scrollbar font-inter">
        {/* Active Subjects Card */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-ambient min-w-[130px] flex-1 flex flex-col items-start justify-between">
          <div className="w-8 h-8 bg-[#eeefff] text-[#004ac6] flex items-center justify-center rounded-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <span className="text-display font-semibold text-on-surface leading-none">{activeSubjectsCount}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#737686] block mt-1">Active Subjects</span>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-ambient min-w-[130px] flex-1 flex flex-col items-start justify-between">
          <div className="w-8 h-8 bg-slate-100 text-slate-700 flex items-center justify-center rounded-sm">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <span className="text-display font-semibold text-on-surface leading-none">{pendingTasksCount}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#737686] block mt-1">Pending Tasks</span>
          </div>
        </div>

        {/* Upcoming Exams Card */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-ambient min-w-[130px] flex-1 flex flex-col items-start justify-between">
          <div className="w-8 h-8 bg-[#ffede6] text-[#bc4800] flex items-center justify-center rounded-sm">
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <span className="text-display font-semibold text-on-surface leading-none">{upcomingExamsCount}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#737686] block mt-1">Upcoming Exams</span>
          </div>
        </div>
      </div>

      {/* Desktop Stats Row (grid-cols-3) */}
      <div className="hidden lg:grid grid-cols-3 gap-6 font-inter">
        {/* Active Subjects Card */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-lg shadow-ambient flex items-center gap-4">
          <div className="w-12 h-12 bg-[#eeefff] text-primary flex items-center justify-center rounded-md shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-label-sm text-[#737686] uppercase tracking-wider font-semibold">Active Subjects</span>
            <span className="text-display text-on-surface leading-none mt-1">{activeSubjectsCount}</span>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-lg shadow-ambient flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-700 flex items-center justify-center rounded-md shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-label-sm text-[#737686] uppercase tracking-wider font-semibold">Pending Tasks</span>
            <span className="text-display text-on-surface leading-none mt-1">{pendingTasksCount}</span>
          </div>
        </div>

        {/* Upcoming Exams Card */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-lg shadow-ambient flex items-center gap-4">
          <div className="w-12 h-12 bg-[#ffede6] text-[#bc4800] flex items-center justify-center rounded-md shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-label-sm text-[#737686] uppercase tracking-wider font-semibold">Upcoming Exams</span>
            <span className="text-display text-on-surface leading-none mt-1">{upcomingExamsCount}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default StatsRow
