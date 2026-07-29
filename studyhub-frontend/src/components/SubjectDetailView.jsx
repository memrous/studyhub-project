import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  GraduationCap,
  Award,
  UserCog,
  Layers,
  ListChecks,
  FolderOpen,
  NotebookPen,
  Download,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Info,
  X,
  Clock,
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────

const renderCompletionType = (value, t) => {
  switch (value) {
    case 'Credit': return t('academic:subjectsView.options.credit')
    case 'Exam': return t('academic:subjectsView.options.exam')
    case 'Credit + Exam': return t('academic:subjectsView.options.creditPlusExam')
    default: return value || '—'
  }
}

const getDayDiff = (dateStr) => {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

const getRequirementDotColor = (req) => {
  if (req.isCompleted) return 'bg-success'
  const diff = getDayDiff(req.date)
  if (diff !== null && diff <= 3) return 'bg-error'
  return 'bg-primary'
}

// ─── Circular Progress Ring ──────────────────────────────────

const CircularProgress = ({ gained, max, passThreshold, passed }) => {
  const r = 52
  const circ = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(1, Math.max(0, gained / max)) : 0
  const offset = circ * (1 - pct)
  const passPct = passThreshold !== null && max > 0 ? Math.min(1, passThreshold / max) : null

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-surface-container)" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={passed ? 'var(--color-success)' : 'var(--color-primary)'}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {passPct !== null && (
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--color-warning)"
            strokeWidth="14"
            strokeDasharray={`2 ${circ}`}
            strokeDashoffset={-(circ * passPct) + 1}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-2xl font-bold text-foreground">{gained}</span>
        <span className="text-xs text-on-surface-variant">/ {max} PTS</span>
      </div>
    </div>
  )
}

// ─── Left Column: Meta row ────────────────────────────────────

const MetaRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
      <Icon className="size-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
)

// ─── Left Column: Subject Info Card ──────────────────────────

const SubjectInfoCard = ({ subject, onShowInfo }) => {
  const { t } = useTranslation(['academic', 'dashboard'])
  const guarantor = subject.guarantor || subject.lecturer || '—'

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="rounded-md bg-primary/15 px-2 py-1 font-mono text-primary">{subject.code}</span>
        <span className="text-on-surface-variant">
          {subject.semester === 'Winter'
            ? t('dashboard:subjectCard.semester.winter')
            : t('dashboard:subjectCard.semester.summer')}
        </span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">{subject.name}</h1>
        {subject.description && (
          <button
            onClick={onShowInfo}
            aria-label={t('academic:subjectDetail.showInfo')}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Info className="size-4" />
          </button>
        )}
      </div>

      <div className="mt-4 border-t border-outline-variant pt-2">
        <MetaRow
          icon={GraduationCap}
          label={t('academic:subjectDetail.creditsLabel')}
          value={t('academic:subjectDetail.creditsEcts', { count: subject.credits })}
        />
        <MetaRow
          icon={Award}
          label={t('academic:subjectDetail.completionLabel')}
          value={renderCompletionType(subject.completionType, t)}
        />
        <MetaRow
          icon={UserCog}
          label={t('academic:subjectDetail.guarantorLabel')}
          value={guarantor}
        />
        <MetaRow
          icon={Layers}
          label={t('academic:subjectDetail.typeLabel')}
          value={
            subject.isMandatory
              ? t('dashboard:subjectCard.mandatory')
              : t('dashboard:subjectCard.elective')
          }
        />
      </div>
    </div>
  )
}

// ─── Left Column: Progress Card ───────────────────────────────

