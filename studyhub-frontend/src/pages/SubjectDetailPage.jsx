import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useSubjects } from '../hooks/useSubjects'
import { useEvents } from '../hooks/useEvents'
import { useResources } from '../hooks/useResources'
import SubjectDetailView from '../components/SubjectDetailView'
import PageState from '../components/PageState'

const SubjectDetailPage = () => {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { data: subjects, isLoading: subjectsLoading } = useSubjects()
  const { data: events, updateEventStatus: handleUpdateEventStatus, createEvent: handleCreateEvent, isLoading: eventsLoading } = useEvents()
  const { data: resources, uploadResource: handleUploadResource, isLoading: resourcesLoading } = useResources()

  const isLoading = subjectsLoading || eventsLoading || resourcesLoading

  if (isLoading) {
    return <PageState variant="loading" title="Loading..." />
  }

  const subject = subjects.find((s) => s.id === Number(subjectId)) || null

  // If the subject ID is invalid, redirect back to subjects list
  if (!subject) {
    return <Navigate to="/subjects" replace />
  }

  return (
    <SubjectDetailView
      subject={subject}
      events={events}
      resources={resources}
      onBack={() => navigate('/subjects')}
      onUpdateEventStatus={handleUpdateEventStatus}
      onCreateEvent={handleCreateEvent}
      onUploadResource={handleUploadResource}
    />
  )
}

export default SubjectDetailPage
