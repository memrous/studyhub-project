import { useState, useMemo, useRef, useEffect } from 'react'
import {
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  X,
  ChevronDown,
  BookOpen,
  Check,
} from 'lucide-react'
import SubjectCard from './SubjectCard'

// ─── Create Subject Modal ────────────────────────────────────
const CreateSubjectModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    credits: '6',
    isMandatory: 'Mandatory',
    lecturer: '',
    semester: 'Winter',
    description: '',
    completionType: 'Credit + Exam',
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return
    onSave({
      id: Date.now(),
      code: form.code.toUpperCase(),
      name: form.name,
      credits: Number(form.credits),
      isMandatory: form.isMandatory === 'Mandatory',
      lecturer: form.lecturer || 'TBA',
      semester: form.semester,
      description: form.description || 'No description provided.',
      completionType: form.completionType,
    })
    onClose()
  }

  const inputCls = 'w-full px-3 py-2 bg-surface rounded-md border border-[#E2E8F0] text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-white transition-colors'
  const labelCls = 'text-label-md font-bold text-on-surface-variant'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-[#E2E8F0] w-full max-w-lg overflow-hidden font-inter">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-surface">
          <h2 className="text-headline-md font-bold text-on-surface">Add Enrolled Subject</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#E2E8F0] text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Subject Name</label>
            <input required placeholder="e.g. Database Systems" value={form.name} onChange={set('name')} className={inputCls} />
          </div>

          {/* Code + Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Course Code (STAG)</label>
              <input required placeholder="e.g. KMI/DBS" value={form.code} onChange={set('code')} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Credits</label>
              <select value={form.credits} onChange={set('credits')} className={inputCls}>
                {[2, 3, 4, 5, 6, 7, 8, 10].map(c => <option key={c} value={c}>{c} Credits</option>)}
              </select>
            </div>
          </div>

          {/* Lecturer */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Lecturer / Professor</label>
            <input placeholder="e.g. John Smith" value={form.lecturer} onChange={set('lecturer')} className={inputCls} />
          </div>

          {/* Category + Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Enrollment Badge</label>
              <select value={form.isMandatory} onChange={set('isMandatory')} className={inputCls}>
                <option>Mandatory</option>
                <option>Elective</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Semester</label>
              <select value={form.semester} onChange={set('semester')} className={inputCls}>
                <option value="Winter">Winter Semester</option>
                <option value="Summer">Summer Semester</option>
              </select>
            </div>
          </div>

          {/* Completion Type */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Completion Type</label>
            <select value={form.completionType} onChange={set('completionType')} className={inputCls}>
              <option value="Exam">Exam</option>
              <option value="Credit">Credit</option>
              <option value="Credit + Exam">Credit + Exam</option>
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Subject Description</label>
            <textarea rows={3} placeholder="Describe the course curriculum..." value={form.description} onChange={set('description')} className={`${inputCls} resize-none`} />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-[#E2E8F0] mt-2">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 border border-[#E2E8F0] rounded-md text-label-md font-semibold text-on-surface-variant hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-md text-label-md font-semibold shadow-sm transition-colors cursor-pointer">Save Subject</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Dropdown helper ─────────────────────────────────────────
const Dropdown = ({ label, icon: Icon, options, value, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative w-full sm:w-auto" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full sm:w-auto items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer shadow-ambient"
      >
        <Icon className="w-3.5 h-3.5 text-[#737686]" />
        {label}
        <ChevronDown className={`w-3 h-3 text-[#737686] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-30 bg-white border border-[#E2E8F0] rounded-lg shadow-lg min-w-[160px] py-1 overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-label-md font-medium transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                value === opt.value ? 'text-primary bg-[#eeefff]' : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {opt.label}
              {value === opt.value && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main SubjectsView Component ─────────────────────────────
const SubjectsView = ({ subjects, onSelectSubject, onAddSubject, onDeleteSubject }) => {
  const [filterType, setFilterType] = useState('all')     // 'all' | 'Mandatory' | 'Elective'
  const [sortKey, setSortKey] = useState('default')       // 'default' | 'name' | 'code' | 'credits'
  const [isModalOpen, setIsModalOpen] = useState(false)

  const FILTER_OPTIONS = [
    { value: 'all',       label: 'All Subjects' },
    { value: 'Mandatory', label: 'Mandatory Only' },
    { value: 'Elective',  label: 'Elective Only' },
  ]

  const SORT_OPTIONS = [
    { value: 'default',  label: 'Default Order' },
    { value: 'name',     label: 'Name (A–Z)' },
    { value: 'code',     label: 'Course Code' },
    { value: 'credits',  label: 'Credits (High–Low)' },
  ]

  const displayed = useMemo(() => {
    let list = [...subjects]

    // Filter
    if (filterType !== 'all') {
      const isMandatoryVal = filterType === 'Mandatory';
      list = list.filter(s => s.isMandatory === isMandatoryVal)
    }

    // Sort
    if (sortKey === 'name')     list.sort((a, b) => a.name.localeCompare(b.name))
    if (sortKey === 'code')     list.sort((a, b) => a.code.localeCompare(b.code))
    if (sortKey === 'credits')  list.sort((a, b) => b.credits - a.credits)

    return list
  }, [subjects, filterType, sortKey])

  const filterLabel = FILTER_OPTIONS.find(o => o.value === filterType)?.label ?? 'Filter'
  const sortLabel   = SORT_OPTIONS.find(o => o.value === sortKey)?.label ?? 'Sort'

  return (
    <>
      <div className="w-full flex flex-col gap-8 font-inter pb-16">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-display text-on-surface">My Enrolled Subjects</h1>
            <p className="text-body-md text-[#737686]">Manage your academic curriculum, credits, and completion types connected with STAG.</p>
          </div>

          {/* Filter + Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <Dropdown
                label={filterLabel}
                icon={SlidersHorizontal}
                options={FILTER_OPTIONS}
                value={filterType}
                onChange={setFilterType}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Dropdown
                label={sortLabel}
                icon={ArrowUpDown}
                options={SORT_OPTIONS}
                value={sortKey}
                onChange={setSortKey}
              />
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {displayed.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-16 text-center flex flex-col items-center gap-3 shadow-ambient">
            <div className="w-12 h-12 bg-[#eeefff] text-primary rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-headline-md font-semibold text-on-surface">
              {subjects.length === 0 ? 'Žádná data' : 'Žádné odpovídající předměty'}
            </p>
            <p className="text-body-md text-[#737686]">
              {subjects.length === 0
                ? 'Zatím nemáte žádné zapsané předměty.'
                : 'Zkuste změnit filtr nebo přidat nový předmět.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayed.map(subject => (
              <SubjectCard key={subject.id} subject={subject} onSelect={onSelectSubject} onDelete={onDeleteSubject} />
            ))}
          </div>
        )}

        <footer className="text-center text-body-md text-[#737686] pt-4 border-t border-[#E2E8F0]">
          © 2026 Palacký University Olomouc Academic Systems. STAG Integration Connected.
        </footer>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        title="Add Enrolled Subject"
        className="fixed lg:bottom-8 bottom-20 right-8 w-14 h-14 bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white rounded-full shadow-xl flex items-center justify-center transition-all z-30 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Subject Modal */}
      {isModalOpen && (
        <CreateSubjectModal onClose={() => setIsModalOpen(false)} onSave={onAddSubject} />
      )}
    </>
  )
}

export default SubjectsView
