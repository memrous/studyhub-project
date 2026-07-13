
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation(['academic', 'dashboard'])
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-surface-container rounded-lg shadow-2xl border border-outline-variant w-full max-w-md overflow-hidden relative font-inter">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface">
          <h2 className="text-headline-md font-bold text-on-surface">
            {editingEventId ? t('academic:eventModal.editTitle') : t('academic:eventModal.createTitle')}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer rounded-full hover:bg-surface-container-low"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold text-on-surface-variant">{t('academic:eventModal.fields.eventTitle')}</label>
            <input 
              type="text" 
              required
              placeholder={t('academic:eventModal.placeholders.eventTitle')} 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-md border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold text-on-surface-variant">{t('academic:eventModal.fields.type')}</label>
            <select 
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-md border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container transition-colors"
            >
              <option value="Lecture">{t('dashboard:timetable.eventTypes.Lecture')}</option>
              <option value="Lab">{t('dashboard:timetable.eventTypes.Lab')}</option>
              <option value="Exam">{t('dashboard:timetable.eventTypes.Exam')}</option>
              <option value="Deadline">{t('dashboard:timetable.eventTypes.Deadline')}</option>
              <option value="Quiz">{t('dashboard:timetable.eventTypes.Quiz')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold text-on-surface-variant">{t('academic:eventModal.fields.subject')}</label>
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
                        : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0 bg-surface-container-low" />
                    <span className="truncate">{subj.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-bold text-on-surface-variant">{t('academic:eventModal.fields.date')}</label>
              <input 
                type="date" 
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface rounded-md border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-bold text-on-surface-variant">{t('academic:eventModal.fields.startTime')}</label>
              <input 
                type="time" 
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface rounded-md border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold text-on-surface-variant">{t('academic:eventModal.fields.duration')}</label>
            <select 
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-md border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container transition-colors"
            >
              <option value="30">{t('academic:eventModal.durationOptions.30')}</option>
              <option value="60">{t('academic:eventModal.durationOptions.60')}</option>
              <option value="90">{t('academic:eventModal.durationOptions.90')}</option>
              <option value="120">{t('academic:eventModal.durationOptions.120')}</option>
              <option value="180">{t('academic:eventModal.durationOptions.180')}</option>
              <option value="0">{t('academic:eventModal.durationOptions.0')}</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant hover:bg-surface-container-low text-label-md font-semibold text-on-surface-variant rounded-md transition-colors cursor-pointer"
            >
              {t('academic:eventModal.actions.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
            >
              {t('academic:eventModal.actions.save')}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EventModal
