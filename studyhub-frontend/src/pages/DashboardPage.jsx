import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, BookOpen } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import * as api from '../services/api'
import { useAppState } from '../context/AppStateContext'
import { useAuth } from '../context/AuthContext'
import { useSubjects } from '../hooks/useSubjects'
import { useEvents } from '../hooks/useEvents'
import { useResources } from '../hooks/useResources'
import PageState from '../components/PageState'

import StatsRow from '../components/StatsRow'
import SubjectCard from '../components/SubjectCard'
import Timetable from '../components/Timetable'
import Deadlines from '../components/Deadlines'
import RecentMaterials from '../components/RecentMaterials'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { todayStr } = useAppState()

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError, refetch: refetchSubjects } = useSubjects()
  const { data: events, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents()
  const { data: resources, isLoading: resourcesLoading, error: resourcesError, refetch: refetchResources } = useResources()

  const queryClient = useQueryClient()
  const [stagSyncStatus, setStagSyncStatus] = useState(user?.stag_sync_status ?? null)

  // Hned za useState pro stagSyncStatus přidej tento useEffect:
  useEffect(() => {
    if (user?.stag_sync_status) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStagSyncStatus(user.stag_sync_status)
    } else if (user?.stag_username && subjects?.length === 0) {
      // Uživatel má STAG credentials ale žádná data — sync pravděpodobně ještě nezačal
      setStagSyncStatus('pending')
    }
  }, [user?.stag_sync_status, user?.stag_username, subjects?.length])

  // Polluj stag_sync_status dokud je 'pending', pak invaliduj data
  useEffect(() => {
    if (stagSyncStatus !== 'pending') return

    const interval = setInterval(async () => {
      const result = await api.getStagSyncStatus()

      // Zastav polling při odhlášení
      if (result.error === 'unauthorized') {
        clearInterval(interval)
        return
      }

      if (result.status === 'success') {
        const newStatus = result.data?.stag_sync_status
        if (newStatus && newStatus !== 'pending') {
          setStagSyncStatus(newStatus)
          clearInterval(interval)

          // Invaliduj React Query cache — data se načtou automaticky
          queryClient.invalidateQueries({ queryKey: ['subjects'] })
          queryClient.invalidateQueries({ queryKey: ['events'] })
          queryClient.invalidateQueries({ queryKey: ['resources'] })
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [stagSyncStatus, queryClient])

  const isLoading = subjectsLoading || eventsLoading || resourcesLoading
  const error = subjectsError || eventsError || resourcesError

  const reloadData = () => {
    refetchSubjects()
    refetchEvents()
    refetchResources()
  }

  const todayDeadlinesCount = events.filter(
    (e) => e.date === todayStr && e.type !== 'Lecture'
  ).length

  if (isLoading) {
    return <PageState variant="loading" title="Loading..." />
  }

  if (error) {
    return (
      <PageState
        variant="error"
        title={error}
        description="Please try reloading the page."
        actionLabel="Try again"
        onAction={reloadData}
      />
    )
  }

  if (subjects.length === 0 && events.length === 0 && resources.length === 0) {
    // Sync stále probíhá — zobraz loading místo "Žádná data"
    if (stagSyncStatus === 'pending') {
      return (
        <PageState
          variant="loading"
          title="Syncing schedule from IS/STAG..."
          description="This may take a few seconds. The page will automatically refresh."
        />
      )
    }

    // Sync selhal — zobraz chybu s možností přejít do profilu
    if (stagSyncStatus === 'failed') {
      return (
        <PageState
          variant="error"
          title="Sync failed"
          description="Failed to sync your schedule from IS/STAG."
          actionLabel="Go to Profile"
          onAction={() => navigate('/profile')}
        />
      )
    }

    // Žádný sync neprobíhá — skutečně prázdný stav
    return (
      <PageState
        variant="empty"
        title="No data"
        description="No subjects, events, or resources are available yet."
      />
    )
  }

  const handleDeadlineClick = (eventId) => {
    navigate('/calendar', { state: { openEventId: eventId } })
  }

  const handleSubjectSelect = (subject) => {
    navigate(`/subjects/${subject.id}`)
  }

  return (
    <>
      {/* ── Desktop Dashboard ──────────────────────────────── */}
      <div className="hidden lg:contents">

        {/* Greetings */}
        <div className="flex flex-col gap-2">
          <h1 className="text-display text-on-surface">Good morning, {user.name}!</h1>
          <div className="flex items-center gap-2 text-body-md text-on-surface-variant font-medium">
            <div className="w-5 h-5 bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center rounded-sm">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <span>
              You have <strong className="text-on-surface font-semibold">{todayDeadlinesCount} deadlines</strong> today. Time to dive in!
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsRow subjects={subjects} events={events} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* Left Columns (Subjects & Timetable) */}
          <div className="col-span-2 flex flex-col gap-6">

            {/* Timetable Section */}
            <Timetable events={events} subjects={subjects} />

            {/* Subjects Section */}
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-headline-md text-on-surface font-semibold">My Enrolled Subjects</h2>
                <button
                  onClick={() => navigate('/subjects')}
                  className="text-label-md text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {subjects.slice(0, 4).map((sub) => (
                  <SubjectCard
                    key={sub.id}
                    subject={sub}
                    onSelect={handleSubjectSelect}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Deadlines & Recent Materials) */}
          <div className="col-span-1 flex flex-col gap-6">
            <Deadlines events={events} subjects={subjects} onDeadlineClick={handleDeadlineClick} />
            <RecentMaterials resources={resources} subjects={subjects} />
          </div>

        </div>
      </div>

      {/* ── Mobile Dashboard ───────────────────────────────── */}
      <div className="contents lg:hidden">

        {/* Greeting Header */}
        <div className="flex items-center justify-between bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-ambient">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-headline-lg-mobile text-on-surface font-semibold">Good morning, {user.name}!</h2>
            <p className="text-body-md text-on-surface-variant mt-1.5 leading-snug">
              You have {todayDeadlinesCount} deadlines approaching today.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#E2E8F0]"
          />
        </div>

        {/* Stats Cards Swipe Row */}
        <StatsRow subjects={subjects} events={events} />

        {/* Mobile Today's Schedule */}
        <Timetable events={events} subjects={subjects} />

        {/* Mobile Subjects List */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-headline-md text-on-surface font-semibold">My Subjects</h3>
            <button
              onClick={() => navigate('/subjects')}
              className="text-label-md text-primary font-semibold bg-transparent border-0 cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {subjects.slice(0, 2).map((sub) => (
              <div
                key={sub.id}
                onClick={() => handleSubjectSelect(sub)}
                className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-ambient flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#eeefff] text-[#004ac6] flex items-center justify-center rounded-md shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-label-md text-on-surface font-semibold">{sub.name}</h4>
                    <span className="text-label-sm text-[#737686] block mt-0.5">Lecturer: {sub.lecturer}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-[#eeefff] text-[#004ac6] px-2 py-0.5 rounded-sm shrink-0 font-geist">
                  {sub.code}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Urgent Deadlines */}
        <Deadlines events={events} subjects={subjects} onDeadlineClick={handleDeadlineClick} />

        {/* Mobile Recent Materials */}
        <RecentMaterials resources={resources} subjects={subjects} />
      </div>
    </>
  )
}

export default DashboardPage
