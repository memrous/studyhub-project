import { useState } from 'react'
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
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── Left brand panel feature list ────────────────────────────────
const FEATURES = [
  { icon: BookOpen,     text: 'Manage all your enrolled subjects and materials in one place.' },
  { icon: CalendarDays, text: 'Visual calendar with deadlines, lectures, and exams.' },
  { icon: BarChart3,    text: 'Track your academic progress and upcoming credits.' },
]

// ── Validation ────────────────────────────────────────────────────
const validate = ({ name, email, password, confirmPassword }) => {
  const errors = {}

  if (!name.trim())
    errors.name = 'Full name is required.'

  if (!email.trim())
    errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Enter a valid email address.'

  if (!password)
    errors.password = 'Password is required.'
  else if (password.length < 8)
    errors.password = 'Password must be at least 8 characters.'

  if (!confirmPassword)
    errors.confirmPassword = 'Please confirm your password.'
  else if (password !== confirmPassword)
    errors.confirmPassword = 'Passwords do not match.'

  return errors
}

// ── Password strength indicator ───────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)              score++
  if (/[A-Z]/.test(pw))           score++
  if (/[0-9]/.test(pw))           score++
  if (/[^A-Za-z0-9]/.test(pw))   score++
  const map = [
    { level: 0, label: '',         color: '' },
    { level: 1, label: 'Weak',     color: 'bg-red-400' },
    { level: 2, label: 'Fair',     color: 'bg-amber-400' },
    { level: 3, label: 'Good',     color: 'bg-emerald-400' },
    { level: 4, label: 'Strong',   color: 'bg-emerald-500' },
  ]
  return map[score] ?? map[0]
}

const RegisterPage = () => {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass,       setShowPass]       = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [errors,         setErrors]         = useState({})
  const [serverError,    setServerError]    = useState('')
  const [submitting,     setSubmitting]     = useState(false)

  // Already logged in — bounce to dashboard
  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />
  }

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const fieldErrors = validate(form)
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    setSubmitting(true)
    try {
      await register(form.name, form.email, form.password)
      // AuthContext navigates to /dashboard on success
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const strength = getStrength(form.password)

  const inputBase =
    'w-full pl-10 pr-4 py-2.5 bg-[#F8F9FB] rounded-lg border text-body-md text-on-surface focus:outline-none focus:bg-white transition-colors'
  const inputOk  = `${inputBase} border-[#E2E8F0] focus:border-[#004ac6]`
  const inputErr = `${inputBase} border-red-400 focus:border-red-500 bg-red-50`

  return (
    <div className="min-h-screen flex font-inter">

      {/* ── Left brand panel (desktop only) ───────────────────── */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #001a5e 0%, #003ab0 55%, #0057e8 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7eb8ff, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-geist font-bold text-xl text-white tracking-tight">StudyHub</span>
        </div>

        {/* Headline */}
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
          © 2026 Palacký University Olomouc Academic Systems
        </p>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[400px] flex flex-col gap-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 bg-[#004ac6] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-geist font-bold text-xl text-on-surface tracking-tight">StudyHub</span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Create your account</h2>
            <p className="text-body-md text-on-surface-variant">Free for all university students.</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-label-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

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
                  placeholder="Anna Nováková"
                  className={errors.name ? inputErr : inputOk}
                />
              </div>
              {errors.name && (
                <p className="text-label-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
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
                <p className="text-label-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
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

              {/* Strength bar */}
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

                {/* Match tick */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-label-md transition-all shadow-sm mt-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Login link */}
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
