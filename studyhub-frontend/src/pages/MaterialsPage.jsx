import { useSubjects } from '../hooks/useSubjects'
import { useTranslation } from 'react-i18next'
import { useResources } from '../hooks/useResources'
import ResourcesView from '../components/ResourcesView'
import PageState from '../components/PageState'

const MaterialsPage = () => {
  const { t } = useTranslation('common')
  const { data: subjects, isLoading: subjectsLoading } = useSubjects()
  const { data: resources, uploadResource: handleUploadResource, isLoading: resourcesLoading } = useResources()

  const isLoading = subjectsLoading || resourcesLoading

  if (isLoading) {
    return <PageState variant="loading" title={t('loading')} />
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