const ProgressCard = ({ requirements, subject }) => {
  const { t } = useTranslation('academic')

  const { totalGained, totalMax } = useMemo(() => {
    if (!requirements || requirements.length === 0) return { totalGained: 0, totalMax: 0 }
    const gained = requirements.reduce((s, r) => s + (r.gainedPoints ?? 0), 0)
    const max = requirements.reduce((s, r) => s + (r.maxPoints ?? 0), 0)
    return { totalGained: gained, totalMax: max }
  }, [requirements])

  const passThreshold = subject.passThreshold ?? null
  const passed = passThreshold !== null ? totalGained >= passThreshold : null
  const missingToMin = passThreshold !== null ? Math.max(0, passThreshold - totalGained) : null

  return (
    <div className="flex flex-col items-center rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
      <p className="mb-4 self-start text-sm font-semibold text-foreground">
        {t('academic:subjectDetail.progress.title')}
      </p>

      <CircularProgress
        gained={totalGained}
        max={totalMax}
        passThreshold={passThreshold}
        passed={passed}
      />

      {passThreshold !== null && (
        <div className="mt-4 w-full space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="size-2 rounded-full bg-warning" />
              {t('academic:subjectDetail.progress.minimum')}
            </span>
            <span className="font-mono font-medium text-foreground">
              {passThreshold} {t('academic:subjectDetail.progress.pts')}
            </span>
          </div>
          <div
            className={`flex items-center justify-between rounded-lg px-2.5 py-2 font-medium ${
              passed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}
          >
            <span>
              {passed
                ? t('academic:subjectDetail.progress.minimumMet')
                : t('academic:subjectDetail.progress.missingToMinimum', { diff: missingToMin })}
            </span>
            {passed && <span className="font-mono">✓</span>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB 1: Requirements ─────────────────────────────────────

const RequirementsTab = ({ requirements, resources }) => {
  const { t } = useTranslation('academic')

  if (!requirements || requirements.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-12 text-center text-sm text-on-surface-variant italic">
        {t('academic:subjectDetail.requirements.noRequirements')}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {requirements.map((req, idx) => {
        const isLast = idx === requirements.length - 1
        const dotColor = getRequirementDotColor(req)
        const diff = getDayDiff(req.date)

        let statusEl = null
        if (req.isCompleted) {
          statusEl = (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-container px-2 py-0.5 text-[11px] font-bold text-on-success-container">
              {t('academic:subjectDetail.requirements.statusCompleted')}
            </span>
          )
        } else if (diff !== null && diff === 0) {
          statusEl = (
            <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2 py-0.5 text-[11px] font-bold text-error">
              <Clock className="size-3" />
              {t('academic:subjectDetail.requirements.statusDueToday')}
            </span>
          )
        } else if (diff !== null && diff > 0 && diff <= 14) {
          statusEl = (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                diff <= 3 ? 'bg-error-container text-error' : 'bg-warning-container text-on-warning-container'
              }`}
            >
              <Clock className="size-3" />
              {t('academic:subjectDetail.requirements.statusDueSoon', { count: diff })}
            </span>
          )
        } else if (req.date) {
          statusEl = (
            <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
              <Clock className="size-3" />
              {req.date}
            </span>
          )
        }

        const linkedMaterials = resources
          ? resources.filter((r) => r.requirementId === req.id || r.requirement_id === req.id)
          : []

        const reqTypeName = t(`academic:subjectDetail.requirements.types.${req.type}`, req.type)

        return (
          <div key={req.id} className="flex gap-4">
            <div className="flex flex-col items-center w-4 shrink-0 pt-1">
              <div className={`size-3 rounded-full shrink-0 z-10 ${dotColor}`} />
              {!isLast && (
                <div className="w-[1px] flex-1 border-l border-dashed border-outline-variant mt-1.5" />
              )}
            </div>

            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                      {reqTypeName}
                    </span>
                    {req.weight !== undefined && req.weight !== null && (
                      <span className="text-[11px] font-semibold text-on-surface-variant">
                        {t('academic:subjectDetail.requirements.weight', { weight: req.weight })}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-bold text-foreground">
                      {req.gainedPoints !== null && req.gainedPoints !== undefined
                        ? req.gainedPoints
                        : t('academic:subjectDetail.requirements.noPts')}{' '}
                      / {req.maxPoints ?? '?'} PTS
                    </p>
                    {statusEl && <div className="mt-1 flex justify-end">{statusEl}</div>}
                  </div>
                </div>

                <h4 className="text-sm font-semibold leading-snug text-foreground">
                  {req.title}
                </h4>

                {req.description && (
                  <p className="text-sm text-on-surface-variant">{req.description}</p>
                )}

                {linkedMaterials.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-outline-variant">
                    {linkedMaterials.map((mat) => {
                      const isLink = mat.type === 'LINK' || mat.url?.startsWith('http')
                      return (
                        <a
                          key={mat.id}
                          href={mat.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
                        >
                          {isLink ? <LinkIcon className="size-3" /> : <Download className="size-3" />}
                          {mat.title}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── TAB 2: Materials ────────────────────────────────────────

const MaterialsTab = ({ subject, resources }) => {
  const { t } = useTranslation('academic')

  const subjectMaterials = (resources || []).filter(
    (r) =>
      (r.subjectId === subject.id || r.subject_id === subject.id) &&
      !r.requirementId &&
      !r.requirement_id
  )

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-on-surface-variant">
        {t('academic:subjectDetail.materialsUploaded', { count: subjectMaterials.length })}
      </p>

      {subjectMaterials.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-12 text-center text-sm text-on-surface-variant italic">
          {t('academic:subjectDetail.noMaterials')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subjectMaterials.map((res) => {
            const isLink = res.type === 'LINK'
            const Icon = isLink ? ExternalLink : FileText

            return (
              <div
                key={res.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold leading-tight text-foreground">{res.title}</h4>
                    {res.description && (
                      <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">{res.description}</p>
                    )}
                  </div>
                </div>
                <a
                  href={res.url || '#'}
                  target={isLink ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-container"
                >
                  {isLink ? <ExternalLink className="size-3.5" /> : <Download className="size-3.5" />}
                  <span>{isLink ? t('academic:subjectDetail.preview') : t('academic:subjectDetail.download')}</span>
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── TAB 3: Notes ────────────────────────────────────────────

const NotesTab = ({ note, onSaveNote }) => {
  const { t } = useTranslation('academic')
  const [content, setContent] = useState(note?.content || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSaveNote?.(content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false) }}
        placeholder={t('academic:subjectDetail.notes.placeholder')}
        rows={16}
        className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-foreground placeholder:text-on-surface-variant transition-colors focus:border-primary focus:outline-none resize-none"
      />
      <div className="flex items-center justify-between gap-3">
        {saved ? (
          <span className="text-xs font-semibold text-success">
            ✓ {t('academic:subjectDetail.notes.saved')}
          </span>
        ) : note?.updated_at ? (
          <span className="text-xs text-on-surface-variant">
            {t('academic:subjectDetail.notes.lastSaved', {
              time: new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={handleSave}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {t('academic:subjectDetail.notes.save')}
        </button>
      </div>
    </div>
  )
}

// ─── Tab config ──────────────────────────────────────────────

const TABS = [
  { key: 'requirements', Icon: ListChecks },
  { key: 'materials', Icon: FolderOpen },
  { key: 'notes', Icon: NotebookPen },
]

// ─── Main SubjectDetailView Component ───────────────────────

const SubjectDetailView = ({
  subject,
  requirements,
  note,
  resources,
  onBack,
  onSaveNote,
  // eslint-disable-next-line no-unused-vars
  onCreateRequirement,
  // eslint-disable-next-line no-unused-vars
  onUpdateRequirement,
  // eslint-disable-next-line no-unused-vars
  onDeleteRequirement,
  // eslint-disable-next-line no-unused-vars
  onUploadResource,
}) => {
  const { t } = useTranslation(['academic', 'dashboard'])
  const [activeTab, setActiveTab] = useState('requirements')
  const [showInfo, setShowInfo] = useState(false)

  if (!subject) {
    return (
      <div className="py-20 text-center text-on-surface-variant font-medium">
        {t('academic:subjectDetail.noSubjectSelected')}
        {onBack && (
          <button onClick={onBack} className="mx-auto mt-4 block rounded-lg bg-primary px-4 py-2 text-primary-foreground">
            {t('academic:subjectDetail.goBack')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full pb-16">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('academic:subjectDetail.backToSubjects')}
        </button>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* LEFT PANEL */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <SubjectInfoCard subject={subject} onShowInfo={() => setShowInfo(true)} />
          <ProgressCard requirements={requirements} subject={subject} />
        </aside>

        {/* RIGHT PANEL */}
        <div className="min-w-0">
          <div className="mb-5 flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-outline-variant">
            {TABS.map(({ key, Icon }) => {
              const active = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative inline-flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors ${
                    active ? 'text-foreground' : 'text-on-surface-variant hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {t(`academic:subjectDetail.tabs.${key}`)}
                  {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                </button>
              )
            })}
          </div>

          {activeTab === 'requirements' && (
            <RequirementsTab requirements={requirements} resources={resources} />
          )}
          {activeTab === 'materials' && (
            <MaterialsTab subject={subject} resources={resources} />
          )}
          {activeTab === 'notes' && (
            <NotesTab note={note} onSaveNote={onSaveNote} />
          )}
        </div>
      </div>

      {/* INFO DIALOG */}
      {showInfo && subject.description && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-primary">{subject.code}</p>
                <h2 className="text-lg font-semibold text-foreground">
                  {t('academic:subjectDetail.infoDialog.title')}
                </h2>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                aria-label={t('academic:subjectDetail.infoDialog.close')}
                className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{subject.description}</p>
            {subject.lecturer && (
              <p className="mt-4 text-xs text-on-surface-variant">
                {t('academic:subjectDetail.infoDialog.importedFromStag', { teacher: subject.lecturer })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SubjectDetailView