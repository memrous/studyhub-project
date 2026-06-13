import { getEventStyle } from './useCalendarState'

const DayCell = ({
  day,
  dayEvents,
  isSelected,
  isToday,
  setSelectedDate,
  handleEventSelect,
}) => {
  return (
    <div
      onClick={() => setSelectedDate(day.date)}
      className={`cursor-pointer flex flex-col justify-between items-center sm:items-stretch transition-all group relative rounded-lg sm:rounded-none aspect-square sm:aspect-auto min-h-0 sm:min-h-[110px] p-1 sm:p-2 border-1 sm:border-r sm:border-b border-[#E2E8F0] ${
        day.isCurrentMonth ? 'bg-white' : 'bg-[#f7f9fb]'
      } ${
        isSelected 
          ? 'bg-[#eeefff]! border-blue-800' 
          : 'hover:bg-surface-container-low'
      }`}
    >
      <div className="flex justify-between items-start">
        {isSelected ? (
          <span className="w-6 h-6 bg-primary text-white font-bold rounded-full flex items-center justify-center text-label-sm shadow-sm">
            {day.dayNum}
          </span>
        ) : (
          <span className={`text-label-md font-semibold ${
            day.isCurrentMonth 
              ? isToday ? 'text-primary font-bold' : 'text-on-surface'
              : 'text-[#c3c6d7]'
          }`}>
            {day.dayNum}
          </span>
        )}
      </div>

      {/* Seznam akcí pro desktop */}
      <div className="hidden sm:flex flex-col gap-1 mt-2 flex-grow overflow-y-auto max-h-[75px] no-scrollbar">
        {dayEvents.map(event => {
          const styleObj = getEventStyle(event.type)
          return (
            <div 
              key={event.id}
              onClick={(e) => {
                e.stopPropagation(); // Zabrání přepsání selectedDate klikem na políčko
                handleEventSelect(event);
              }}
              title={`${event.code}: ${event.title} (${event.time})`}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm truncate border ${styleObj.bg} ${styleObj.text} border-black/5 hover:brightness-95 transition-all cursor-pointer`}
            >
              {event.code}: {event.title}
            </div>
          )
        })}
      </div>
      
      {/* Tečky pro mobilní zobrazení */}
      <div className="sm:hidden flex flex-wrap gap-0.5 mt-1">
        {dayEvents.slice(0, 3).map(event => {
          const styleObj = getEventStyle(event.type)
          return (
            <span 
              key={event.id}
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: styleObj.dot }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default DayCell
