
import { X } from 'lucide-react'

const EventModal = ({
  isOpen,
  onClose,
  onSubmit,
  SUBJECTS,
  editingEventId,
  newTitle,
  setNewTitle,
  newType,
  setNewType,
  newSubject,
  setNewSubject,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  newDuration,
  setNewDuration,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-2xl border border-[#E2E8F0] w-full max-w-md overflow-hidden relative font-inter">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-surface">
          <h2 className="text-headline-md font-bold text-on-surface">
            {editingEventId ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer rounded-full hover:bg-[#E2E8F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold text-on-surface-variant">Event Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Database Systems Practical Test" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-md border border-[#E2E8F0] text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold text-on-surface-variant">Type</label>
            <select 
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-md border border-[#E2E8F0] text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-white transition-colors"
            >
              <option value="Lecture">Lecture</option>
              <option value="Lab">Lab</option>
              <option value="Exam">Exam</option>
              <option value="Deadline">Deadline</option>
              <option value="Quiz">Quiz</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold text-on-surface-variant">Subject</label>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map(subj => {
                const isSelected = newSubject === subj.name
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => setNewSubject(subj.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-md border text-left text-label-sm font-semibold transition-all cursor-pointer ${
                      isSelected 
                        ? `bg-primary/10 border-primary text-primary ring-1 ring-primary/25` 
                        : 'bg-white border-[#E2E8F0] text-on-surface-variant hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0 bg-slate-400" />
                    <span className="truncate">{subj.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-bold text-on-surface-variant">Date</label>
              <input 
                type="date" 
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface rounded-md border border-[#E2E8F0] text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-bold text-on-surface-variant">Start Time</label>
              <input 
                type="time" 
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface rounded-md border border-[#E2E8F0] text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold text-on-surface-variant">Duration (Minutes)</label>
            <select 
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-md border border-[#E2E8F0] text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-white transition-colors"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="0">Deadline (All Day)</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-label-md font-semibold text-on-surface-variant rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-label-md font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
            >
              Save Event
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EventModal
