import { useMemo, useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Filter,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCalendarState, getSubjectStyle } from './calendar/useCalendarState'
import CalendarGrid from './calendar/CalendarGrid'
import EventModal from './calendar/EventModal'
import EventDetailContent from './calendar/EventDetailContent'
import QuickOverviewPanel from './calendar/QuickOverviewPanel'
import { getLocaleFromLanguage } from '../utils/locale'
import { formatDateKey } from './calendar/useCalendarGrid'

const VIEWS = ['month', 'week', 'agenda']

const CalendarView = ({ 
  events: propEvents, 
  subjects: propSubjects,
  requirements: propRequirements,
  onCreateEvent, 
  onEditEvent, 
  onDeleteEvent, 
  onOpenSubject,
  openEventId,        
  onCloseOpenEvent     
}) => {
  const { t, i18n } = useTranslation(['academic', 'dashboard'])
  const currentEvents = useMemo(() => propEvents || [], [propEvents])
  const currentSubjects = useMemo(() => propSubjects || [], [propSubjects])
  const currentRequirements = useMemo(() => propRequirements || [], [propRequirements])
  const locale = getLocaleFromLanguage(i18n.language)

  const [panelOpen, setPanelOpen] = useState(true)

  const {
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    activeView,
    setActiveView,
    selectedSubjects,

    isModalOpen,
    setIsModalOpen,
    deleteConfirmId,
    setDeleteConfirmId,
    editingEventId,
    setEditingEventId,
    selectedDetailEvent,
    setSelectedDetailEvent,
    newTitle,
    setNewTitle,
    newSubject,
    setNewSubject,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    newDuration,
    setNewDuration,
    newType,
    setNewType,
    SUBJECTS,

    filteredEvents,
    gridDays,
    currentWeekDays,
    selectedDayEvents,
    hourlySlots,
    handleEventSelect,
    handleSubjectToggle,
    handlePrev,
    handleNext,
    handleFormSubmit,
    openCreateModal,
    getMonthName,
  } = useCalendarState({
    currentEvents,
    currentSubjects,
    onCreateEvent,
    onEditEvent,
    onDeleteEvent,
    openEventId,
    onCloseOpenEvent,
  })

  const [sheetVisible, setSheetVisible] = useState(false)
  const [closingEvent, setClosingEvent] = useState(null)

  useEffect(() => {
    if (selectedDetailEvent) {
      setClosingEvent(selectedDetailEvent)
      requestAnimationFrame(() => setSheetVisible(true))
    } else if (closingEvent) {
      setSheetVisible(false)
      const timer = setTimeout(() => setClosingEvent(null), 300) // must match transition duration
      return () => clearTimeout(timer)
    }
  }, [selectedDetailEvent])

  const todayKey = formatDateKey(new Date())
  const todayEvents = useMemo(
    () => currentEvents.filter(e => e.date === todayKey).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')),
    [currentEvents, todayKey]
  )

  const upcomingDeadlines = useMemo(() => {
    const today = todayKey
    return currentRequirements
      .filter(r => !r.completed && r.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return (a.time || '23:59').localeCompare(b.time || '23:59')
      })
      .slice(0, 5)
  }, [currentRequirements, todayKey])

  const handleGoToToday = () => {
    const now = new Date()
    setSelectedDate(now)
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* MAIN CALENDAR AREA */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-4 md:px-6 md:pt-5">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {t('academic:calendarView.title')}
            </h1>

            <div className="flex items-center rounded-lg border border-outline-variant">
              <button
                aria-label={t('academic:calendarView.previous', 'Předchozí')}
                onClick={handlePrev}
                className="flex size-8 items-center justify-center rounded-l-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                aria-label={t('academic:calendarView.next', 'Následující')}
                onClick={handleNext}
                className="flex size-8 items-center justify-center rounded-r-lg border-l border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <span className="text-xs font-medium capitalize text-on-surface-variant md:text-sm">
              {activeView === 'month' ? getMonthName(currentMonth) : getMonthName(selectedDate)}
            </span>

            <button
              onClick={handleGoToToday}
              className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-container"
            >
              {t('academic:calendarView.today', 'Dnes')}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            {/* Segmented control (desktop) */}
            <div className="hidden items-center rounded-lg border border-outline-variant bg-surface-container-lowest p-0.5 md:flex">
              {VIEWS.map((view) => (
                <button
                  key={view}
                  onClick={() => {
                    setActiveView(view)
                    if (view === 'month') {
                      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
                    }
                  }}
                  aria-pressed={activeView === view}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeView === view
                      ? 'bg-primary text-primary-foreground'
                      : 'text-on-surface-variant hover:text-foreground'
                  }`}
                >
                  {t(`academic:calendarView.views.${view}`)}
                </button>
              ))}
            </div>

            {/* View dropdown (mobile) */}
            <select
              value={activeView}
              onChange={(e) => {
                const view = e.target.value
                setActiveView(view)
                if (view === 'month') {
                  setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
                }
              }}
              aria-label={t('academic:calendarView.viewLabel', 'Zobrazení')}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm font-medium text-foreground md:hidden"
            >
              {VIEWS.map((view) => (
                <option key={view} value={view}>
                  {t(`academic:calendarView.views.${view}`)}
                </option>
              ))}
            </select>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">{t('academic:calendarView.createNewEvent')}</span>
            </button>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setPanelOpen((prev) => !prev)}
              aria-label={
                panelOpen
                  ? t('academic:calendarView.hidePanel', 'Skrýt panel')
                  : t('academic:calendarView.showPanel', 'Zobrazit panel')
              }
              className="hidden size-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-foreground md:flex"
            >
              {panelOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filter chips */}
        {SUBJECTS.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 pb-3 md:px-6">
            <span className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
              <Filter className="size-3.5" />
              {t('academic:calendarView.filterLabel', 'Filtr:')}
            </span>
            {SUBJECTS.map((subj) => {
              const subject = currentSubjects.find(s => s.name === subj.name || s.code === subj.name)
              const style = getSubjectStyle(subject)
              const isActive = selectedSubjects.includes(subj.name)
              return (
                <button
                  key={subj.id}
                  onClick={() => handleSubjectToggle(subj.name)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-outline-variant bg-surface-container-lowest text-foreground'
                      : 'border-transparent bg-surface-container text-on-surface-variant opacity-60'
                  }`}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: style.dot }}
                  />
                  {subj.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Calendar grid / views */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
          <CalendarGrid
            activeView={activeView}
            gridDays={gridDays}
            filteredEvents={filteredEvents}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            handleEventSelect={handleEventSelect}
            currentWeekDays={currentWeekDays}
            selectedDayEvents={selectedDayEvents}
            hourlySlots={hourlySlots}
            openCreateModal={openCreateModal}
            requirements={currentRequirements}
            subjects={currentSubjects}
          />
        </div>
      </div>

      {/* Desktop reopen tab when panel is collapsed */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          aria-label={t('academic:calendarView.showPanel', 'Zobrazit panel')}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center rounded-l-lg border border-r-0 border-outline-variant bg-surface-container-lowest px-1.5 py-3 text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container hover:text-foreground md:flex"
        >
          <PanelRightOpen className="size-4" />
        </button>
      )}

      {/* RIGHT PANEL: Quick overview or inline detail — hidden on mobile, collapsible on desktop */}
      <aside
        className={`hidden md:flex shrink-0 overflow-hidden border-l border-outline-variant bg-surface-container-lowest transition-all duration-300 ease-in-out ${
          panelOpen ? 'md:w-[22rem] opacity-100' : 'md:w-0 opacity-0 border-l-0'
        }`}
      >
        <div className="flex h-full w-full md:w-[22rem] flex-col gap-6 overflow-y-auto p-5">
          {selectedDetailEvent ? (
            <>
              {/* Desktop Detail View */}
              <div>
                <EventDetailContent
                  selectedDetailEvent={selectedDetailEvent}
                  currentSubjects={currentSubjects}
                  onClose={() => {
                    setSelectedDetailEvent(null)
                    setDeleteConfirmId(null)
                  }}
                  onOpenSubject={onOpenSubject}
                  onEditClick={() => {
                    setEditingEventId(selectedDetailEvent.id)
                    setNewTitle(selectedDetailEvent.title)
                    setNewSubject(selectedDetailEvent.subject)
                    setNewDate(selectedDetailEvent.date)
                    setNewTime(selectedDetailEvent.startTime)
                    setNewType(selectedDetailEvent.type)
                    setIsModalOpen(true)
                    setSelectedDetailEvent(null)
                    setDeleteConfirmId(null)
                  }}
                  onDeleteEvent={onDeleteEvent}
                  deleteConfirmId={deleteConfirmId}
                  setDeleteConfirmId={setDeleteConfirmId}
                />
              </div>
            </>
          ) : (
            <>
             

              <QuickOverviewPanel
                selectedDate={selectedDate}
                todayEvents={todayEvents}
                upcomingDeadlines={upcomingDeadlines}
                onEventClick={handleEventSelect}
                onDeadlineClick={null}
                locale={locale}
                subjects={currentSubjects}
              />
            </>
          )}
        </div>
      </aside>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEventId(null)
        }}
        onSubmit={handleFormSubmit}
        SUBJECTS={SUBJECTS}
        editingEventId={editingEventId}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newType={newType}
        setNewType={setNewType}
        newSubject={newSubject}
        setNewSubject={setNewSubject}
        newDate={newDate}
        setNewDate={setNewDate}
        newTime={newTime}
        setNewTime={setNewTime}
        newDuration={newDuration}
        setNewDuration={setNewDuration}
      />

      {/* Mobile bottom-sheet detail panel */}
      {closingEvent && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div 
            onClick={() => {
              setSelectedDetailEvent(null)
              setDeleteConfirmId(null)
            }}
            className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
              sheetVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* Sheet container */}
          <div 
            role="dialog"
            aria-modal="true"
            className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-outline-variant bg-surface-container-lowest shadow-2xl transition-transform duration-300 ease-out p-5 pb-6 ${
              sheetVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Drag handle line */}
            <div className="sticky top-0 flex justify-center bg-surface-container-lowest pt-1 pb-3">
              <span className="h-1.5 w-10 rounded-full bg-outline-variant/60" />
            </div>
            
            <EventDetailContent
              selectedDetailEvent={closingEvent}
              currentSubjects={currentSubjects}
              onClose={() => {
                setSelectedDetailEvent(null)
                setDeleteConfirmId(null)
              }}
              onOpenSubject={onOpenSubject}
              onEditClick={() => {
                setEditingEventId(closingEvent.id)
                setNewTitle(closingEvent.title)
                setNewSubject(closingEvent.subject)
                setNewDate(closingEvent.date)
                setNewTime(closingEvent.startTime)
                setNewType(closingEvent.type)
                setIsModalOpen(true)
                setSelectedDetailEvent(null)
                setDeleteConfirmId(null)
              }}
              onDeleteEvent={onDeleteEvent}
              deleteConfirmId={deleteConfirmId}
              setDeleteConfirmId={setDeleteConfirmId}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView