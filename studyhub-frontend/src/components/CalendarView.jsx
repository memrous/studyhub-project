
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus
} from 'lucide-react'
import { useCalendarState, getEventStyle } from './calendar/useCalendarState'
import CalendarGrid from './calendar/CalendarGrid'
import EventModal from './calendar/EventModal'
import EventDetailModal from './calendar/EventDetailModal'

const CalendarView = ({ 
  events: propEvents, 
  subjects: propSubjects, 
  onCreateEvent, 
  onEditEvent, 
  onDeleteEvent, 
  onOpenSubject,
  openEventId,        
  onCloseOpenEvent     
}) => {
  const currentEvents = propEvents || []
  const currentSubjects = propSubjects || []

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
    upcomingEventsList,
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

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 font-inter text-on-surface">
      
      {/* LEVÝ SLOUPEC: Mřížka kalendáře */}
      <div className="flex-1 min-w-0 bg-white border border-[#E2E8F0] p-6 rounded-lg shadow-ambient">
        
        {/* Hlavička kalendáře */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-6 mb-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-headline-lg font-bold text-on-surface">Calendar</h1>
            <div className="flex items-center gap-4">
              <span className="text-headline-md text-on-surface font-semibold capitalize">
                {activeView === 'month' ? getMonthName(currentMonth) : getMonthName(selectedDate)}
              </span>
              <div className="flex items-center bg-[#F2F4F6] rounded-md border border-[#E2E8F0]">
                <button 
                  onClick={handlePrev}
                  className="p-1.5 hover:bg-surface-container transition-colors rounded-l-md cursor-pointer border-r border-[#E2E8F0]"
                >
                  <ChevronLeft className="w-4 h-4 text-[#737686]" />
                </button>
                <button 
                  onClick={handleNext}
                  className="p-1.5 hover:bg-surface-container transition-colors rounded-r-md cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-[#737686]" />
                </button>
              </div>
            </div>
          </div>

          {/* Přepínání pohledů */}
          <div className="flex p-0.5 bg-[#F2F4F6] border border-[#E2E8F0] rounded-md shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
            {['Month', 'Week', 'Day'].map((view) => (
              <button
                key={view}
                onClick={() => {
                  setActiveView(view.toLowerCase())
                  if (view.toLowerCase() === 'month') {
                    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
                  }
                }}
                className={`px-4 py-1.5 rounded-sm text-label-md font-semibold transition-all cursor-pointer flex-1 sm:flex-none text-center ${
                  activeView === view.toLowerCase()
                    ? 'bg-white text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

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
        />
      </div>

      {/* PRAVÝ SLOUPEC: Filtry a Nadcházející události */}
      <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
        
        <button 
          onClick={openCreateModal}
          className="w-full bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.98] text-white flex items-center justify-center gap-2 py-3 rounded-lg font-semibold shadow-md transition-all text-body-lg cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </button>

        {/* Přehled blížících se akcí */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-lg shadow-ambient">
          <h2 className="text-headline-md font-bold text-on-surface mb-4">Upcoming Events</h2>
          
          <div className="flex flex-col gap-3">
            {upcomingEventsList.length === 0 ? (
              <p className="text-body-md text-[#737686] italic text-center py-4">No upcoming events filter matches.</p>
            ) : (
              upcomingEventsList.map(event => {
                const styleObj = getEventStyle(event.type)
                const dateText = new Date(event.date).toLocaleDateString('cs-CZ', { 
                  month: 'short', 
                  day: 'numeric' 
                })
                
                return (
                  <div 
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    className="bg-white border border-[#E2E8F0] p-4 rounded-lg flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1" 
                      style={{ backgroundColor: styleObj.dot }}
                    />
                    
                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${styleObj.bg} ${styleObj.text}`}>
                        {event.code}
                      </span>
                      <span className="text-[10px] text-[#737686] font-semibold">
                        {dateText}, {event.time}
                      </span>
                    </div>
                    <h3 className="text-label-md font-bold text-on-surface leading-snug truncate group-hover:text-primary transition-colors" title={event.title}>
                      {event.title}
                    </h3>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Dynamické Checkboxy pro filtry */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-lg shadow-ambient">
          <h2 className="text-headline-md font-bold text-on-surface mb-4">Filter by Subject</h2>
          
          <div className="flex flex-col gap-3">
            {SUBJECTS.map(subj => {
              const isChecked = selectedSubjects.includes(subj.name)
              return (
                <label 
                  key={subj.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[#F2F4F6] transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSubjectToggle(subj.name)}
                      className="w-4.5 h-4.5 rounded border-[#E2E8F0] text-primary focus:ring-primary accent-primary shrink-0 cursor-pointer"
                    />
                    <span className="text-body-md font-semibold text-on-surface">{subj.name}</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-slate-400" />
                </label>
              )
            })}
          </div>
        </div>

        {/* Legend / Vysvětlivky barev */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-lg shadow-ambient">
          <h2 className="text-headline-md font-bold text-on-surface mb-4">Event Types</h2>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-sm shrink-0 bg-[#eeefff] border border-[#004ac6]/20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]" />
              </span>
              <div className="flex flex-col">
                <span className="text-body-md font-bold text-on-surface leading-none">Lectures & Labs</span>
                <span className="text-[11px] text-[#737686] mt-0.5">Regular classes and seminars</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-sm shrink-0 bg-[#e6f4ea] border border-[#117a3a]/20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#117a3a]" />
              </span>
              <div className="flex flex-col">
                <span className="text-body-md font-bold text-on-surface leading-none">Assignments</span>
                <span className="text-[11px] text-[#737686] mt-0.5">Homework and project milestones</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-sm shrink-0 bg-[#ffede6] border border-[#bc4800]/20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bc4800]" />
              </span>
              <div className="flex flex-col">
                <span className="text-body-md font-bold text-on-surface leading-none">Tests & Quizzes</span>
                <span className="text-[11px] text-[#737686] mt-0.5">Midterms, small tests and quizzes</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-sm shrink-0 bg-[#ffdad6] border border-[#ba1a1a]/20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
              </span>
              <div className="flex flex-col">
                <span className="text-body-md font-bold text-on-surface leading-none">Exams & Deadlines</span>
                <span className="text-[11px] text-[#ba1a1a] font-semibold mt-0.5">Final exams and strict deadlines</span>
              </div>
            </div>
          </div>
        </div>

      </div>

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

      <EventDetailModal
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
  )
}

export default CalendarView