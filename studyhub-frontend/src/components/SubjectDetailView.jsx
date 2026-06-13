import { useState } from 'react'
import {
  ArrowLeft,
  User,
  BookOpen,
  ShieldCheck,
  Download,
  ExternalLink,
  FileText,
  Code2,
  Circle,
  CalendarDays,
  CheckCheck,
  Info,
  Bookmark
} from 'lucide-react'

// Tab definitions
const TABS = ['Overview', 'Materials', 'Assignments', 'Tests & Exams']

const getResourceTypeIcon = (type) => {
  switch (type) {
    case 'PDF': return FileText;
    case 'SLIDES': return Code2;
    case 'LINK': return ExternalLink;
    case 'NOTES': return Bookmark;
    default: return FileText;
  }
};

const getRelativeDaysLabel = (dateStr) => {
  if (dateStr === '2026-12-20') return '20 December';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Due Today';
  if (diffDays === 1) return 'Due Tomorrow';
  if (diffDays > 1) return `Due in ${diffDays} days`;
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
  return dateStr;
};

// ─── Overview Tab Content ─────────────────────────────────────
const OverviewTab = ({ subject, events }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Upcoming deadlines specific to this subject
  const upcomingDeadlines = events
    .filter(e => e.subjectId === subject.id && e.type !== 'Lecture' && e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Left column */}
      <div className="flex flex-col gap-6">
        {/* Subject Description Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-ambient p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-label-md font-bold text-on-surface">Course Description</h3>
          </div>
          <p className="text-body-md text-[#434655] leading-relaxed">{subject.description}</p>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-[#F2F4F6] border border-[#E2E8F0] rounded-md p-4">
              <p className="text-label-sm text-[#737686] uppercase tracking-wider font-bold mb-1">Completion Criteria</p>
              <p className="text-headline-md font-bold text-on-surface">{subject.completionType}</p>
            </div>
            <div className="bg-[#F2F4F6] border border-[#E2E8F0] rounded-md p-4">
              <p className="text-label-sm text-[#737686] uppercase tracking-wider font-bold mb-1">Lecturer In Charge</p>
              <p className="text-headline-md font-bold text-on-surface">{subject.lecturer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right column: Upcoming deadlines */}
      <div className="flex flex-col gap-5">
        <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-ambient p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#bc4800]" />
            <h3 className="text-label-md font-bold text-on-surface">Subject Deadlines</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-body-md text-[#737686] italic text-center py-4">No upcoming deadlines.</p>
            ) : (
              upcomingDeadlines.map((dl, idx) => {
                const isCritical = dl.date === todayStr || dl.type === 'Exam';
                return (
                  <div key={dl.id} className="flex gap-3 items-start relative pl-4">
                    <div className={`absolute left-[4px] top-[7px] w-2 h-2 rounded-full ${
                      isCritical ? 'bg-red-600' : 'bg-slate-400'
                    }`} />
                    {idx < upcomingDeadlines.length - 1 && (
                      <div className="absolute left-[7px] top-[15px] bottom-[-20px] w-[1px] bg-[#E2E8F0]" />
                    )}
                    <div className="pb-2">
                      <p className={`text-label-sm font-extrabold uppercase tracking-wider ${
                        isCritical ? 'text-error' : 'text-slate-500'
                      }`}>
                        {getRelativeDaysLabel(dl.date)}
                      </p>
                      <p className="text-label-md font-bold text-on-surface mt-0.5">{dl.title}</p>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">{dl.type}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Materials Tab Content ────────────────────────────────────
const MaterialsTab = ({ subject, resources }) => {
  const subjectResources = resources.filter(r => r.subjectId === subject.id);

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <p className="text-body-md text-[#737686]">{subjectResources.length} materials uploaded for this subject</p>
      </div>

      {subjectResources.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-12 text-center text-body-md text-[#737686] italic shadow-ambient">
          No materials available for this subject yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subjectResources.map(res => {
            const Icon = getResourceTypeIcon(res.type);
            const isLink = res.type === 'LINK';

            return (
              <div 
                key={res.id} 
                className="bg-white border border-[#E2E8F0] rounded-lg shadow-ambient p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-slate-100 text-slate-700 flex items-center justify-center rounded-md shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-label-md font-bold text-on-surface leading-tight truncate">{res.title}</h4>
                    <p className="text-[11px] text-[#737686] mt-0.5 truncate">
                      {res.description} • {res.size || 'Attachment'} • Uploaded: {res.uploadDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a 
                    href={res.url}
                    target={isLink ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] hover:bg-[#F2F4F6] rounded-md text-label-md font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {isLink ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isLink ? 'Preview' : 'Download'}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

// ─── Assignments Tab Content ──────────────────────────────────
const AssignmentsTab = ({ subject, events, onUpdateStatus }) => {
  const subjectAssignments = events.filter(e => e.subjectId === subject.id && e.type === 'Assignment');

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <p className="text-body-md text-[#737686]">{subjectAssignments.length} assignments tracked</p>
      
      {subjectAssignments.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-12 text-center text-body-md text-[#737686] italic shadow-ambient">
          No assignments listed for this subject.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subjectAssignments.map(asgn => {
            const isSubmitted = asgn.status === 'Submitted';
            return (
              <div 
                key={asgn.id} 
                className="bg-white border border-[#E2E8F0] rounded-lg shadow-ambient p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="text-label-md font-bold text-on-surface leading-tight truncate">{asgn.title}</h4>
                  <p className="text-[11px] text-[#737686] mt-0.5">
                    Deadline: {asgn.date} ({getRelativeDaysLabel(asgn.date)})
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Status:</span>
                  <select 
                    value={asgn.status || 'Not Started'} 
                    onChange={(e) => onUpdateStatus(asgn.id, e.target.value)}
                    className="px-2.5 py-1 bg-surface border border-[#E2E8F0] rounded-md text-label-md font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer transition-colors"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                  {isSubmitted ? (
                    <CheckCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

// ─── Tests & Exams Tab Content ────────────────────────────────
const TestsExamsTab = ({ subject, events, onUpdateStatus }) => {
  const subjectExams = events.filter(
    e => e.subjectId === subject.id && (e.type === 'Test' || e.type === 'Exam')
  );

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <p className="text-body-md text-[#737686]">{subjectExams.length} tests and exams listed</p>
      
      {subjectExams.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-12 text-center text-body-md text-[#737686] italic shadow-ambient">
          No tests or exams scheduled.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subjectExams.map(exam => {
            const isCompleted = exam.status === 'Completed' || exam.status === 'Submitted';
            return (
              <div 
                key={exam.id} 
                className="bg-white border border-[#E2E8F0] rounded-lg shadow-ambient p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="text-label-md font-bold text-on-surface leading-tight truncate">{exam.title}</h4>
                  <p className="text-[11px] text-[#737686] mt-0.5">
                    Date: {exam.date} • Type: {exam.type}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Status:</span>
                  <select 
                    value={exam.status || 'Not Started'} 
                    onChange={(e) => onUpdateStatus(exam.id, e.target.value)}
                    className="px-2.5 py-1 bg-surface border border-[#E2E8F0] rounded-md text-label-md font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer transition-colors"
                  >
                    <option value="Not Started">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {isCompleted ? (
                    <CheckCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main SubjectDetailView Component ───────────────────────
const SubjectDetailView = ({ subject, events, resources, onBack, onUpdateEventStatus }) => {
  const [activeTab, setActiveTab] = useState('Overview')

  if (!subject) {
    return (
      <div className="py-20 text-center text-on-surface-variant font-medium">
        No subject selected. Click back to select a subject.
        {onBack && (
          <button onClick={onBack} className="block mx-auto mt-4 px-4 py-2 bg-primary text-white rounded-md">
            Go back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-0 font-inter pb-16">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-label-md font-semibold text-[#737686] hover:text-on-surface transition-colors cursor-pointer mb-4 w-fit bg-transparent border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subjects
        </button>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
        <div className="flex flex-col gap-2">
          {/* Code badge + semester */}
          <div className="flex items-center gap-3">
            <span className="text-label-sm font-extrabold uppercase px-2.5 py-1 rounded-sm bg-[#eeefff] text-primary">
              {subject.code}
            </span>
            <span className="text-body-md text-[#737686] font-medium">{subject.semester} Semester</span>
          </div>
          {/* Title */}
          <h1 className="text-display text-on-surface">{subject.name}</h1>
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-body-md text-[#737686]">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 shrink-0" /> Lecturer: {subject.lecturer}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 shrink-0" /> {subject.credits} Credits
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {subject.isMandatory ? 'Mandatory' : 'Elective'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#E2E8F0] mb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-0 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-label-md font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap bg-transparent border-0 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[#737686] hover:text-on-surface hover:border-[#c3c6d7]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'Overview' && <OverviewTab subject={subject} events={events} />}
        {activeTab === 'Materials' && <MaterialsTab subject={subject} resources={resources} />}
        {activeTab === 'Assignments' && <AssignmentsTab subject={subject} events={events} onUpdateStatus={onUpdateEventStatus} />}
        {activeTab === 'Tests & Exams' && <TestsExamsTab subject={subject} events={events} onUpdateStatus={onUpdateEventStatus} />}
      </div>
    </div>
  )
}

export default SubjectDetailView
