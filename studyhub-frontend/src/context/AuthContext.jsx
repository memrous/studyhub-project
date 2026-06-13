/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'

/**
 * AuthContext
 *
 * Central authentication state for the entire application.
 * Exposes useAuth() user state as the single source of truth.
 */

const AuthContext = createContext(null)
const LS_AUTH = 'studyhub:auth'

const getAuthErrorMessage = (error) => {
  switch (error) {
    case 'invalid_credentials':
      return 'Invalid email or password. Please try again.'
    case 'email_exists':
      return 'An account with this email already exists.'
    case 'network_error':
      return 'Network error. Please try again.'
    case 'server_error':
      return 'Server error. Please try again.'
    case 'unauthorized':
      return 'Session expired. Please log in again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Session helper functions ──────────────────────────────────
  const clearSession = useCallback(() => {
    localStorage.removeItem(LS_AUTH)
    setUser(null)
  }, [])

  const getStoredUserId = useCallback(() => {
    const authDataStr = localStorage.getItem(LS_AUTH)
    if (!authDataStr) {
      return user?.id
    }

    try {
      const parsed = JSON.parse(authDataStr)
      return parsed.user?.id || user?.id
    } catch {
      return user?.id
    }
  }, [user])

  const logout = useCallback(async () => {
    try {
      await api.logout(getStoredUserId())
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }, [navigate, clearSession, getStoredUserId])

  // ── Session restore on mount ──────────────────────────────────
  // NOTE: intentionally omits `logout` from deps — including it would create
  // an infinite loop: logout → getStoredUserId → [user] → setUser in effect
  // → user changes → logout re-created → effect re-runs → getUser() called again.
  // `navigate` is a stable reference from React Router and is safe as a dep.
  useEffect(() => {
    const restoreSession = async () => {
      const authDataStr = localStorage.getItem(LS_AUTH)

      if (!authDataStr) {
        setIsLoading(false)
        return
      }

      try {
        const { token, user: cachedUser } = JSON.parse(authDataStr)
        if (!token) {
          setIsLoading(false)
          return
        }

        // Use cached user for instant UI, then validate token in background
        if (cachedUser) {
          setUser(cachedUser)
        }

        const response = await api.getUser(token)

        if (response.status === 'success') {
          const { user: refreshedUser } = response.data
          setUser(refreshedUser)
          localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: refreshedUser }))
          return
        }

        // Token rejected by server — clear session and redirect without
        // calling logout() (which would re-introduce the unstable dep chain)
        if (response.error === 'unauthorized') {
          localStorage.removeItem(LS_AUTH)
          setUser(null)
          navigate('/login', { replace: true })
          return
        }

        if (cachedUser) {
          localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: cachedUser }))
          setUser(cachedUser)
          return
        }

        localStorage.removeItem(LS_AUTH)
        setUser(null)
      } catch {
        // Token invalid or expired — clear session silently
        localStorage.removeItem(LS_AUTH)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  // ── Persist helpers ───────────────────────────────────────────
  const persistSession = useCallback((userData, token) => {
    localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: userData }))
    setUser(userData)
  }, [])

  // ── Auth actions ──────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const response = await api.login(email, password)
    if (response.status === 'error') {
      throw new Error(getAuthErrorMessage(response.error))
    }

    const { user: userData, token } = response.data
    persistSession(userData, token)
    navigate('/dashboard', { replace: true })
  }, [navigate, persistSession])

  const register = useCallback(async (name, email, password) => {
    const response = await api.register(name, email, password)
    if (response.status === 'error') {
      throw new Error(getAuthErrorMessage(response.error))
    }

    const { user: userData, token } = response.data
    persistSession(userData, token)
    navigate('/dashboard', { replace: true })
  }, [navigate, persistSession])

  // ── Listen for 401 Unauthorized events from httpClient ───────
  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }
    window.addEventListener('studyhub:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('studyhub:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
