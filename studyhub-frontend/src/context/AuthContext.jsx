/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'
import { setAuthToken } from '../services/httpClient'

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
    setAuthToken(null)
    setUser(null)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch (err) {
      console.warn('Backend logout failed:', err)
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }, [navigate, clearSession])

  // ── Session restore on mount ──────────────────────────────────
  // NOTE: intentionally omits `logout` from deps — including it would create
  // an infinite loop: logout triggers state changes, then the effect re-runs
  // and calls getUser() again.
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

        setAuthToken(token)

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
          clearSession()
          navigate('/login', { replace: true })
          return
        }

        if (cachedUser) {
          localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: cachedUser }))
          setUser(cachedUser)
          return
        }

        clearSession()
      } catch {
        // Token invalid or expired — clear session silently
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  // ── Auth actions ──────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    // A. Await the API response from api.real.js.
    const response = await api.login(email, password)
    if (response.status === 'error') {
      throw new Error(getAuthErrorMessage(response.error))
    }

    const { user: userData, token } = response.data

    // B. Save to localStorage under key 'studyhub:auth' matching {"token": "...", "user": {...}}
    localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: userData }))

    // C. Set active Axios common header
    setAuthToken(token)

    // D. Update global Auth State/Context
    setUser(userData)

    // E. Redirect to '/dashboard'
    navigate('/dashboard', { replace: true })
  }, [navigate])

  const register = useCallback(async (name, email, password) => {
    // A. Await the API response from api.real.js.
    const response = await api.register(name, email, password)
    if (response.status === 'error') {
      throw new Error(getAuthErrorMessage(response.error))
    }

    const { user: userData, token } = response.data

    // B. Save to localStorage under key 'studyhub:auth' matching {"token": "...", "user": {...}}
    localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: userData }))

    // C. Set active Axios common header
    setAuthToken(token)

    // D. Update global Auth State/Context
    setUser(userData)

    // E. Redirect to '/dashboard'
    navigate('/dashboard', { replace: true })
  }, [navigate])

  // ── Listen for 401 Unauthorized events from httpClient ───────
  useEffect(() => {
    const handleUnauthorized = () => {
      // Cleanly clear session and redirect without calling API logout
      clearSession()
      navigate('/login', { replace: true })
    }
    window.addEventListener('studyhub:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('studyhub:unauthorized', handleUnauthorized)
    }
  }, [clearSession, navigate])

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
