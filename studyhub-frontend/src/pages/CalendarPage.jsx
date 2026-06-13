import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSubjects } from '../hooks/useSubjects'
import { useEvents } from '../hooks/useEvents'
import CalendarView from '../components/CalendarView'
import PageState from '../components/PageState'

const CalendarPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // openEventId may be passed via navigate('/calendar', { state: { openEventId } })
  const [openEventId, setOpenEventId] = useState(
    location.state?.openEventId ?? null
  )

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError, refetch: refetchSubjects } = useSubjects()
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
    createEvent: handleCreateEvent,
    editEvent: handleEditEvent,
    deleteEvent: handleDeleteEvent,
  } = useEvents()

  const isLoading = subjectsLoading || eventsLoading
  const error = subjectsError || eventsError
  const reloadData = () => {
    refetchSubjects()
    refetchEvents()
  }

  // Clear the router state so a refresh doesn't re-open the event
  useEffect(() => {
    if (location.state?.openEventId) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.state?.openEventId, navigate, location.pathname])

  if (isLoading) {
    return <PageState variant="loading" title="Loading..." />
  }

  if (error) {
    return (
      <PageState
        variant="error"
        title={error}
        description="Zkuste stránku načíst znovu."
        actionLabel="Zkusit znovu"
        onAction={reloadData}
      />
    )
  }

  if (events.length === 0 && subjects.length === 0) {
    return (
      <PageState
        variant="empty"
        title="Žádná data"
        description="Kalendář zatím neobsahuje žádné události."
      />
    )
  }

  return (
    <CalendarView
      events={events}
      subjects={subjects}
      onCreateEvent={handleCreateEvent}
      onEditEvent={handleEditEvent}
      onDeleteEvent={handleDeleteEvent}
      onOpenSubject={(subjectId) => navigate(`/subjects/${subjectId}`)}
      openEventId={openEventId}
      onCloseOpenEvent={() => setOpenEventId(null)}
    />
  )
}

export default CalendarPage
