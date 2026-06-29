import { Database, Globe, Code2, Monitor, GitBranch, Network, BookOpen, User, Trash2 } from 'lucide-react'

const SUBJECT_ICONS = {
  DBS: Database,
  WA: Globe,
  PROG: Code2,
  OS: Monitor,
  SE: GitBranch,
  NET: Network,
};

const SubjectIcon = ({ code }) => {
  const key = Object.keys(SUBJECT_ICONS).find(k => code.includes(k));
  const Icon = key ? SUBJECT_ICONS[key] : BookOpen;
  return <Icon className="w-5 h-5" />;
};

const SubjectCard = ({ subject, onSelect, onDelete }) => {
  
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-ambient hover:shadow-md transition-shadow flex flex-col p-5 gap-4 font-inter">
      {/* Header: Icon + Mandatory/Elective Badge */}
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 bg-[#eeefff] text-[#004ac6] flex items-center justify-center rounded-md shrink-0">
          <SubjectIcon code={subject.code} />
        </div>
        <span className={`text-label-sm font-bold px-2.5 py-0.5 rounded-sm ${
          subject.isMandatory 
            ? 'bg-[#eeefff] text-[#004ac6]' 
            : 'bg-[#e6f4ea] text-emerald-700'
        }`}>
          {subject.isMandatory ? 'Mandatory' : 'Elective'}
        </span>
      </div>

      {/* Meta Row: Code + Credits */}
      <div className="flex items-center gap-2">
        <span className="text-label-sm font-extrabold text-primary uppercase tracking-wide">
          {subject.code}
        </span>
        <span className="w-1 h-1 rounded-full bg-[#737686] shrink-0" />
        <span className="text-label-sm text-[#737686] font-semibold">
          {subject.credits} Credits
        </span>
      </div>

      {/* Title & Description */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-headline-md font-bold text-on-surface leading-snug">
          {subject.name}
        </h3>
        <p className="text-body-md text-[#737686] line-clamp-2 leading-relaxed">
          {subject.description}
        </p>
      </div>

      {/* Course Info details */}
      <div className="grid grid-cols-2 gap-2 text-body-md text-[#737686] mt-1">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-[13px] font-medium" title={subject.lecturer}>
            {subject.lecturer}
          </span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <span className="text-[13px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm">
            {subject.completionType}
          </span>
        </div>
      </div>

      {/* Semester Details & Open Button */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
        <span className="text-label-sm text-[#737686] font-semibold">
          {subject.semester} Semester
        </span>
        
        <div className="flex items-center gap-2">
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete the subject "${subject.name}"?`)) {
                  onDelete(subject.id);
                }
              }}
              className="text-[#737686] hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-all cursor-pointer border border-transparent hover:border-red-200"
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => onSelect?.(subject)}
            className="bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.98] text-white font-semibold px-4 py-2 rounded-md text-label-md transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            Open Subject
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubjectCard
