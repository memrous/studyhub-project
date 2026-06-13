import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
  CalendarDays,
  BarChart3,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── Left brand panel feature list ────────────────────────────────
const FEATURES = [
  { icon: BookOpen,     text: 'Manage all your enrolled subjects and materials in one place.' },
  { icon: CalendarDays, text: 'Visual calendar with deadlines, lectures, and exams.' },
  { icon: BarChart3,    text: 'Track your academic progress and upcoming credits.' },
]

// ── Form field validation ─────────────────────────────────────────
const validate = (email, password) => {
  const errors = {}
  if (!email.trim())                          errors.email    = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!password)                              errors.password = 'Password is required.'
  return errors
}

const LoginPage = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [errors,      setErrors]      = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  // Already logged in — bounce to dashboard
  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const fieldErrors = validate(email, password)
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    setSubmitting(true)
    try {
      await login(email, password)
      // AuthContext navigates to /dashboard on success
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase =
    'w-full pl-10 pr-4 py-2.5 bg-[#F8F9FB] rounded-lg border text-body-md text-on-surface focus:outline-none focus:bg-white transition-colors'
  const inputOk  = `${inputBase} border-[#E2E8F0] focus:border-[#004ac6]`
  const inputErr = `${inputBase} border-red-400 focus:border-red-500 bg-red-50`

  return (
    <div className="min-h-screen flex font-inter">

      {/* ── Left brand panel (desktop only) ───────────────────── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #001a5e 0%, #003ab0 55%, #0057e8 100%)' }}>

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
              Your academic life,<br />organized.
            </h1>
            <p className="text-blue-200 text-base leading-relaxed">
              Connect your STAG account and take full control of your university journey.
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

        {/* Footer credit */}
        <p className="text-blue-300/60 text-xs relative z-10">
          © 2026 Palacký University Olomouc Academic Systems
        </p>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[400px] flex flex-col gap-8">

          {/* Mobile logo (hidden on desktop) */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 bg-[#004ac6] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-geist font-bold text-xl text-on-surface tracking-tight">StudyHub</span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Welcome back</h2>
            <p className="text-body-md text-on-surface-variant">Sign in to your student account.</p>
          </div>

          {/* Mock credentials hint */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-[#eeefff] border border-[#c5caff] rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
            <p className="text-label-sm text-[#004ac6] leading-snug">
              <span className="font-bold">Demo credentials: </span>
              student@studyhub.cz · password
            </p>
          </div>

          {/* Server error banner */}
          {serverError && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-label-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface" htmlFor="login-email">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
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
              <div className="flex items-center justify-between">
                <label className="text-label-md font-semibold text-on-surface" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                  placeholder="••••••••"
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
              {errors.password && (
                <p className="text-label-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-label-md transition-all shadow-sm mt-1"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-body-md text-on-surface-variant text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#004ac6] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
