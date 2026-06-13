
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react'
import DayCell from './DayCell'
import { getEventStyle, formatDateKey } from './useCalendarState'

const CalendarGrid = ({
  activeView,
  gridDays,
  filteredEvents,
  selectedDate,
  setSelectedDate,
  handleEventSelect,
  currentWeekDays,
  selectedDayEvents,
  hourlySlots,
  openCreateModal
}) => {
  return (
    <div className="flex flex-col w-full">
      {/* MĚSÍČNÍ POHLED */}
      {activeView === 'month' && (
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-[#F2F4F6] rounded-t-md text-center py-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
              <span key={dayName} className="text-label-sm text-[#737686] font-bold">
                {dayName}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-[#E2E8F0] rounded-b-md bg-[#F2F4F6]">
            {gridDays.map((day, idx) => {
              const dayEvents = filteredEvents.filter(e => e.date === day.dateKey)
              const isSelected = formatDateKey(selectedDate) === day.dateKey
              const isToday = formatDateKey(new Date()) === day.dateKey
              
              return (
                <DayCell
                  key={idx}
                  day={day}
                  dayEvents={dayEvents}
                  isSelected={isSelected}
                  isToday={isToday}
                  setSelectedDate={setSelectedDate}
                  handleEventSelect={handleEventSelect}
                />
              )
            })}
          </div>
          
          {/* Mobilní Agenda pod kalendářem */}
          <div className="sm:hidden mt-6 bg-[#F2F4F6] border border-[#E2E8F0] p-4 rounded-lg flex flex-col gap-3">
            <h3 className="text-label-md font-bold text-on-surface">
              Agenda: {selectedDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}
            </h3>
            {selectedDayEvents.length === 0 ? (
              <p className="text-body-md text-[#737686] italic">No events scheduled for this day.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {selectedDayEvents.map(event => {
                  const styleObj = getEventStyle(event.type)
                  return (
                    <div 
                      key={event.id} 
                      onClick={() => handleEventSelect(event)}
                      className="bg-white border border-[#E2E8F0] p-3 rounded-md flex items-center justify-between shadow-ambient cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${styleObj.bg} ${styleObj.text} flex items-center justify-center rounded-sm shrink-0 font-bold text-[10px]`}>
                          {event.code}
                        </div>
                        <div>
                          <h4 className="text-label-md font-bold text-on-surface leading-tight">{event.title}</h4>
                          <span className="text-[10px] text-[#737686] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {event.startTime} {event.endTime && `– ${event.endTime}`}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${styleObj.bg} ${styleObj.text}`}>
                        {event.type}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TÝDENNÍ POHLED */}
      {activeView === 'week' && (
        <div className="w-full flex flex-col border border-[#E2E8F0] rounded-md overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[700px] border-b border-[#E2E8F0] bg-[#F2F4F6] py-3 text-center font-semibold">
            {currentWeekDays.map(day => {
              const isSelected = formatDateKey(selectedDate) === day.dateKey
              return (
                <div 
                  key={day.dateKey} 
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${
                    isSelected ? 'text-primary' : 'text-on-surface'
                  }`}
                >
                  <span className="text-label-sm text-[#737686] font-bold uppercase">{day.dayName}</span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-label-md font-bold transition-all ${
                    isSelected 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'hover:bg-surface-container'
                  }`}>
                    {day.dayNum}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-7 min-w-[700px] bg-white divide-x divide-[#E2E8F0] h-[480px] overflow-y-auto">
            {currentWeekDays.map(day => {
              const dayEvents = filteredEvents.filter(e => e.date === day.dateKey)
              return (
                <div key={day.dateKey} className="p-3 flex flex-col gap-3 min-h-full bg-white hover:bg-slate-50/50 transition-colors">
                  {dayEvents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] text-[#c3c6d7] italic border-2 border-dashed border-[#eceef0] rounded-lg p-2 text-center select-none">
                      No events
                    </div>
                  ) : (
                    dayEvents
                      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                      .map(event => {
                        const styleObj = getEventStyle(event.type)
                        return (
                          <div 
                            key={event.id}
                            onClick={() => handleEventSelect(event)}
                            className={`p-3 rounded-lg border flex flex-col gap-1.5 shadow-sm hover:shadow transition-shadow cursor-pointer ${styleObj.bg} ${styleObj.text} border-black/5`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider">{event.code}</span>
                            </div>
                            <h4 className="text-label-md font-bold leading-snug truncate" title={event.title}>{event.title}</h4>
                            <div className="flex items-center gap-1 text-[10px] opacity-80 mt-0.5">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{event.startTime}</span>
                            </div>
                          </div>
                        )
                      })
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* DENNÍ POHLED */}
      {activeView === 'day' && (
        <div className="w-full flex flex-col border border-[#E2E8F0] rounded-md bg-white p-4">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-0 justify-between border-b border-[#E2E8F0] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#eeefff] text-primary flex items-center justify-center rounded-md">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className=" text-headline-md font-bold text-on-surface capitalize">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-body-md text-[#737686] mt-0.5">Your schedule and deadlines for today</p>
              </div>
            </div>
            
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-label-md bg-primary text-white rounded-md font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-1 max-h-[500px] overflow-y-auto pr-2">
            {hourlySlots.map(hour => {
              const slotEvents = selectedDayEvents.filter(e => {
                if (!e.startTime) return false
                const [eh] = e.startTime.split(':')
                return `${eh.padStart(2, '0')}:00` === hour
              })

              return (
                <div key={hour} className="flex flex-col sm:flex-row gap-4 border-b border-[#eceef0] py-4 items-start ">
                  <span className="w-12 text-label-sm font-bold text-[#737686] text-right pt-0.5">{hour}</span>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    {slotEvents.length === 0 ? (
                      <div className="text-[11px] text-[#c3c6d7] italic pt-1">Free schedule slot</div>
                    ) : (
                      slotEvents.map(event => {
                        const styleObj = getEventStyle(event.type)
                        return (
                          <div 
                            key={event.id}
                            onClick={() => handleEventSelect(event)}
                            className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-ambient hover:shadow-sm transition-all cursor-pointer ${styleObj.bg} ${styleObj.text} border-black/5`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="hidden md:block bg-white/80 px-2 py-1 rounded-sm text-[10px] font-extrabold uppercase shrink-0">
                                {event.code}
                              </div>
                              <div>
                                <h4 className="text-label-md font-bold leading-tight">{event.title}</h4>
                                <span className="text-[10px] flex items-center gap-1 mt-1 opacity-80">
                                  <Clock className="w-3.5 h-3.5" /> {event.startTime} {event.endTime && `– ${event.endTime}`} ({event.type})
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-sm bg-white/70 w-fit self-end md:self-auto`}>
                              {event.subject}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarGrid
