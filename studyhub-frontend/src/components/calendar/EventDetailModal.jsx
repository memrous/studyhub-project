
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { getEventStyle } from './useCalendarState'

const EventDetailModal = ({
  selectedDetailEvent,
  currentSubjects,
  onClose,
  onOpenSubject,
  onEditClick,
  onDeleteEvent,
  deleteConfirmId,
  setDeleteConfirmId,
}) => {
  if (!selectedDetailEvent) return null

  const targetSubject = currentSubjects.find(s => s.id === selectedDetailEvent.subjectId)
  const styleObj = getEventStyle(selectedDetailEvent.type)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-2xl border border-[#E2E8F0] w-full max-w-md overflow-hidden relative font-inter animate-in fade-in zoom-in-95 duration-150">
        
        <div className={`px-6 py-4 border-b border-[#E2E8F0] ${styleObj.bg} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-sm bg-white border border-black/5 ${styleObj.text}`}>
              {selectedDetailEvent.code}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-sm bg-white/60 ${styleObj.text}`}>
              {selectedDetailEvent.type}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4.5">
          <div>
            <h3 className="text-headline-md font-bold text-on-surface leading-tight">
              {selectedDetailEvent.title}
            </h3>
            <p className="text-body-md font-semibold text-primary mt-1">
              {targetSubject ? targetSubject.name : 'Unknown Subject'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-[#F2F4F6] p-3 rounded-lg border border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <CalendarIcon className="w-4 h-4 text-[#737686] shrink-0" />
              <span className="text-label-md font-medium text-on-surface">
                {new Date(selectedDetailEvent.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Clock className="w-4 h-4 text-[#737686] shrink-0" />
              <span className="text-label-md font-medium text-on-surface">
                {selectedDetailEvent.startTime} {selectedDetailEvent.endTime && `– ${selectedDetailEvent.endTime}`}
              </span>
            </div>
          </div>

          {targetSubject && (
            <div className="flex flex-col gap-2.5 border-t border-[#E2E8F0] pt-4">
              <div className="flex justify-between items-center text-body-md">
                <span className="text-[#737686] font-medium">Lecturer:</span>
                <span className="font-bold text-on-surface">{targetSubject.lecturer || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-[#737686] font-medium">Credits / Completion:</span>
                <span className="font-semibold text-on-surface">
                  {targetSubject.credits} STAG Credits ({targetSubject.completionType})
                </span>
              </div>
              {targetSubject.description && (
                <div className="flex flex-col gap-1 mt-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-[11px] text-[#737686] font-bold uppercase tracking-wider">Subject Description:</span>
                  <p className="text-label-sm text-on-surface-variant leading-relaxed line-clamp-3">
                    {targetSubject.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#E2E8F0]">
            <button
              onClick={() => {
                if (targetSubject && onOpenSubject) {
                  onOpenSubject(targetSubject.id)
                }
                onClose()
              }}
              className="w-full bg-[#004ac6] hover:bg-[#003ea8] text-white py-2 rounded-md font-semibold text-label-md transition-colors shadow-sm cursor-pointer text-center"
            >
              Open Subject Hub
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onEditClick}
                className="border border-[#E2E8F0] hover:bg-slate-50 text-on-surface-variant font-bold py-2 rounded-md text-label-md transition-colors cursor-pointer"
              >
                Edit Event
              </button>

              {deleteConfirmId === selectedDetailEvent.id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteEvent) {
                      onDeleteEvent(selectedDetailEvent.id)
                    }
                    onClose()
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md text-label-md transition-all cursor-pointer shadow-sm animate-pulse text-center"
                >
                  Are you sure?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(selectedDetailEvent.id)}
                  className="border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded-md text-label-md transition-colors cursor-pointer text-center"
                >
                  Delete Event
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default EventDetailModal
