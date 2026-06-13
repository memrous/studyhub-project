import { useState, useMemo, useEffect } from 'react'
import { useCalendarGrid, formatDateKey } from './useCalendarGrid'
import { useCalendarFilters } from './useCalendarFilters'
import { useEventForm } from './useEventForm'

export { formatDateKey } from './useCalendarGrid'

export const TYPE_COLOR_MAP = {
  'Lecture': { color: 'blue', dot: '#004ac6', bg: 'bg-[#eeefff]', text: 'text-[#004ac6]' },
  'Lab': { color: 'blue', dot: '#004ac6', bg: 'bg-[#eeefff]', text: 'text-[#004ac6]' },
  'Assignment': { color: 'green', dot: '#117a3a', bg: 'bg-[#e6f4ea]', text: 'text-[#117a3a]' },
  'Test': { color: 'orange', dot: '#bc4800', bg: 'bg-[#ffede6]', text: 'text-[#bc4800]' },
  'Quiz': { color: 'orange', dot: '#bc4800', bg: 'bg-[#ffede6]', text: 'text-[#bc4800]' },
  'Exam': { color: 'red', dot: '#ba1a1a', bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]' },
  'Deadline': { color: 'red', dot: '#ba1a1a', bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]' },
  'default': { color: 'grey', dot: '#737686', bg: 'bg-[#eceef0]', text: 'text-[#737686]' }
}

export const getEventStyle = (type) => {
  return TYPE_COLOR_MAP[type] || TYPE_COLOR_MAP['default']
}

export const useCalendarState = ({
  currentEvents = [],
  currentSubjects = [],
  onCreateEvent,
  onEditEvent,
  openEventId,
  onCloseOpenEvent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [selectedDetailEvent, setSelectedDetailEvent] = useState(null)

  const grid = useCalendarGrid()
  const filters = useCalendarFilters(currentEvents, currentSubjects)
  const form = useEventForm({
    currentSubjects,
    onEditEvent,
    onCreateEvent,
    setIsModalOpen,
  })

  // Synchronize calendar selected date / view when openEventId is provided (e.g. from Dashboard)
  useEffect(() => {
    if (openEventId) {
      const targetEvent = filters.preparedEvents.find(e => e.id === Number(openEventId))
      if (targetEvent) {
        const eventDateObj = new Date(targetEvent.date)
        setTimeout(() => {
          grid.setSelectedDate(eventDateObj)
          grid.setCurrentMonth(new Date(eventDateObj.getFullYear(), eventDateObj.getMonth(), 1))
          setSelectedDetailEvent(targetEvent)
        }, 0)
      }
      if (onCloseOpenEvent) {
        onCloseOpenEvent()
      }
    }
  }, [openEventId, filters.preparedEvents, onCloseOpenEvent, grid])

  const handleEventSelect = (event) => {
    const eventDateObj = new Date(event.date)
    grid.setSelectedDate(eventDateObj)
    grid.setCurrentMonth(new Date(eventDateObj.getFullYear(), eventDateObj.getMonth(), 1))
    setSelectedDetailEvent(event)
  }

  const openCreateModal = () => {
    form.openCreateModal(formatDateKey(grid.selectedDate))
  }

  const selectedDayEvents = useMemo(() => {
    const key = formatDateKey(grid.selectedDate)
    return filters.filteredEvents.filter(e => e.date === key)
  }, [filters.filteredEvents, grid.selectedDate])

  const upcomingEventsList = useMemo(() => {
    const startOfDay = new Date(grid.selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    return filters.filteredEvents
      .filter(e => {
        const eventDate = new Date(e.date)
        return eventDate >= startOfDay
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return (a.startTime || '').localeCompare(b.startTime || '')
      })
      .slice(0, 5)
  }, [filters.filteredEvents, grid.selectedDate])

  return {
    ...grid,
    ...filters,
    ...form,
    isModalOpen,
    setIsModalOpen,
    deleteConfirmId,
    setDeleteConfirmId,
    selectedDetailEvent,
    setSelectedDetailEvent,
    handleEventSelect,
    openCreateModal,
    selectedDayEvents,
    upcomingEventsList,
  }
}
