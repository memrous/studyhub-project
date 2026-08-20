import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
  Unlink2,
  Link2,
  KeyRound,
  LayoutGrid,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import * as api from '../services/api'

const emptyStagForm = {
  stagStudentId: '',
  stagUsername: '',
  stagPassword: '',
}

const emptyMoodleForm = {
  moodleUsername: '',
  moodlePassword: '',
}

const Profile = ({ user: initialUser }) => {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const toast = useToast()
  const [user, setUser] = useState(initialUser ?? null)
  const [isFetching] = useState(!initialUser)
  const [profileError, setProfileError] = useState('')
  const [showStagForm, setShowStagForm] = useState(false)
  const [stagForm, setStagForm] = useState(emptyStagForm)
  const [stagErrors, setStagErrors] = useState({})
  const [stagSubmitting, setStagSubmitting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [resyncLoading, setResyncLoading] = useState(false)
  const [moodleResyncLoading, setMoodleResyncLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState(initialUser?.stag_sync_status ?? null)
  const [nextAllowedAt, setNextAllowedAt] = useState(null)
  const [cooldownSecs, setCooldownSecs] = useState(0)

  const [showMoodleForm, setShowMoodleForm] = useState(false)
  const [moodleForm, setMoodleForm] = useState(emptyMoodleForm)
  const [moodleErrors, setMoodleErrors] = useState({})
  const [moodleSubmitting, setMoodleSubmitting] = useState(false)
  const [moodleDisconnecting, setMoodleDisconnecting] = useState(false)
  const [moodleSyncStatus, setMoodleSyncStatus] = useState(initialUser?.moodle_sync_status ?? null)
  const [moodleNextAllowedAt, setMoodleNextAllowedAt] = useState(null)
  const [moodleCooldownSecs, setMoodleCooldownSecs] = useState(0)

  // eslint-disable-next-line no-unused-vars
  const [syncPolling, setSyncPolling] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [moodleSyncPolling, setMoodleSyncPolling] = useState(false)

  useEffect(() => {
    let active = true

    const loadUserAndStatus = async () => {
      const refreshed = await refreshUser()
      if (!active) return

      if (refreshed) {
        setUser(refreshed)
        setSyncStatus(refreshed.stag_sync_status ?? null)
        setMoodleSyncStatus(refreshed.moodle_sync_status ?? null)
      }

      // Fetch STAG status on mount to retrieve next_allowed_at
      const statusRes = await api.getStagSyncStatus()
      if (!active) return
      if (statusRes.status === 'success' && statusRes.data?.next_allowed_at) {
        setNextAllowedAt(statusRes.data.next_allowed_at)
      }

      // Fetch Moodle status on mount
      const moodleStatusRes = await api.getMoodleSyncStatus()
      if (!active) return
      if (moodleStatusRes.status === 'success') {
        if (moodleStatusRes.data?.moodle_sync_status) {
          setMoodleSyncStatus(moodleStatusRes.data.moodle_sync_status)
        }
        if (moodleStatusRes.data?.next_allowed_at) {
          setMoodleNextAllowedAt(moodleStatusRes.data.next_allowed_at)
        }
      }
    }

    loadUserAndStatus()

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!initialUser || syncStatus !== 'pending') return

    setTimeout(() => {
      setSyncPolling(true)
    }, 0)
    const interval = setInterval(async () => {
      const result = await api.getStagSyncStatus()

      // Guard: stop polling immediately if the session ended (logout / token expiry)
      if (result.error === 'unauthorized') {
        clearInterval(interval)
        setSyncPolling(false)
        return
      }

      if (result.status === 'success') {
        const newStatus = result.data?.stag_sync_status
        setSyncStatus(newStatus)
        if (result.data?.next_allowed_at) {
          setNextAllowedAt(result.data.next_allowed_at)
        }
        if (newStatus !== 'pending') {
          clearInterval(interval)
          setSyncPolling(false)
          // Refresh user data to update the connected badge
          const refreshed = await refreshUser()
          if (refreshed) setUser(refreshed)
          // Auto-navigate to dashboard after sync completes
          if (newStatus === 'success') {
            setTimeout(() => navigate('/dashboard'), 2000)
          }
        }
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      setSyncPolling(false)
    }
  }, [syncStatus, refreshUser, initialUser, navigate])

  // Polling effect for Moodle sync status
  useEffect(() => {
    if (!initialUser || moodleSyncStatus !== 'pending') return

    setTimeout(() => {
      setMoodleSyncPolling(true)
    }, 0)
    const interval = setInterval(async () => {
      const result = await api.getMoodleSyncStatus()

      if (result.error === 'unauthorized') {
        clearInterval(interval)
        setMoodleSyncPolling(false)
        return
      }

      if (result.status === 'success') {
        const newStatus = result.data?.moodle_sync_status
        setMoodleSyncStatus(newStatus)
        if (result.data?.next_allowed_at) {
          setMoodleNextAllowedAt(result.data.next_allowed_at)
        }
        if (newStatus !== 'pending') {
          clearInterval(interval)
          setMoodleSyncPolling(false)
          const refreshed = await refreshUser()
          if (refreshed) setUser(refreshed)
        }
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      setMoodleSyncPolling(false)
    }
  }, [moodleSyncStatus, refreshUser, initialUser])

  // Handle countdown timer based on nextAllowedAt
  useEffect(() => {
    if (!nextAllowedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCooldownSecs(0)
      return
    }

    const calculateCooldown = () => {
      const diffMs = new Date(nextAllowedAt).getTime() - Date.now()
      const diffSecs = Math.max(0, Math.ceil(diffMs / 1000))
      setCooldownSecs(diffSecs)
      return diffSecs
    }

    const initialDiff = calculateCooldown()
    if (initialDiff <= 0) return

    const interval = setInterval(() => {
      const remaining = calculateCooldown()
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [nextAllowedAt])

  // Handle countdown timer based on moodleNextAllowedAt
  useEffect(() => {
    if (!moodleNextAllowedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMoodleCooldownSecs(0)
      return
    }

    const calculateCooldown = () => {
      const diffMs = new Date(moodleNextAllowedAt).getTime() - Date.now()
      const diffSecs = Math.max(0, Math.ceil(diffMs / 1000))
      setMoodleCooldownSecs(diffSecs)
      return diffSecs
    }

    const initialDiff = calculateCooldown()
    if (initialDiff <= 0) return

    const interval = setInterval(() => {
      const remaining = calculateCooldown()
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [moodleNextAllowedAt])

  const effectiveUser = user ?? initialUser
  const isStagConnected = Boolean(effectiveUser?.stag_student_id)
  const isMoodleConnected = Boolean(effectiveUser?.moodle_username)

  const handleStagInput = (field) => (event) => {
    const { value } = event.target
    setStagForm((prev) => ({ ...prev, [field]: value }))
    setStagErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateStagForm = () => {
    const errors = {}

    if (!stagForm.stagStudentId.trim()) {
      errors.stagStudentId = t('validation.studentIdRequired')
    }

    if (!stagForm.stagUsername.trim()) {
      errors.stagUsername = t('validation.usernameRequired')
    }

    if (!stagForm.stagPassword.trim()) {
      errors.stagPassword = t('validation.passwordRequired')
    }

    return errors
  }

  const handleMoodleInput = (field) => (event) => {
    const { value } = event.target
    setMoodleForm((prev) => ({ ...prev, [field]: value }))
    setMoodleErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateMoodleForm = () => {
    const errors = {}

    if (!moodleForm.moodleUsername.trim()) {
      errors.moodleUsername = t('validation.usernameRequired')
    }

    if (!moodleForm.moodlePassword.trim()) {
      errors.moodlePassword = t('validation.passwordRequired')
    }

    return errors
  }

  const syncUser = async () => {
    const refreshedUser = await refreshUser()
    if (refreshedUser) {
      setUser(refreshedUser)
      setSyncStatus(refreshedUser.stag_sync_status ?? null)
      setMoodleSyncStatus(refreshedUser.moodle_sync_status ?? null)
    }
    return refreshedUser
  }

  const handleStagSubmit = async (event) => {
    event.preventDefault()
    setProfileError('')

    const errors = validateStagForm()
    if (Object.keys(errors).length) {
      setStagErrors(errors)
      return
    }

    setStagSubmitting(true)
    try {
      const response = await api.connectStag({
        stag_student_id: stagForm.stagStudentId.trim(),
        stag_username: stagForm.stagUsername.trim(),
        stag_password: stagForm.stagPassword,
      })

      if (response.status === 'error') {
        toast.error(t('toast.connectFailed'))
        return
      }

      const updatedUser = response.data?.user || (await syncUser())
      if (updatedUser) {
        setUser(updatedUser)
      }
      setShowStagForm(false)
      setStagForm(emptyStagForm)
      setStagErrors({})
      setSyncStatus('pending')
      toast.success(t('stag.syncing.background'))
    } catch {
      toast.error(t('toast.connectFailed'))
    } finally {
      setStagSubmitting(false)
    }
  }

  const handleMoodleSubmit = async (event) => {
    event.preventDefault()
    setProfileError('')

    const errors = validateMoodleForm()
    if (Object.keys(errors).length) {
      setMoodleErrors(errors)
      return
    }

    setMoodleSubmitting(true)
    try {
      const response = await api.connectMoodle({
        moodle_username: moodleForm.moodleUsername.trim(),
        moodle_password: moodleForm.moodlePassword,
      })

      if (response.status === 'error') {
        toast.error(t('toast.moodleConnectFailed'))
        return
      }

      const updatedUser = response.data?.user || (await syncUser())
      if (updatedUser) {
        setUser(updatedUser)
      }
      setShowMoodleForm(false)
      setMoodleForm(emptyMoodleForm)
      setMoodleErrors({})
      setMoodleSyncStatus('pending')
      toast.success(t('moodle.syncing.background'))
    } catch {
      toast.error(t('toast.moodleConnectFailed'))
    } finally {
      setMoodleSubmitting(false)
    }
  }

  const handleDisconnectStag = async () => {
    setProfileError('')
    setDisconnecting(true)

    try {
      const response = await api.disconnectStag()
      if (response.status === 'error') {
        toast.error(t('toast.disconnectFailed'))
        return
      }

      const updatedUser = response.data?.user || (await syncUser())
      if (updatedUser) {
        setUser(updatedUser)
      }
      setShowStagForm(false)
      setStagForm(emptyStagForm)
      setStagErrors({})
      setSyncStatus(null)
      setNextAllowedAt(null)
      toast.success(t('toast.disconnectSuccess'))
    } catch {
      toast.error(t('toast.disconnectFailed'))
    } finally {
      setDisconnecting(false)
    }
  }

  const handleDisconnectMoodle = async () => {
    setProfileError('')
    setMoodleDisconnecting(true)

    try {
      const response = await api.disconnectMoodle()
      if (response.status === 'error') {
        toast.error(t('toast.moodleDisconnectFailed'))
        return
      }

      const updatedUser = response.data?.user || (await syncUser())
      if (updatedUser) {
        setUser(updatedUser)
      }
      setShowMoodleForm(false)
      setMoodleForm(emptyMoodleForm)
      setMoodleErrors({})
      setMoodleSyncStatus(null)
      setMoodleNextAllowedAt(null)
      toast.success(t('toast.moodleDisconnectSuccess'))
    } catch {
      toast.error(t('toast.moodleDisconnectFailed'))
    } finally {
      setMoodleDisconnecting(false)
    }
  }

  const handleResync = async () => {
    setProfileError('')
    setResyncLoading(true)

    try {
      const response = await api.resyncStag()

      if (response.status === 'error') {
        if (response.error === 'rate_limited') {
          const nextAllowed = response.data?.next_allowed_at
          const retryAfter = response.data?.retry_after_seconds
          const retryMin = retryAfter ? Math.ceil(retryAfter / 60) : 30
          if (nextAllowed) {
            setNextAllowedAt(nextAllowed)
          }
          toast.error(t('stag.syncing.recentlyTriggered', { minutes: retryMin }))
        } else {
          toast.error(response.error || t('stag.syncing.failed'))
        }
        return
      }

      if (response.data?.next_allowed_at) {
        setNextAllowedAt(response.data.next_allowed_at)
      }
      toast.success(t('stag.syncing.started'))
      setSyncStatus('pending')
    } catch {
      toast.error(t('stag.syncing.failed'))
    } finally {
      setResyncLoading(false)
    }
  }

  const handleResyncMoodle = async () => {
    setProfileError('')
    setMoodleResyncLoading(true)

    try {
      const response = await api.resyncMoodle()

      if (response.status === 'error') {
        if (response.error === 'rate_limited') {
          const nextAllowed = response.data?.next_allowed_at
          const retryAfter = response.data?.retry_after_seconds
          const retryMin = retryAfter ? Math.ceil(retryAfter / 60) : 30
          if (nextAllowed) {
            setMoodleNextAllowedAt(nextAllowed)
          }
          toast.error(t('moodle.syncing.recentlyTriggered', { minutes: retryMin }))
        } else {
          toast.error(response.error || t('moodle.syncing.failed'))
        }
        return
      }

      if (response.data?.next_allowed_at) {
        setMoodleNextAllowedAt(response.data.next_allowed_at)
      }
      toast.success(t('moodle.syncing.started'))
      setMoodleSyncStatus('pending')
    } catch {
      toast.error(t('moodle.syncing.failed'))
    } finally {
      setMoodleResyncLoading(false)
    }
  }

  if (isFetching && !effectiveUser) {
    return <div className="p-8 text-center text-body-lg text-outline font-semibold">{t('loading')}</div>
  }

  if (!effectiveUser) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-outline-variant bg-surface-container-low p-6 text-on-surface">
        <p className="font-semibold text-on-surface">{t('unavailable.title')}</p>
        <p className="mt-1 text-sm text-on-surface-variant">{t('unavailable.hint')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-inter text-on-surface">
      <section className="bg-surface border border-outline-variant shadow-ambient rounded-xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={effectiveUser.avatarUrl || 'src/assets/icons/user.png'}
            alt={t('header.avatarAlt')}
            className="w-24 h-24 rounded-full object-cover border border-outline-variant shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 bg-primary text-white w-8 h-8 rounded-full grid place-items-center border-2 border-white shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
            {t('header.badge')}
          </p>
          <h1 className="text-display text-on-surface mt-1 leading-tight">
            {effectiveUser.username || effectiveUser.name}
          </h1>
          {effectiveUser.username && (
            <p className="text-sm text-on-surface-variant mt-1 font-normal">
              {effectiveUser.name}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-body-md text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-on-surface-variant" /> {effectiveUser.email}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-surface border border-outline-variant shadow-ambient rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">{t('sections.academicDetails.title')}</h2>
          <p className="text-body-md text-on-surface-variant mt-0.5">{t('sections.academicDetails.subtitle')}</p>
        </div>

        <div className="border-t border-outline-variant pt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-container-low border border-outline-variant/40 p-4">
            <p className="text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('academic.university')}</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{effectiveUser.university || t('academic.defaults.university')}</p>
          </div>

          <div className="rounded-lg bg-surface-container-low border border-outline-variant/40 p-4">
            <p className="text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('academic.faculty')}</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{effectiveUser.faculty || t('academic.defaults.faculty')}</p>
          </div>

          <div className="rounded-lg bg-surface-container-low border border-outline-variant/40 p-4">
            <p className="text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('academic.studyProgram')}</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{effectiveUser.program || t('academic.defaults.studyProgram')}</p>
          </div>

          <div className="rounded-lg bg-surface-container-low border border-outline-variant/40 p-4">
            <p className="text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('academic.academicYear')}</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{effectiveUser.year || t('academic.defaults.academicYear')}</p>
          </div>
        </div>
      </section>

      <section className="bg-surface border border-outline-variant shadow-ambient rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">{t('sections.universityIntegration.title')}</h2>
          <p className="text-body-md text-on-surface-variant mt-0.5">{t('sections.universityIntegration.subtitle')}</p>
        </div>

        {profileError && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-error-container border border-error/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <p className="text-label-sm text-error">{profileError}</p>
          </div>
        )}

        {isStagConnected && syncStatus === 'pending' && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-primary-container border border-primary/30 rounded-lg">
            <Loader2 className="w-4 h-4 text-on-primary shrink-0 mt-0.5 animate-spin" />
            <p className="text-label-sm text-on-primary">{t('stag.status.syncing')}</p>
          </div>
        )}

        {isStagConnected && syncStatus === 'success' && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-success-container border border-success/30 rounded-lg">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="text-label-sm text-success">{t('stag.status.success')}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-on-success transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              {t('profile:stag.actions.goToDashboard')}
            </button>
          </div>
        )}

        {isStagConnected && syncStatus === 'failed' && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-error-container border border-error/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <p className="text-label-sm text-error">{t('stag.status.failed')}</p>
          </div>
        )}

        {isMoodleConnected && moodleSyncStatus === 'pending' && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-primary-container border border-primary/30 rounded-lg">
            <Loader2 className="w-4 h-4 text-on-primary shrink-0 mt-0.5 animate-spin" />
            <p className="text-label-sm text-on-primary">{t('moodle.status.syncing')}</p>
          </div>
        )}

        {isMoodleConnected && moodleSyncStatus === 'success' && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-success-container border border-success/30 rounded-lg">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="text-label-sm text-success">{t('moodle.status.success')}</p>
            </div>
          </div>
        )}

        {isMoodleConnected && moodleSyncStatus === 'failed' && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-error-container border border-error/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <p className="text-label-sm text-error">{t('moodle.status.failed')}</p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low/80 p-5 space-y-4">
            <div className="flex md:items-center md:flex-row justify-between gap-3 flex-col items-start">
              <div>
                <h3 className="text-lg font-bold text-on-surface">{t('stag.card.title')}</h3>
                <p className="text-sm text-on-surface-variant">{t('stag.card.subtitle')}</p>
              </div>
              {isStagConnected ? (
                <span className="inline-flex items-center rounded-full bg-success-container text-success px-3 py-1 text-xs font-bold tracking-wide border border-success/30">
                  {t('stag.connected.connected')}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-error-container text-error px-3 py-1 text-xs font-bold tracking-wide border border-error/30">
                  {t('stag.connected.notConnected')}
                </span>
              )}
            </div>

            {!isStagConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant">
                  {t('stag.card.helper')}
                </p>

                {!showStagForm ? (
                  <button
                    type="button"
                    onClick={() => setShowStagForm(true)}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-primary-container"
                  >
                    <Link2 className="h-4 w-4" />
                    {t('stag.actions.connect')}
                  </button>
                ) : (
                  <form onSubmit={handleStagSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-surface p-4 shadow-sm">
                    <div className="grid gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-on-surface" htmlFor="profile-stag-student-id">
                          {t('stag.labels.studentId')}
                        </label>
                        <input
                          id="profile-stag-student-id"
                          type="text"
                          value={stagForm.stagStudentId}
                          onChange={handleStagInput('stagStudentId')}
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${stagErrors.stagStudentId ? 'border-error bg-error-container' : 'border-outline-variant bg-surface'}`}
                        />
                        {stagErrors.stagStudentId && (
                          <p className="text-xs text-error">{stagErrors.stagStudentId}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-on-surface" htmlFor="profile-stag-username">
                          {t('stag.labels.username')}
                        </label>
                        <input
                          id="profile-stag-username"
                          type="text"
                          value={stagForm.stagUsername}
                          onChange={handleStagInput('stagUsername')}
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${stagErrors.stagUsername ? 'border-error bg-error-container' : 'border-outline-variant bg-surface'}`}
                        />
                        {stagErrors.stagUsername && (
                          <p className="text-xs text-error">{stagErrors.stagUsername}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-on-surface" htmlFor="profile-stag-password">
                          {t('stag.labels.password')}
                        </label>
                        <div className="relative">
                          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                          <input
                            id="profile-stag-password"
                            type="password"
                            value={stagForm.stagPassword}
                            onChange={handleStagInput('stagPassword')}
                            className={`w-full rounded-lg border px-4 py-2.5 pl-10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${stagErrors.stagPassword ? 'border-error bg-error-container' : 'border-outline-variant bg-surface'}`}
                          />
                        </div>
                        {stagErrors.stagPassword && (
                          <p className="text-xs text-error">{stagErrors.stagPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={stagSubmitting}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {stagSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                        {t('stag.actions.connect')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowStagForm(false)
                          setStagForm(emptyStagForm)
                          setStagErrors({})
                        }}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
                      >
                        {t('profile:stag.actions.cancel')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-xl border border-success/30 bg-success-container/10 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-success">{t('stag.labels.studentId')}</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">{effectiveUser.stag_student_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-success">{t('stag.labels.username')}</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">{effectiveUser.stag_username || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-success">{t('stag.labels.password')}</p>
                    <p className="mt-1 text-sm font-semibold tracking-[0.25em] text-on-surface">••••••••</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleResync}
                    disabled={resyncLoading || syncStatus === 'pending' || cooldownSecs > 0}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resyncLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {cooldownSecs > 0
                      ? t('stag.actions.syncNowCountdown', { time: `${Math.floor(cooldownSecs / 60)}:${(cooldownSecs % 60).toString().padStart(2, '0')}` })
                      : t('stag.actions.syncNow')}
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnectStag}
                    disabled={disconnecting}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-error-container bg-surface px-4 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error-container/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink2 className="h-4 w-4" />}
                    {t('stag.actions.disconnect')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-low/80 p-5 space-y-4">
            <div className="flex md:items-center md:flex-row justify-between gap-3 flex-col items-start">
              <div>
                <h3 className="text-lg font-bold text-on-surface">{t('moodle.card.title')}</h3>
                <p className="text-sm text-on-surface-variant">{t('moodle.card.subtitle')}</p>
              </div>
              {isMoodleConnected ? (
                <span className="inline-flex items-center rounded-full bg-success-container text-success px-3 py-1 text-xs font-bold tracking-wide border border-success/30">
                  {t('moodle.connected.connected')}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-error-container text-error px-3 py-1 text-xs font-bold tracking-wide border border-error/30">
                  {t('moodle.connected.notConnected')}
                </span>
              )}
            </div>

            {!isMoodleConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant">
                  {t('moodle.card.helper')}
                </p>

                {!showMoodleForm ? (
                  <button
                    type="button"
                    onClick={() => setShowMoodleForm(true)}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-primary-container"
                  >
                    <Link2 className="h-4 w-4" />
                    {t('moodle.actions.connect')}
                  </button>
                ) : (
                  <form onSubmit={handleMoodleSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-surface p-4 shadow-sm">
                    <div className="grid gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-on-surface" htmlFor="profile-moodle-username">
                          {t('moodle.labels.username')}
                        </label>
                        <input
                          id="profile-moodle-username"
                          type="text"
                          value={moodleForm.moodleUsername}
                          onChange={handleMoodleInput('moodleUsername')}
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${moodleErrors.moodleUsername ? 'border-error bg-error-container' : 'border-outline-variant bg-surface'}`}
                        />
                        {moodleErrors.moodleUsername && (
                          <p className="text-xs text-error">{moodleErrors.moodleUsername}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-on-surface" htmlFor="profile-moodle-password">
                          {t('moodle.labels.password')}
                        </label>
                        <div className="relative">
                          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                          <input
                            id="profile-moodle-password"
                            type="password"
                            value={moodleForm.moodlePassword}
                            onChange={handleMoodleInput('moodlePassword')}
                            className={`w-full rounded-lg border px-4 py-2.5 pl-10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${moodleErrors.moodlePassword ? 'border-error bg-error-container' : 'border-outline-variant bg-surface'}`}
                          />
                        </div>
                        {moodleErrors.moodlePassword && (
                          <p className="text-xs text-error">{moodleErrors.moodlePassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={moodleSubmitting}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {moodleSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                        {t('moodle.actions.connect')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoodleForm(false)
                          setMoodleForm(emptyMoodleForm)
                          setMoodleErrors({})
                        }}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
                      >
                        {t('moodle.actions.cancel')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-xl border border-success/30 bg-success-container/10 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-success">{t('moodle.labels.username')}</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">{effectiveUser.moodle_username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-success">{t('moodle.labels.password')}</p>
                    <p className="mt-1 text-sm font-semibold tracking-[0.25em] text-on-surface">••••••••</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleResyncMoodle}
                    disabled={moodleResyncLoading || moodleSyncStatus === 'pending' || moodleCooldownSecs > 0}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {moodleResyncLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {moodleCooldownSecs > 0
                      ? t('moodle.actions.syncNowCountdown', { time: `${Math.floor(moodleCooldownSecs / 60)}:${(moodleCooldownSecs % 60).toString().padStart(2, '0')}` })
                      : t('moodle.actions.syncNow')}
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnectMoodle}
                    disabled={moodleDisconnecting}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-error-container bg-surface px-4 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error-container/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {moodleDisconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink2 className="h-4 w-4" />}
                    {t('moodle.actions.disconnect')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Profile
