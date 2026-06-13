import { useSubjects } from '../hooks/useSubjects'
import { useResources } from '../hooks/useResources'
import ResourcesView from '../components/ResourcesView'
import PageState from '../components/PageState'

const MaterialsPage = () => {
  const { data: subjects, isLoading: subjectsLoading } = useSubjects()
  const { data: resources, uploadResource: handleUploadResource, isLoading: resourcesLoading } = useResources()

  const isLoading = subjectsLoading || resourcesLoading

  if (isLoading) {
    return <PageState variant="loading" title="Loading..." />
  }

  return (
    <ResourcesView
      resources={resources}
      subjects={subjects}
      onUploadResource={handleUploadResource}
    />
  )
}

export default MaterialsPage
