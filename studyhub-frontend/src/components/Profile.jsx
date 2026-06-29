import { useEffect, useState } from 'react'
import {
  AlertCircle,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
  Unlink2,
  Link2,
  KeyRound,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/api'

const emptyStagForm = {
  stagStudentId: '',
  stagUsername: '',
  stagPassword: '',
}

const Profile = ({ user: initialUser }) => {
  const { refreshUser } = useAuth()
  const [user, setUser] = useState(initialUser ?? null)
  const [isFetching, setIsFetching] = useState(!initialUser)
  const [profileError, setProfileError] = useState('')
  const [showStagForm, setShowStagForm] = useState(false)
  const [stagForm, setStagForm] = useState(emptyStagForm)
  const [stagErrors, setStagErrors] = useState({})
  const [stagSubmitting, setStagSubmitting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [connectionMessage, setConnectionMessage] = useState('')


  useEffect(() => {
    let active = true

    const loadUser = async () => {
      if (!initialUser) {
        setIsFetching(true)
      }

      const refreshed = await refreshUser()
      if (!active) return

      if (refreshed) {
        setUser(refreshed)
      }

      if (!initialUser) {
        setIsFetching(false)
      }
    }

    loadUser()

    return () => {
      active = false
    }
  }, [initialUser, refreshUser])

  const effectiveUser = user ?? initialUser
  const isStagConnected = Boolean(effectiveUser?.stag_student_id)

  const handleStagInput = (field) => (event) => {
    const { value } = event.target
    setStagForm((prev) => ({ ...prev, [field]: value }))
    setStagErrors((prev) => ({ ...prev, [field]: '' }))
    setConnectionMessage('')
  }

  const validateStagForm = () => {
    const errors = {}

    if (!stagForm.stagStudentId.trim()) {
      errors.stagStudentId = 'Student ID is required.'
    }

    if (!stagForm.stagUsername.trim()) {
      errors.stagUsername = 'Username is required.'
    }

    if (!stagForm.stagPassword.trim()) {
      errors.stagPassword = 'Password is required.'
    }

    return errors
  }

  const syncUser = async () => {
    const refreshedUser = await refreshUser()
    if (refreshedUser) {
      setUser(refreshedUser)
    }
    return refreshedUser
  }

  const handleStagSubmit = async (event) => {
    event.preventDefault()
    setProfileError('')
    setConnectionMessage('')

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
        setConnectionMessage('We could not connect IS/STAG. Please check the values and try again.')
        return
      }

      const updatedUser = response.data?.user || (await syncUser())
      if (updatedUser) {
        setUser(updatedUser)
      }
      setShowStagForm(false)
      setStagForm(emptyStagForm)
      setStagErrors({})
      setConnectionMessage('IS/STAG has been connected successfully.')
    } catch {
      setConnectionMessage('We could not connect IS/STAG. Please check the values and try again.')
    } finally {
      setStagSubmitting(false)
    }
  }

  const handleDisconnectStag = async () => {
    setProfileError('')
    setConnectionMessage('')
    setDisconnecting(true)

    try {
      const response = await api.disconnectStag()
      if (response.status === 'error') {
        setConnectionMessage('We could not disconnect IS/STAG right now. Please try again.')
        return
      }

      const updatedUser = response.data?.user || (await syncUser())
      if (updatedUser) {
        setUser(updatedUser)
      }
      setShowStagForm(false)
      setStagForm(emptyStagForm)
      setStagErrors({})
      setConnectionMessage('IS/STAG has been disconnected.')
    } catch {
      setConnectionMessage('We could not disconnect IS/STAG right now. Please try again.')
    } finally {
      setDisconnecting(false)
    }
  }

  if (isFetching && !effectiveUser) {
    return <div className="p-8 text-center text-body-lg text-outline font-semibold">Loading...</div>
  }

  if (!effectiveUser) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-semibold">Profile data is not available right now.</p>
        <p className="mt-1 text-sm text-amber-800">Please refresh the page or sign in again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-inter text-on-surface">
      <section className="bg-white border border-[#E2E8F0] shadow-ambient rounded-xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={effectiveUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Student Avatar"
            className="w-24 h-24 rounded-lg object-cover border border-[#E2E8F0] shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 bg-primary text-white w-8 h-8 rounded-full grid place-items-center border-2 border-white shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <p className="text-label-sm uppercase tracking-widest text-[#737686] font-semibold">
            Institutional Student Account
          </p>
          <h1 className="text-display text-on-surface mt-1 leading-tight">
            {effectiveUser.username || effectiveUser.name}
          </h1>
          {effectiveUser.username && (
            <p className="text-sm text-[#737686] mt-1 font-normal">
              {effectiveUser.name}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-body-md text-[#737686]">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" /> {effectiveUser.email}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E2E8F0] shadow-ambient rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">Academic Details</h2>
          <p className="text-body-md text-[#737686] mt-0.5">Official curriculum details synced from Palacky University STAG system.</p>
        </div>

        <div className="border-t border-[#E2E8F0] pt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0]/40 p-4">
            <p className="text-label-sm text-[#737686] uppercase font-bold tracking-wider">University</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{effectiveUser.university || 'Palacky University Olomouc'}</p>
          </div>

          <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0]/40 p-4">
            <p className="text-label-sm text-[#737686] uppercase font-bold tracking-wider">Faculty</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{effectiveUser.faculty || 'Faculty of Science'}</p>
          </div>

          <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0]/40 p-4">
            <p className="text-label-sm text-[#737686] uppercase font-bold tracking-wider">Study Program</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{effectiveUser.program || 'Applied Informatics'}</p>
          </div>

          <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0]/40 p-4">
            <p className="text-label-sm text-[#737686] uppercase font-bold tracking-wider">Academic Year</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{effectiveUser.year || '1st Year'}</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E2E8F0] shadow-ambient rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">University integration</h2>
          <p className="text-body-md text-[#737686] mt-0.5">We separate STAG and Moodle integration in one place.</p>
        </div>

        {profileError && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-label-sm text-red-700">{profileError}</p>
          </div>
        )}

        {connectionMessage && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <p className="text-label-sm text-slate-700">{connectionMessage}</p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E2E8F0] bg-slate-50/80 p-5 space-y-4">
            <div className="flex md:items-center md:flex-row justify-between gap-3 flex-col items-start">
              <div>
                <h3 className="text-lg font-bold text-on-surface">IS/STAG</h3>
                <p className="text-sm text-[#737686]">University system connection status</p>
              </div>
              {isStagConnected ? (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold tracking-wide text-emerald-800 border border-emerald-200">
                   CONNECTED
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold tracking-wide text-red-800 border border-red-200">
                   NOT CONNECTED
                </span>
              )}
            </div>

            {!isStagConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  To connect to IS/STAG, enter your university login credentials. If you want, you can do this later.
                </p>

                {!showStagForm ? (
                  <button
                    type="button"
                    onClick={() => setShowStagForm(true)}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#003ea8]"
                  >
                    <Link2 className="h-4 w-4" />
                    Connect IS/STAG
                  </button>
                ) : (
                  <form onSubmit={handleStagSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-on-surface" htmlFor="profile-stag-student-id">
                          Student ID
                        </label>
                        <input
                          id="profile-stag-student-id"
                          type="text"
                          value={stagForm.stagStudentId}
                          onChange={handleStagInput('stagStudentId')}
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 ${stagErrors.stagStudentId ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0] bg-white'}`}
                        />
                        {stagErrors.stagStudentId && (
                          <p className="text-xs text-red-600">{stagErrors.stagStudentId}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-on-surface" htmlFor="profile-stag-username">
                          Username
                        </label>
                        <input
                          id="profile-stag-username"
                          type="text"
                          value={stagForm.stagUsername}
                          onChange={handleStagInput('stagUsername')}
                          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 ${stagErrors.stagUsername ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0] bg-white'}`}
                        />
                        {stagErrors.stagUsername && (
                          <p className="text-xs text-red-600">{stagErrors.stagUsername}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-on-surface" htmlFor="profile-stag-password">
                          Password
                        </label>
                        <div className="relative">
                          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="profile-stag-password"
                            type="password"
                            value={stagForm.stagPassword}
                            onChange={handleStagInput('stagPassword')}
                            className={`w-full rounded-lg border px-4 py-2.5 pl-10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 ${stagErrors.stagPassword ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0] bg-white'}`}
                          />
                        </div>
                        {stagErrors.stagPassword && (
                          <p className="text-xs text-red-600">{stagErrors.stagPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={stagSubmitting}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#003ea8] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {stagSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                        Connect
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowStagForm(false)
                          setStagForm(emptyStagForm)
                          setStagErrors({})
                        }}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Student ID</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-950">{effectiveUser.stag_student_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Username</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-950">{effectiveUser.stag_username || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Password</p>
                    <p className="mt-1 text-sm font-semibold tracking-[0.25em] text-emerald-950">••••••••</p>
                    <p className="mt-1 text-xs text-emerald-700">Heslo je uložené na backendu a v UI je skryté.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnectStag}
                  disabled={disconnecting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink2 className="h-4 w-4" />}
                  Disconnect IS/STAG
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-amber-50 to-orange-50 p-5 space-y-4">
            <div className="flex md:items-center md:flex-row justify-between gap-3 flex-col items-start">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Moodle</h3>
                <p className="text-sm text-[#737686]">Placeholder for future integration</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wide text-slate-700 border border-slate-200">
                 NOT CONNECTED
              </span>
            </div>

            <div className="rounded-xl border border-dashed border-amber-300/70 bg-white/70 p-4 space-y-3">
              <p className="text-sm text-slate-600">
                Moodle integration is still in preparation. This is a visual placeholder for the future state.
              </p>
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500"
              >
                <XCircle className="h-4 w-4" />
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Profile