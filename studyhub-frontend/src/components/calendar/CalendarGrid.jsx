import { useState } from 'react'
import { Flame, Zap, GraduationCap, Paperclip, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DayCell from './DayCell'
import { getSubjectStyle, formatDateKey } from './useCalendarState'
import { getLocaleFromLanguage } from '../../utils/locale'

// ─── helpers ────────────────────────────────────────────────────────────────

const getDeadlineIcon = (type) => {
  const t = String(type || '').toLowerCase()
  if (t.includes('test') || t.includes('quiz')) return Zap
  if (t.includes('exam') || t.includes('zkouška')) return GraduationCap
  return Flame
}

// ─── CalendarGrid ────────────────────────────────────────────────────────────

const CalendarGrid = ({
  activeView,
  gridDays,
  filteredEvents,
  selectedDate,
  setSelectedDate,
  handleEventSelect,
  currentWeekDays,
  hourlySlots,
  requirements = [],
  subjects = [],
}) => {
  const { t, i18n } = useTranslation(['academic', 'dashboard'])
  const locale = getLocaleFromLanguage(i18n.language)
  const [mobileDetail, setMobileDetail] = useState(null) // { day, items } | null
  const [sheetVisible, setSheetVisible] = useState(false)

  const openMobileDetail = (day, items) => {
    setMobileDetail({ day, items })
    requestAnimationFrame(() => setSheetVisible(true))
  }
  const closeMobileDetail = () => {
    setSheetVisible(false)
    setTimeout(() => setMobileDetail(null), 250) // must match transition duration below
  }

  // Mobile week view: find the day entry that matches selectedDate
  const selectedDateKey = formatDateKey(selectedDate)
  const mobileWeekDay = currentWeekDays.find(d => d.dateKey === selectedDateKey) || currentWeekDays[0]

  // Mobile day navigation helpers
  const goToPrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }
  const goToNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  // Full weekday names for mobile header
  const WEEKDAYS_LONG = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <div className="flex flex-col w-full">

      {/* ═══════════════════════════════════ MONTH VIEW ══════════════════════════════════ */}
      {activeView === 'month' && (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest flex flex-col w-full">
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low/50 text-center py-2.5">
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(d => (
              <span key={d} className="text-xs font-semibold uppercase text-on-surface-variant">
                {t(`academic:calendarGrid.days.${d}`)}
              </span>
            ))}
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 bg-surface-container-lowest">
            {gridDays.map((day, idx) => {
              const dayEvents = filteredEvents.filter(e => e.date === day.dateKey)
              const dayDeadlines = requirements.filter(r => r.date === day.dateKey && !r.completed)
              const isSelected = formatDateKey(selectedDate) === day.dateKey
              const isToday = formatDateKey(new Date()) === day.dateKey
              return (
                <DayCell
                  key={idx}
                  day={day}
                  dayEvents={dayEvents}
                  dayDeadlines={dayDeadlines}
                  isSelected={isSelected}
                  isToday={isToday}
                  setSelectedDate={setSelectedDate}
                  handleEventSelect={handleEventSelect}
                  onOpenMobileDetail={openMobileDetail}
                  subjects={subjects}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════ WEEK VIEW ═══════════════════════════════════ */}
      {activeView === 'week' && (
        <>
          {/* ── MOBILE: Single-day view ─────────────────────────────────────────────────── */}
          <div className="block md:hidden w-full border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
            {/* Mobile day header with prev/next arrows */}
            {(() => {
              const day = mobileWeekDay
              const isToday = formatDateKey(new Date()) === day.dateKey
              const dayIndex = ['mon','tue','wed','thu','fri','sat','sun'].indexOf(day.dayName)
              const longName = t(`academic:calendarGrid.daysLong.${WEEKDAYS_LONG[dayIndex] ?? day.dayName}`, day.dayName)
              return (
                <div className={`flex items-center justify-center gap-3 px-4 py-3 border-b border-outline-variant bg-surface-container-low/50 ${isToday ? 'bg-primary/5' : ''}`}>
                  <button
                    onClick={goToPrevDay}
                    aria-label="Předchozí den"
                    className="p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                      {longName}
                    </span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isToday ? 'bg-primary text-white shadow-sm' : 'text-on-surface'
                    }`}>
                      {day.dayNum}
                    </span>
                  </div>
                  <button
                    onClick={goToNextDay}
                    aria-label="Následující den"
                    className="p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })()}

            {/* Mobile deadline banner for selected day */}
            {(() => {
              const dayDeadlines = requirements.filter(r => r.date === mobileWeekDay.dateKey && !r.completed)
              if (!dayDeadlines.length) return null
              return (
                <div className="flex flex-col gap-1 px-3 py-2 border-b border-outline-variant bg-surface-container-low/30">
                  {dayDeadlines.map(req => {
                    const subject = subjects.find(s => s.id === req.subjectId || s.id === req.subject_id)
                    const style = getSubjectStyle(subject)
                    const Icon = getDeadlineIcon(req.type)
                    return (
                      <div
                        key={req.id}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded border border-rose-400/50 truncate ${style.bg} ${style.text}`}
                      >
                        <Icon className="w-3 h-3 shrink-0 text-rose-600" />
                        <span className="shrink-0 tabular-nums opacity-80">{req.time || '23:59'}</span>
                        <span className="truncate">{req.title}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Mobile hourly grid — single column */}
            <div className="flex bg-surface max-h-[480px] overflow-y-auto">
              {/* Time gutter */}
              <div className="flex flex-col divide-y divide-outline-variant/30 border-r border-outline-variant/30 shrink-0 w-[44px]">
                {hourlySlots.map(hour => (
                  <div key={hour} className="h-[46px] flex items-start justify-end pr-2 pt-1 relative">
                    <span className="absolute -top-1.5 right-1.5 text-[9px] font-semibold tabular-nums text-on-surface-variant">{hour}</span>
                  </div>
                ))}
              </div>
              {/* Single day column */}
              {(() => {
                const day = mobileWeekDay
                const isToday = formatDateKey(new Date()) === day.dateKey
                const dayEvents = filteredEvents
                  .filter(e => e.date === day.dateKey)
                  .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                return (
                  <div className={`relative flex-1 flex flex-col divide-y divide-outline-variant/20 ${isToday ? 'bg-primary/5' : ''}`}>
                    {hourlySlots.map(hour => (
                      <div key={hour} className="h-[46px]" />
                    ))}
                    {dayEvents.map(event => {
                      const subject = subjects.find(s => s.id === event.subjectId || s.name === event.subject)
                      const style = getSubjectStyle(subject)
                      const parseMinutes = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0) }
                      const startMin = parseMinutes(event.startTime)
                      const endMin = parseMinutes(event.endTime)
                      const gridStartMin = parseMinutes(hourlySlots[0])
                      const slotHeight = 46
                      let topPx = null, heightPx = null
                      if (startMin !== null && gridStartMin !== null) {
                        topPx = ((startMin - gridStartMin) / 60) * slotHeight
                        heightPx = endMin && endMin > startMin ? Math.max(((endMin - startMin) / 60) * slotHeight, 32) : slotHeight
                      }
                      if (topPx !== null) {
                        return (
                          <div
                            key={event.id}
                            onClick={() => handleEventSelect(event)}
                            style={{ top: topPx, height: heightPx, left: 3, right: 3 }}
                            className={`absolute rounded-md p-1.5 flex flex-col overflow-hidden border border-outline-variant/30 hover:z-10 hover:shadow-md cursor-pointer transition-all ${style.bg} ${style.text}`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold uppercase truncate">{event.code}</span>
                              {event.requirementId && <Paperclip className="ml-auto size-2.5 shrink-0 opacity-80" />}
                            </div>
                            {heightPx > 36 && <span className="text-[10px] truncate leading-tight opacity-90">{event.title}</span>}
                            {heightPx > 50 && event.startTime && (
                              <span className="mt-auto text-[9px] opacity-70 tabular-nums">{event.startTime}</span>
                            )}
                          </div>
                        )
                      }
                      return (
                        <div key={event.id} onClick={() => handleEventSelect(event)} className={`m-1 p-2 rounded-md flex flex-col gap-0.5 cursor-pointer border border-outline-variant/30 ${style.bg} ${style.text}`}>
                          <span className="text-[10px] font-bold uppercase truncate">{event.code}</span>
                          <span className="text-[10px] truncate">{event.title}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* ── DESKTOP: Full 7-column scrollable view ──────────────────────────────────── */}
          <div className="hidden md:block w-full border border-outline-variant rounded-xl overflow-x-auto bg-surface-container-lowest">
          <div className="flex flex-col min-w-[700px]">

          {/* Day headers */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] min-w-[700px] border-b border-outline-variant bg-surface-container-low/50 py-2.5 text-center font-semibold">
            {/* empty time gutter header */}
            <div className="border-r border-outline-variant/30" />
            {currentWeekDays.map(day => {
              const isSelected = formatDateKey(selectedDate) === day.dateKey
              const isToday = formatDateKey(new Date()) === day.dateKey
              return (
                <div
                  key={day.dateKey}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex items-baseline justify-between gap-2 border-r border-outline-variant/30 px-2.5 py-1 cursor-pointer transition-colors last:border-r-0 hover:bg-surface-container-low/30 ${
                    isSelected ? 'text-primary' : 'text-on-surface'
                  } ${isToday ? 'bg-primary/5' : ''}`}
                >
                  <span className="text-xs font-semibold uppercase text-on-surface-variant">
                    {t(`academic:calendarGrid.days.${day.dayName}`)}
                  </span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isToday ? 'bg-primary text-white shadow-sm' : isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container text-on-surface'
                  }`}>
                    {day.dayNum}
                  </span>
                </div>
              )
            })}
          </div>

          {/* CELÝ DEN — all-day deadline banner */}
          {currentWeekDays.some(d => requirements.some(r => r.date === d.dateKey && !r.completed)) && (
            <div className="grid grid-cols-[56px_repeat(7,1fr)] min-w-[700px] border-b border-outline-variant bg-surface-container-low/30">
              <div className="flex items-center justify-end pr-2.5 py-1.5 border-r border-outline-variant/30">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Celý den
                </span>
              </div>
              {currentWeekDays.map(day => {
                const dayDeadlines = requirements.filter(r => r.date === day.dateKey && !r.completed)
                const isToday = formatDateKey(new Date()) === day.dateKey
                return (
                  <div key={day.dateKey} className={`p-1 flex flex-col gap-1 min-h-[32px] border-r border-outline-variant/30 last:border-r-0 ${isToday ? 'bg-primary/5' : ''}`}>
                    {dayDeadlines.map(req => {
                      const subject = subjects.find(s => s.id === req.subjectId || s.id === req.subject_id)
                      const style = getSubjectStyle(subject)
                      const Icon = getDeadlineIcon(req.type)
                      return (
                        <div
                          key={req.id}
                          title={`${req.time || '23:59'} ${req.title}`}
                          className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-rose-400/50 dark:border-rose-500/40 truncate hover:brightness-95 transition-all ${style.bg} ${style.text}`}
                        >
                          <Icon className="w-2.5 h-2.5 shrink-0 text-rose-600 dark:text-rose-300" />
                          <span className="shrink-0 tabular-nums opacity-90">{req.time || '23:59'}</span>
                          <span className="truncate">{req.title}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {/* Hourly event grid */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] min-w-[700px] bg-surface divide-x divide-outline-variant/30 max-h-[480px] overflow-y-auto">
            {/* Time gutter */}
            <div className="flex flex-col divide-y divide-outline-variant/30 border-r border-outline-variant/30">
              {hourlySlots.map(hour => (
                <div key={hour} className="h-[46px] flex items-start justify-end pr-2 pt-1 relative">
                  <span className="absolute -top-1.5 right-1.5 text-[9px] font-semibold tabular-nums text-on-surface-variant">{hour}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {currentWeekDays.map(day => {
              const dayEvents = filteredEvents
                .filter(e => e.date === day.dateKey)
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
              const isToday = formatDateKey(new Date()) === day.dateKey

              return (
                <div
                  key={day.dateKey}
                  className={`relative flex flex-col divide-y divide-outline-variant/20 hover:bg-surface-container-low/40 transition-colors ${isToday ? 'bg-primary/5' : ''}`}
                >
                  {/* Hour rows (background grid) */}
                  {hourlySlots.map(hour => (
                    <div key={hour} className="h-[46px]" />
                  ))}

                  {/* Event blocks positioned absolutely */}
                  {dayEvents.map(event => {
                    const subject = subjects.find(s => s.id === event.subjectId || s.name === event.subject)
                    const style = getSubjectStyle(subject)

                    // Calculate top offset and height from startTime/endTime
                    const parseMinutes = (t) => {
                      if (!t) return null
                      const [h, m] = t.split(':').map(Number)
                      return h * 60 + (m || 0)
                    }
                    const startMin = parseMinutes(event.startTime)
                    const endMin = parseMinutes(event.endTime)
                    const gridStartMin = parseMinutes(hourlySlots[0]) // e.g. 8:00 → 480
                    const slotHeight = 46 // px per hour

                    let topPx = null
                    let heightPx = null
                    if (startMin !== null && gridStartMin !== null) {
                      topPx = ((startMin - gridStartMin) / 60) * slotHeight
                      heightPx = endMin && endMin > startMin
                        ? Math.max(((endMin - startMin) / 60) * slotHeight, 32)
                        : slotHeight
                    }

                    const typeLabel = t(`dashboard:timetable.eventTypes.${event.type}`, event.type)

                    if (topPx !== null) {
                      return (
                        <div
                          key={event.id}
                          onClick={() => handleEventSelect(event)}
                          title={`${event.code} · ${event.title}`}
                          style={{ top: topPx, height: heightPx, left: 3, right: 3 }}
                          className={`absolute rounded-md p-1.5 flex flex-col overflow-hidden border border-outline-variant/30 hover:z-10 hover:shadow-md cursor-pointer transition-all ${style.bg} ${style.text}`}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold uppercase truncate">
                              {event.code}
                            </span>
                            <span className="hidden truncate text-[9px] opacity-70 sm:inline">
                              · {typeLabel}
                            </span>
                            {event.requirementId && <Paperclip className="ml-auto size-2.5 shrink-0 opacity-80" />}
                          </div>
                          {heightPx > 36 && (
                            <span className="text-[10px] truncate leading-tight opacity-90">
                              {event.title}
                            </span>
                          )}
                          {heightPx > 50 && event.location && (
                            <span className="mt-auto flex items-center gap-0.5 truncate text-[9px] font-medium opacity-90">
                              <MapPin className="size-2.5 shrink-0" />
                              <span className="truncate">{event.location}</span>
                              <span className="ml-auto shrink-0 tabular-nums opacity-70">
                                {event.startTime}
                              </span>
                            </span>
                          )}
                          {heightPx <= 50 && heightPx > 36 && (
                            <span className="text-[9px] opacity-70 mt-auto">
                              {event.startTime}
                            </span>
                          )}
                        </div>
                      )
                    }

                    // Fallback: no time info, render as card
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventSelect(event)}
                        className={`m-1 p-2 rounded-md flex flex-col gap-0.5 shadow-sm cursor-pointer border border-outline-variant/30 ${style.bg} ${style.text}`}
                      >
                        <span className="text-[10px] font-bold uppercase truncate">{event.code}</span>
                        <span className="text-[10px] truncate">{event.title}</span>
                        <span className="text-[9px] opacity-70">{event.startTime}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          </div>{/* /inner min-w-[700px] */}
          </div>{/* /desktop md:block wrapper */}
        </>
      )}

      {/* ════════════════════════════════ AGENDA VIEW ════════════════════════════════════ */}
      {activeView === 'agenda' && (
        <div className="w-full flex flex-col gap-4">
          {currentWeekDays.map(day => {
            const dayEvents = filteredEvents
              .filter(e => e.date === day.dateKey)
              .map(e => ({ ...e, _kind: 'event' }))
            const dayDeadlines = requirements
              .filter(r => r.date === day.dateKey && !r.completed)
              .map(r => ({ ...r, _kind: 'deadline' }))

            const allItems = [...dayEvents, ...dayDeadlines].sort((a, b) => {
              const ta = a.startTime || a.time || '23:59'
              const tb = b.startTime || b.time || '23:59'
              return ta.localeCompare(tb)
            })

            const dayLabel = day.date.toLocaleDateString(locale, { weekday: 'long' })
            const dateLabel = day.date.toLocaleDateString(locale, { day: 'numeric', month: 'numeric' })

            return (
              <div key={day.dateKey} className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                {/* Day header */}
                <div className="flex items-baseline gap-2 border-b border-outline-variant bg-surface-container-low/40 px-4 py-2.5">
                  <span className="text-sm font-semibold capitalize text-on-surface">
                    {dayLabel}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {dateLabel}
                  </span>
                </div>

                {allItems.length === 0 ? (
                  <div className="px-4 py-4 text-xs text-on-surface-variant italic">
                    {t('academic:calendarGrid.noEvents')}
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/30 flex flex-col">
                    {allItems.map((item, idx) => {
                      if (item._kind === 'event') {
                        const subject = subjects.find(s => s.id === item.subjectId || s.name === item.subject)
                        const style = getSubjectStyle(subject)
                        const typeLabel = t(`dashboard:timetable.eventTypes.${item.type}`, item.type)
                        const timeRange = item.endTime && item.endTime !== item.startTime
                          ? `${item.startTime}–${item.endTime}`
                          : item.startTime

                        return (
                          <div
                            key={`e-${item.id}-${idx}`}
                            onClick={() => handleEventSelect(item)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low/40 cursor-pointer"
                          >
                            {/* Time — always visible */}
                            <span className="w-12 shrink-0 text-xs font-semibold tabular-nums text-on-surface-variant">
                              {item.startTime}
                            </span>

                            {/* Colored vertical bar */}
                            <span
                              className="h-8 w-1 shrink-0 rounded-full"
                              style={{ backgroundColor: style.dot }}
                            />

                            {/* Content */}
                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                              <p className="flex items-center gap-1.5 truncate text-[11px] font-extrabold text-on-surface-variant leading-none">
                                {item.code} · {typeLabel}
                                {item.requirementId && (
                                  <Paperclip className="size-3 text-on-surface-variant shrink-0" />
                                )}
                              </p>
                              <span className="text-sm font-semibold text-on-surface leading-snug truncate">
                                {item.title}
                              </span>
                            </div>

                            {/* Right: room + time range — desktop only */}
                            <span className="hidden sm:flex shrink-0 items-center gap-1 text-xs text-on-surface-variant">
                              <MapPin className="size-3" />
                              {item.location || '—'}
                            </span>
                            <span className="hidden sm:flex shrink-0 items-center gap-1 text-xs text-on-surface-variant">
                              <Clock className="size-3" />
                              {timeRange}
                            </span>
                          </div>
                        )
                      } else {
                        // Deadline row
                        const subject = subjects.find(s => s.id === item.subjectId || s.id === item.subject_id)
                        const style = getSubjectStyle(subject)
                        const Icon = getDeadlineIcon(item.type)
                        const subjectCode = subject?.code || ''
                        const dueTime = item.time || '23:59'

                        return (
                          <div
                            key={`d-${item.id}-${idx}`}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low/40"
                          >
                            {/* Time */}
                            <span className="w-12 shrink-0 text-xs font-semibold tabular-nums text-on-surface-variant">
                              {dueTime}
                            </span>

                            {/* Icon circle */}
                            <span
                              className={`flex size-8 items-center justify-center rounded-lg shrink-0 ${style.bg} ${style.text}`}
                            >
                              <Icon className="size-4" />
                            </span>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-semibold text-on-surface leading-snug block truncate">
                                {item.title}
                              </span>
                              <span className={`text-xs font-semibold ${style.text}`}>
                                {subjectCode} · Odevzdání
                              </span>
                            </div>

                            {/* Right time — hidden on very narrow screens to prevent overlap */}
                            <span className="hidden sm:inline shrink-0 text-xs font-semibold tabular-nums text-on-surface-variant">
                              {dueTime}
                            </span>
                          </div>
                        )
                      }
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Mobile day-detail bottom sheet (triggered from month view badge) */}
      {mobileDetail && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex items-end"
          onClick={closeMobileDetail}
        >
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-250 ${
              sheetVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-h-[70vh] overflow-y-auto rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant p-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-250 ease-out ${
              sheetVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-outline-variant" />
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">
                {mobileDetail.day.dayNum}. {t(`academic:calendarGrid.days.${mobileDetail.day.dayName}`)}
              </span>
              <button onClick={closeMobileDetail} className="text-xs text-on-surface-variant">
                Zavřít
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {mobileDetail.items.map((item, idx) => {
                if (item._kind === 'deadline') {
                  const subject = subjects.find(s => s.id === item.subjectId || s.id === item.subject_id)
                  const style = getSubjectStyle(subject)
                  const Icon = getDeadlineIcon(item.type)
                  return (
                    <div
                      key={`d-${item.id ?? idx}`}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 border border-rose-400/30 ${style.bg} ${style.text}`}
                    >
                      <Icon className="size-4 shrink-0 text-rose-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-[11px] opacity-80">{item.time || '23:59'}</p>
                      </div>
                    </div>
                  )
                }
                const subject = subjects.find(s => s.id === item.subjectId || s.name === item.subject)
                const style = getSubjectStyle(subject)
                return (
                  <button
                    key={`e-${item.id ?? idx}`}
                    onClick={() => { handleEventSelect(item); closeMobileDetail() }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 border border-outline-variant/30 text-left ${style.bg} ${style.text}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: style.dot }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase truncate">{item.code}</p>
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                    </div>
                    {item.startTime && (
                      <span className="shrink-0 text-xs tabular-nums opacity-70">{item.startTime}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default CalendarGrid
