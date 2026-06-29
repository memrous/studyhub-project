import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  BookOpen,
  CalendarDays,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  IdCard,
  KeyRound,
  ChevronDown,
  Building2,
  Check,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import httpClient from '../services/httpClient'
import { checkAvailability } from '../services/api'


const FEATURES = [
  { icon: BookOpen, text: 'Manage all your enrolled subjects and materials in one place.' },
  { icon: CalendarDays, text: 'Visual calendar with deadlines, lectures, and exams.' },
  { icon: BarChart3, text: 'Track your academic progress and upcoming credits.' },
]

const ACADEMIC_YEARS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
  { value: '5', label: '5th Year' },
  { value: '6', label: '6th Year' },
  { value: 'other', label: 'Other' },
]

const STEP_META = [
  { title: 'Create your account', subtitle: 'Free for all university students.' },
  { title: 'Tell us about your studies', subtitle: 'Select your university details.' },
  { title: 'Connect your IS/STAG', subtitle: 'Securely sync your university schedule.' },
]

const getStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { level: 0, label: '', color: '' },
    { level: 1, label: 'Weak', color: 'bg-red-400' },
    { level: 2, label: 'Fair', color: 'bg-amber-400' },
    { level: 3, label: 'Good', color: 'bg-emerald-400' },
    { level: 4, label: 'Strong', color: 'bg-emerald-500' },
  ]
  return map[score] ?? map[0]
}

