import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  User,
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
import CustomIcon from './CustomIcon'

const TAB_KEYS = ['overview', 'materials', 'assignments', 'testsExams']

const renderCompletionType = (value, t) => {
  switch (value) {
    case 'Credit':
      return t('academic:subjectsView.options.credit')
    case 'Exam':
      return t('academic:subjectsView.options.exam')
    case 'Credit + Exam':
      return t('academic:subjectsView.options.creditPlusExam')
    default:
      return value
  }
}

const getResourceTypeIcon = (type) => {
  switch (type) {
    case 'PDF': return FileText;
    case 'SLIDES': return Code2;
    case 'LINK': return ExternalLink;
    case 'NOTES': return Bookmark;
    default: return FileText;
  }
};

const getRelativeDaysLabel = (dateStr, t) => {
  if (dateStr === '2026-12-20') return '20 December';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return t('academic:subjectDetail.dueToday');
  if (diffDays === 1) return t('academic:subjectDetail.dueTomorrow');
  if (diffDays > 1) return t('academic:subjectDetail.dueInDays', { count: diffDays });
  if (diffDays < 0) return t('academic:subjectDetail.overdueByDays', { count: Math.abs(diffDays) });
  return dateStr;
};

// ─── Overview Tab Content ─────────────────────────────────────
const OverviewTab = ({ subject, events }) => {
  const { t } = useTranslation(['academic', 'dashboard'])
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
        <div className="bg-surface border border-outline-variant rounded-lg shadow-ambient p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-label-md font-bold text-on-surface">{t('academic:subjectDetail.courseDescription')}</h3>
          </div>
          <p className="text-body-md text-on-surface-variant leading-relaxed">{subject.description}</p>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-surface-container-low border border-outline-variant rounded-md p-4">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider font-bold mb-1">{t('academic:subjectDetail.completionCriteria')}</p>
              <p className="text-headline-md font-bold text-on-surface">{renderCompletionType(subject.completionType, t)}</p>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-md p-4">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider font-bold mb-1">{t('academic:subjectDetail.lecturerInCharge')}</p>
              <p className="text-headline-md font-bold text-on-surface">{subject.lecturer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right column: Upcoming deadlines */}
      <div className="flex flex-col gap-5">
        <div className="bg-surface border border-outline-variant rounded-lg shadow-ambient p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-warning" />
            <h3 className="text-label-md font-bold text-on-surface">{t('academic:subjectDetail.subjectDeadlines')}</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-body-md text-on-surface-variant italic text-center py-4">{t('academic:subjectDetail.noUpcomingDeadlines')}</p>
            ) : (
              upcomingDeadlines.map((dl, idx) => {
                const isCritical = dl.date === todayStr || dl.type === 'Exam';
                return (
                  <div key={dl.id} className="flex gap-3 items-start relative pl-4">
                    <div className={`absolute left-[4px] top-[7px] w-2 h-2 rounded-full ${
                      isCritical ? 'bg-red-600' : 'bg-surface-container'
                    }`} />
                    {idx < upcomingDeadlines.length - 1 && (
                      <div className="absolute left-[7px] top-[15px] bottom-[-20px] w-[1px] bg-surface-container" />
                    )}
                    <div className="pb-2">
                      <p className={`text-label-sm font-extrabold uppercase tracking-wider ${
                        isCritical ? 'text-error' : 'text-on-surface-variant'
                      }`}>
                        {getRelativeDaysLabel(dl.date, t)}
                      </p>
                      <p className="text-label-md font-bold text-on-surface mt-0.5">{dl.title}</p>
                      <span className="text-[10px] text-on-surface-variant font-semibold uppercase">
                        {t(`dashboard:deadlines.eventTypes.${dl.type}`, dl.type)}
                      </span>
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
  const { t } = useTranslation(['academic', 'dashboard'])
  const subjectResources = resources.filter(r => r.subjectId === subject.id);

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <p className="text-body-md text-on-surface-variant">{t('academic:subjectDetail.materialsUploaded', { count: subjectResources.length })}</p>
      </div>

      {subjectResources.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-body-md text-on-surface-variant italic shadow-ambient">
          {t('academic:subjectDetail.noMaterials')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subjectResources.map(res => {
            const Icon = getResourceTypeIcon(res.type);
            const isLink = res.type === 'LINK';

            return (
              <div 
                key={res.id} 
                className="bg-surface border border-outline-variant rounded-lg shadow-ambient p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-surface-container-low text-on-surface-variant flex items-center justify-center rounded-md shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-label-md font-bold text-on-surface leading-tight truncate">{res.title}</h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                      {res.description} • {res.size || t('academic:subjectDetail.attachment')} • {t('academic:subjectDetail.uploaded')} {res.uploadDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a 
                    href={res.url}
                    target={isLink ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant hover:bg-surface-container-low rounded-md text-label-md font-semibold text-on-surface-variant transition-colors cursor-pointer"
                  >
                    {isLink ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isLink ? t('academic:subjectDetail.preview') : t('academic:subjectDetail.download')}</span>
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
  const { t } = useTranslation(['academic', 'dashboard'])
  const subjectAssignments = events.filter(e => e.subjectId === subject.id && e.type === 'Assignment');

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <p className="text-body-md text-on-surface-variant">{t('academic:subjectDetail.assignmentsTracked', { count: subjectAssignments.length })}</p>
      
      {subjectAssignments.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-body-md text-on-surface-variant italic shadow-ambient">
          {t('academic:subjectDetail.noAssignments')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subjectAssignments.map(asgn => {
            const isSubmitted = asgn.status === 'Submitted';
            return (
              <div 
                key={asgn.id} 
                className="bg-surface border border-outline-variant rounded-lg shadow-ambient p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="text-label-md font-bold text-on-surface leading-tight truncate">{asgn.title}</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {t('academic:subjectDetail.deadline')} {asgn.date} ({getRelativeDaysLabel(asgn.date, t)})
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase">{t('academic:subjectDetail.status')}</span>
                  <select 
                    value={asgn.status || 'Not Started'} 
                    onChange={(e) => onUpdateStatus(asgn.id, e.target.value)}
                    className="px-2.5 py-1 bg-surface border border-outline-variant rounded-md text-label-md font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer transition-colors"
                  >
                    <option value="Not Started">{t('academic:subjectDetail.statusOptions.notStarted')}</option>
                    <option value="In Progress">{t('academic:subjectDetail.statusOptions.inProgress')}</option>
                    <option value="Submitted">{t('academic:subjectDetail.statusOptions.submitted')}</option>
                  </select>
                  {isSubmitted ? (
                    <CheckCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-on-surface-variant" />
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
  const { t } = useTranslation(['academic', 'dashboard'])
  const subjectExams = events.filter(
    e => e.subjectId === subject.id && (e.type === 'Test' || e.type === 'Exam')
  );

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <p className="text-body-md text-on-surface-variant">{t('academic:subjectDetail.testsExamsTracked', { count: subjectExams.length })}</p>
      
      {subjectExams.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-12 text-center text-body-md text-on-surface-variant italic shadow-ambient">
          {t('academic:subjectDetail.noTestsExams')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subjectExams.map(exam => {
            const isCompleted = exam.status === 'Completed' || exam.status === 'Submitted';
            return (
              <div 
                key={exam.id} 
                className="bg-surface border border-outline-variant rounded-lg shadow-ambient p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="text-label-md font-bold text-on-surface leading-tight truncate">{exam.title}</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {t('academic:subjectDetail.date')} {exam.date} • {t('academic:subjectDetail.type')} {t(`dashboard:timetable.eventTypes.${exam.type}`, exam.type)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase">{t('academic:subjectDetail.status')}</span>
                  <select 
                    value={exam.status || 'Not Started'} 
                    onChange={(e) => onUpdateStatus(exam.id, e.target.value)}
                    className="px-2.5 py-1 bg-surface border border-outline-variant rounded-md text-label-md font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer transition-colors"
                  >
                    <option value="Not Started">{t('academic:subjectDetail.statusOptions.upcoming')}</option>
                    <option value="Completed">{t('academic:subjectDetail.statusOptions.completed')}</option>
                  </select>
                  {isCompleted ? (
                    <CheckCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-on-surface-variant" />
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
  const { t } = useTranslation(['academic', 'dashboard'])
  const [activeTab, setActiveTab] = useState('overview')

  if (!subject) {
    return (
      <div className="py-20 text-center text-on-surface-variant font-medium">
        {t('academic:subjectDetail.noSubjectSelected')}
        {onBack && (
          <button onClick={onBack} className="block mx-auto mt-4 px-4 py-2 bg-primary text-white rounded-md">
            {t('academic:subjectDetail.goBack')}
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
          className="flex items-center gap-1.5 text-label-md font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer mb-4 w-fit bg-transparent border-0"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('academic:subjectDetail.backToSubjects')}
        </button>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
        <div className="flex flex-col gap-2">
          {/* Code badge + semester */}
          <div className="flex items-center gap-3">
            <span className="text-label-sm font-extrabold uppercase px-2.5 py-1 rounded-sm bg-primary-container text-primary">
              {subject.code}
            </span>
            <span className="text-body-md text-on-surface-variant font-medium">
              {subject.semester === 'Winter'
                ? t('dashboard:subjectCard.semester.winter')
                : t('dashboard:subjectCard.semester.summer')}
            </span>
          </div>
          {/* Title */}
          <h1 className="text-display text-on-surface">{subject.name}</h1>
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-body-md text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 shrink-0" /> {t('academic:subjectDetail.lecturerLabel')} {subject.lecturer}
            </span>
            <span className="flex items-center gap-1.5">
              <CustomIcon name="book" className="w-3.5 h-3.5 shrink-0" /> {subject.credits} {t('academic:subjectDetail.creditsLabel')}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {subject.isMandatory ? t('dashboard:subjectCard.mandatory') : t('dashboard:subjectCard.elective')}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-outline-variant mb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-0 min-w-max">
          {TAB_KEYS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-label-md font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap bg-transparent border-0 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-surface-container'
              }`}
            >
              {t(`academic:subjectDetail.tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && <OverviewTab subject={subject} events={events} />}
        {activeTab === 'materials' && <MaterialsTab subject={subject} resources={resources} />}
        {activeTab === 'assignments' && <AssignmentsTab subject={subject} events={events} onUpdateStatus={onUpdateEventStatus} />}
        {activeTab === 'testsExams' && <TestsExamsTab subject={subject} events={events} onUpdateStatus={onUpdateEventStatus} />}
      </div>
    </div>
  )
}

export default SubjectDetailView
