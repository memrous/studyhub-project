import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DayCell from './DayCell'
import { getEventStyle, formatDateKey } from './useCalendarState'
import CustomIcon from '../CustomIcon'
import { getLocaleFromLanguage } from '../../utils/locale'

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
  const { t, i18n } = useTranslation(['academic', 'dashboard'])
  const locale = getLocaleFromLanguage(i18n.language)
  return (
    <div className="flex flex-col w-full">
      {/* MĚSÍČNÍ POHLED */}
      {activeView === 'month' && (
        <div className="flex flex-col w-full">
          <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low rounded-t-md text-center py-2">
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(dayName => (
              <span key={dayName} className="text-label-sm text-on-surface-variant font-bold">
                {t(`academic:calendarGrid.days.${dayName}`)}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-outline-variant rounded-b-md bg-surface-container-low">
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
          <div className="sm:hidden mt-6 bg-surface-container-low border border-outline-variant p-4 rounded-lg flex flex-col gap-3">
            <h3 className="text-label-md font-bold text-on-surface">
              {t('academic:calendarGrid.agenda')} {selectedDate.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
            </h3>
            {selectedDayEvents.length === 0 ? (
              <p className="text-body-md text-on-surface-variant italic">{t('academic:calendarGrid.noEventsToday')}</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {selectedDayEvents.map(event => {
                  const styleObj = getEventStyle(event.type)
                  return (
                    <div 
                      key={event.id} 
                      onClick={() => handleEventSelect(event)}
                      className="bg-surface-container border border-outline-variant p-3 rounded-md flex items-center justify-between shadow-ambient cursor-pointer hover:bg-surface-container-low"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${styleObj.bg} ${styleObj.text} flex items-center justify-center rounded-sm shrink-0 font-bold text-[10px]`}>
                          {event.code}
                        </div>
                        <div>
                          <h4 className="text-label-md font-bold text-on-surface leading-tight">{event.title}</h4>
                          <span className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                            <CustomIcon name="clock" className="w-3 h-3" /> {event.startTime} {event.endTime && `– ${event.endTime}`}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${styleObj.bg} ${styleObj.text}`}>
                        {t(`dashboard:timetable.eventTypes.${event.type}`, event.type)}
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
        <div className="w-full flex flex-col border border-outline-variant rounded-md overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[700px] border-b border-outline-variant bg-surface-container-low py-3 text-center font-semibold">
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
                  <span className="text-label-sm text-on-surface-variant font-bold uppercase">{t(`academic:calendarGrid.days.${day.dayName}`)}</span>
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

          <div className="grid grid-cols-7 min-w-[700px] bg-surface divide-x divide-outline-variant h-[480px] overflow-y-auto">
            {currentWeekDays.map(day => {
              const dayEvents = filteredEvents.filter(e => e.date === day.dateKey)
              return (
                <div key={day.dateKey} className="p-3 flex flex-col gap-3 min-h-full bg-surface hover:bg-surface-container-low/60 transition-colors">
                  {dayEvents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] text-on-surface-variant italic border-2 border-dashed border-surface-container rounded-lg p-2 text-center select-none">
                      {t('academic:calendarGrid.noEvents')}
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
                            className={`p-3 rounded-lg border flex flex-col gap-1.5 shadow-sm hover:shadow transition-shadow cursor-pointer ${styleObj.bg} ${styleObj.text} border-outline-variant/30`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider">{event.code}</span>
                            </div>
                            <h4 className="text-label-md font-bold leading-snug truncate" title={event.title}>{event.title}</h4>
                            <div className="flex items-center gap-1 text-[10px] opacity-80 mt-0.5">
                              <CustomIcon name="clock" className="w-3 h-3 shrink-0" />
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
        <div className="w-full flex flex-col border border-outline-variant rounded-md bg-surface p-4">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-0 justify-between border-b border-outline-variant pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-on-primary-container text-primary flex items-center justify-center rounded-md">
                <CustomIcon name="calendar" className="w-5 h-5" />
              </div>
              <div>
                <h3 className=" text-headline-md font-bold text-on-surface capitalize">
                  {selectedDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-body-md text-on-surface-variant mt-0.5">{t('academic:calendarGrid.yourSchedule')}</p>
              </div>
            </div>
            
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-label-md bg-primary text-white rounded-md font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {t('academic:calendarGrid.addEvent')}
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
                    <div key={hour} className="flex flex-col sm:flex-row gap-4 border-b border-surface-container py-4 items-start ">
                      <span className="w-12 text-label-sm font-bold text-on-surface-variant text-right pt-0.5">{hour}</span>
                      
                      <div className="flex-1 flex flex-col gap-2">
                    {slotEvents.length === 0 ? (
                      <div className="text-[11px] text-on-surface-variant italic pt-1">{t('academic:calendarGrid.freeSlot')}</div>
                    ) : (
                      slotEvents.map(event => {
                        const styleObj = getEventStyle(event.type)
                        return (
                          <div 
                            key={event.id}
                            onClick={() => handleEventSelect(event)}
                            className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-ambient hover:shadow-sm transition-all cursor-pointer ${styleObj.bg} ${styleObj.text} border-outline-variant/30`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="hidden md:block bg-surface-container-highest/80 px-2 py-1 rounded-sm text-[10px] font-extrabold uppercase shrink-0 text-on-surface">
                                {event.code}
                              </div>
                              <div>
                                <h4 className="text-label-md font-bold leading-tight">{event.title}</h4>
                                <span className="text-[10px] flex items-center gap-1 mt-1 opacity-80">
                                  <CustomIcon name="clock" className="w-3.5 h-3.5" /> {event.startTime} {event.endTime && `– ${event.endTime}`} ({t(`dashboard:timetable.eventTypes.${event.type}`, event.type)})
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-sm bg-surface-container-highest/70 w-fit self-end md:self-auto text-on-surface`}>
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