const validateStep1 = (form) => {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Full name is required.'
  if (!form.username || !form.username.trim()) {
    errors.username = 'Username is required.'
  } else if (!/^[A-Za-z0-9-_]+$/.test(form.username)) {
    errors.username = 'Username can only contain letters, numbers, dashes, and underscores.'
  }
  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!form.password) {
    errors.password = 'Password is required.'
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

const validateStep2 = (form) => {
  const errors = {}
  if (!form.university_id) errors.university_id = 'Please select your university.'
  if (!form.faculty_id) errors.faculty_id = 'Please select your faculty.'
  if (!form.study_program_id) errors.study_program_id = 'Please select your study program.'
  if (!form.academic_year) errors.academic_year = 'Please select your academic year.'
  return errors
}

const validateStep3 = (form, connectStagLater) => {
  if (connectStagLater) return {}
  const errors = {}
  if (!form.stag_student_id.trim()) errors.stag_student_id = 'STAG Student ID is required.'
  if (!form.stag_username.trim()) errors.stag_username = 'STAG username is required.'
  if (!form.stag_password) errors.stag_password = 'STAG password is required.'
  return errors
}

const RegisterPage = () => {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    university_id: '',
    faculty_id: '',
    study_program_id: '',
    academic_year: '',
    stag_student_id: '',
    stag_username: '',
    stag_password: '',
  })
  const [connectStagLater, setConnectStagLater] = useState(true)

  const [universities, setUniversities] = useState([])
  const [faculties, setFaculties] = useState([])
  const [programs, setPrograms] = useState([])

  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showStagPass, setShowStagPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── Fetch universities on mount ──────────────────────────────────
  useEffect(() => {
    httpClient
      .get('/academic/universities')
      .then((res) => {
        const list = res.data?.data || res.data || []
        setUniversities(list)
        const upol = list.find((u) => u.code === 'UPOL')
        if (upol) setForm((prev) => ({ ...prev, university_id: String(upol.id) }))
      })
      .catch(() => {})
  }, [])

  // ── Fetch faculties when university changes ──────────────────────
  useEffect(() => {
    if (!form.university_id) {
      setFaculties([])
      setPrograms([])
      return
    }
    setFaculties([])
    setPrograms([])
    setForm((prev) => ({ ...prev, faculty_id: '', study_program_id: '' }))
    httpClient
      .get(`/academic/universities/${form.university_id}/faculties`)
      .then((res) => setFaculties(res.data?.data || res.data || []))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.university_id])

  // ── Fetch programs when faculty changes ──────────────────────────
  useEffect(() => {
    if (!form.faculty_id) {
      setPrograms([])
      return
    }
    setPrograms([])
    setForm((prev) => ({ ...prev, study_program_id: '' }))
    httpClient
      .get(`/academic/faculties/${form.faculty_id}/programs`)
      .then((res) => setPrograms(res.data?.data || res.data || []))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.faculty_id])

  // ── Auth redirect ────────────────────────────────────────────────
  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />
  }

  // ── Handlers ─────────────────────────────────────────────────────
  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleConnectStagLater = (e) => {
    const checked = e.target.checked
    setConnectStagLater(checked)
    if (checked) {
      setForm((prev) => ({
        ...prev,
        stag_student_id: '',
        stag_username: '',
        stag_password: '',
      }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next.stag_student_id
        delete next.stag_username
        delete next.stag_password
        return next
      })
    }
  }

  const [checking, setChecking] = useState(false)

  const handleNext = async () => {
    setServerError('')
    let fieldErrors = {}
    if (currentStep === 1) fieldErrors = validateStep1(form)
    if (currentStep === 2) fieldErrors = validateStep2(form)

    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }

    // On Step 1, verify email + username are not already taken before advancing
    if (currentStep === 1) {
      setChecking(true)
      const result = await checkAvailability({ email: form.email, username: form.username })
      setChecking(false)
      if (result.status === 'error' && result.errors) {
        setErrors(result.errors)
        return
      }
    }

    setErrors({})
    setCurrentStep((s) => s + 1)
  }

  const handleBack = () => {
    setErrors({})
    setServerError('')
    setCurrentStep((s) => s - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    // Run validation for the current step
    let fieldErrors = {}
    if (currentStep === 1) fieldErrors = validateStep1(form)
    else if (currentStep === 2) fieldErrors = validateStep2(form)
    else if (currentStep === 3) fieldErrors = validateStep3(form, connectStagLater)

    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    // If not on last step, advance
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1)
      return
    }

    // Build final payload
    const payload = {
      name: form.name,
      username: form.username,
      email: form.email,
      password: form.password,
      password_confirmation: form.confirmPassword,
      university_id: Number(form.university_id),
      faculty_id: Number(form.faculty_id),
      study_program_id: Number(form.study_program_id),
      academic_year: form.academic_year,
      ...(!connectStagLater
        ? {
            stag_student_id: form.stag_student_id,
            stag_username: form.stag_username,
            stag_password: form.stag_password,
          }
        : {}),
    }

    setSubmitting(true)
    try {
      await register(payload)
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)
        if (err.errors.username || err.errors.email || err.errors.name || err.errors.password) {
          setCurrentStep(1)
        }
      } else {
        setServerError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const strength = getStrength(form.password)

  // ── Style tokens ─────────────────────────────────────────────────
  const inputBase =
    'w-full pl-10 pr-4 py-2.5 bg-[#F8F9FB] rounded-lg border text-body-md text-on-surface focus:outline-none focus:bg-white transition-colors'
  const inputOk = `${inputBase} border-[#E2E8F0] focus:border-[#004ac6]`
  const inputErr = `${inputBase} border-red-400 focus:border-red-500 bg-red-50`

  const selectBase =
    'w-full pl-10 pr-10 py-2.5 bg-[#F8F9FB] rounded-lg border text-body-md text-on-surface focus:outline-none focus:bg-white transition-colors appearance-none cursor-pointer'
  const selectOk = `${selectBase} border-[#E2E8F0] focus:border-[#004ac6]`
  const selectErr = `${selectBase} border-red-400 focus:border-red-500 bg-red-50`

  const stagInputBase =
    'w-full px-4 py-2.5 bg-[#F8F9FB] rounded-lg border text-body-md text-on-surface focus:outline-none focus:bg-white transition-colors'
  const stagInputOk = `${stagInputBase} border-[#E2E8F0] focus:border-[#004ac6]`
  const stagInputErr = `${stagInputBase} border-red-400 focus:border-red-500 bg-red-50`

  const meta = STEP_META[currentStep - 1]
  const progressPercent = Math.round((currentStep / 3) * 100)

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex font-inter">
      {/* ─── Left branding panel (UNTOUCHED) ─────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #001a5e 0%, #003ab0 55%, #0057e8 100%)' }}
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7eb8ff, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-geist font-bold text-xl text-white tracking-tight">StudyHub</span>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Start your academic<br />journey today.
            </h1>
            <p className="text-blue-200 text-base leading-relaxed">
              Create your free account and connect your STAG profile in minutes.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-blue-200" />
                </div>
                <p className="text-sm text-blue-100 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300/60 text-xs relative z-10">
          &copy; 2026 Palacký University Olomouc Academic Systems
        </p>
      </div>

      {/* ─── Right form panel ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[400px] flex flex-col gap-7">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 bg-[#004ac6] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-geist font-bold text-xl text-on-surface tracking-tight">StudyHub</span>
          </div>

          {/* ── Progress indicator ─────────────────────────────── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                Step {currentStep} of 3
              </span>
              <span className="text-[11px] font-bold text-[#004ac6]">{progressPercent}%</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    n <= currentStep ? 'bg-[#004ac6]' : 'bg-[#E2E8F0]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── Step title ─────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">{meta.title}</h2>
            <p className="text-body-md text-on-surface-variant">{meta.subtitle}</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-label-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* ── Form ───────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* ═══════════════ STEP 1 — Account Creation ═══════════════ */}
            {currentStep === 1 && (
              <>
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-name">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Anna Novakova"
                      className={errors.name ? inputErr : inputOk}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-label-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-username">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-username"
                      type="text"
                      autoComplete="username"
                      value={form.username}
                      onChange={set('username')}
                      placeholder="annap123"
                      className={errors.username ? inputErr : inputOk}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {Array.isArray(errors.username) ? errors.username[0] : errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-email">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@university.cz"
                      className={errors.email ? inputErr : inputOk}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={set('password')}
                      placeholder="At least 8 characters"
                      className={`${errors.password ? inputErr : inputOk} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {form.password && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              n <= strength.level ? strength.color : 'bg-[#E2E8F0]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-on-surface-variant shrink-0">
                        {strength.label}
                      </span>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-label-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-confirm">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                      placeholder="Repeat your password"
                      className={`${errors.confirmPassword ? inputErr : inputOk} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-9 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-label-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ═══════════════ STEP 2 — Academic Profile ═══════════════ */}
            {currentStep === 2 && (
              <>
                {/* University */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-university">
                    University
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="reg-university"
                      value={form.university_id}
                      onChange={set('university_id')}
                      className={errors.university_id ? selectErr : selectOk}
                    >
                      <option value="">Select university…</option>
                      {universities.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.university_id && (
                    <p className="text-label-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.university_id}
                    </p>
                  )}
                </div>

                {/* Faculty */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-faculty">
                    Faculty
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="reg-faculty"
                      value={form.faculty_id}
                      onChange={set('faculty_id')}
                      disabled={!form.university_id}
                      className={`${errors.faculty_id ? selectErr : selectOk} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="">
                        {form.university_id ? 'Select faculty…' : 'Select a university first'}
                      </option>
                      {faculties.map((f) => (
                        <option key={f.id} value={String(f.id)}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.faculty_id && (
                    <p className="text-label-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.faculty_id}
                    </p>
                  )}
                </div>

                {/* Study Program */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-program">
                    Study Program
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="reg-program"
                      value={form.study_program_id}
                      onChange={set('study_program_id')}
                      disabled={!form.faculty_id}
                      className={`${errors.study_program_id ? selectErr : selectOk} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="">
                        {form.faculty_id ? 'Select study program…' : 'Select a faculty first'}
                      </option>
                      {programs.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.study_program_id && (
                    <p className="text-label-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.study_program_id}
                    </p>
                  )}
                </div>

                {/* Academic Year */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface" htmlFor="reg-year">
                    Academic Year
                  </label>
                  <div className="relative">
                    <CalendarDays className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="reg-year"
                      value={form.academic_year}
                      onChange={set('academic_year')}
                      className={errors.academic_year ? selectErr : selectOk}
                    >
                      <option value="">Select year…</option>
                      {ACADEMIC_YEARS.map((y) => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.academic_year && (
                    <p className="text-label-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.academic_year}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ═══════════════ STEP 3 — University Sync ═══════════════ */}
            {currentStep === 3 && (
              <>
                {/* Connect STAG later checkbox */}
                <label className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-3 text-sm text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={connectStagLater}
                    onChange={handleConnectStagLater}
                    className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#004ac6] focus:ring-[#004ac6]"
                  />
                  <span className="leading-relaxed">
                    <span className="font-semibold">Connect IS/STAG later</span>
                    <span className="block text-on-surface-variant">
                      You can skip STAG credentials for now and connect them from your profile later.
                    </span>
                  </span>
                </label>

                {/* STAG fields (shown when connectStagLater is false) */}
                {!connectStagLater && (
                  <div className="rounded-2xl border border-[#E2E8F0] bg-slate-50/70 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-[#004ac6]" />
                      <h3 className="text-label-md font-semibold text-on-surface">STAG connection</h3>
                    </div>

                    <div className="grid gap-4">
                      {/* STAG Student ID */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-label-md font-semibold text-on-surface" htmlFor="stag-student-id">
                          STAG Student ID
                        </label>
                        <input
                          id="stag-student-id"
                          type="text"
                          value={form.stag_student_id}
                          onChange={set('stag_student_id')}
                          placeholder="123456"
                          className={errors.stag_student_id ? stagInputErr : stagInputOk}
                        />
                        {errors.stag_student_id && (
                          <p className="text-label-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.stag_student_id}
                          </p>
                        )}
                      </div>

                      {/* STAG Username */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-label-md font-semibold text-on-surface" htmlFor="stag-username">
                          STAG Username
                        </label>
                        <input
                          id="stag-username"
                          type="text"
                          value={form.stag_username}
                          onChange={set('stag_username')}
                          placeholder="jnovak"
                          className={errors.stag_username ? stagInputErr : stagInputOk}
                        />
                        {errors.stag_username && (
                          <p className="text-label-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.stag_username}
                          </p>
                        )}
                      </div>

                      {/* STAG Password */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-label-md font-semibold text-on-surface" htmlFor="stag-password">
                          STAG Password
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="stag-password"
                            type={showStagPass ? 'text' : 'password'}
                            value={form.stag_password}
                            onChange={set('stag_password')}
                            placeholder="••••••••"
                            className={`${errors.stag_password ? stagInputErr : stagInputOk} pl-10 pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowStagPass((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                            aria-label={showStagPass ? 'Hide STAG password' : 'Show STAG password'}
                          >
                            {showStagPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.stag_password && (
                          <p className="text-label-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.stag_password}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-400 leading-relaxed">
                  🔒 Your university credentials are encrypted and stored securely.
                </p>
              </>
            )}

            {/* ═══════════════ Navigation buttons ═══════════════ */}
            <div className={`flex gap-3 mt-2 ${currentStep === 1 ? '' : 'justify-between'}`}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 py-2.5 px-5 bg-[#F8F9FB] hover:bg-[#EEF1F5] border border-[#E2E8F0] text-on-surface font-semibold rounded-lg text-label-md transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}

              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={checking}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-label-md transition-all shadow-sm"
                >
                  {checking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
                  ) : (
                    <>Continue <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-label-md transition-all shadow-sm"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating account</>
                  ) : (
                    <>Complete Registration <Check className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Sign in link */}
          <p className="text-body-md text-on-surface-variant text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-[#004ac6] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage