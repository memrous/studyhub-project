/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'
import { setAuthToken } from '../services/httpClient'
import queryClient from '../lib/queryClient'

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

  const clearSession = useCallback(() => {
    localStorage.removeItem(LS_AUTH)
    setAuthToken(null)
    setUser(null)
    queryClient.clear()
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getUser()

      if (response.status === 'success') {
        const { user: refreshedUser } = response.data
        setUser(refreshedUser)

        const authDataStr = localStorage.getItem(LS_AUTH)
        if (authDataStr) {
          try {
            const { token } = JSON.parse(authDataStr)
            if (token) {
              localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: refreshedUser }))
            }
          } catch {
            // Ignore storage parse errors and keep the in-memory user fresh.
          }
        }

        return refreshedUser
      }

      if (response.error === 'unauthorized') {
        clearSession()
        navigate('/login', { replace: true })
      }

      return null
    } catch {
      return null
    }
  }, [clearSession, navigate])

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

        if (cachedUser) {
          setUser(cachedUser)
        }

        setAuthToken(token)

        const response = await api.getUser()

        if (response.status === 'success') {
          const { user: refreshedUser } = response.data
          setUser(refreshedUser)
          localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: refreshedUser }))
          return
        }

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
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const login = useCallback(async (email, password) => {
    const response = await api.login(email, password)
    if (response.status === 'error') {
      throw new Error(getAuthErrorMessage(response.error))
    }

    const { user: userData, token } = response.data

    localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: userData }))
    setAuthToken(token)
    setUser(userData)
    navigate('/dashboard', { replace: true })
  }, [navigate])

  const register = useCallback(async (...args) => {
    const payload = typeof args[0] === 'object'
      ? args[0]
      : {
          name: args[0],
          username: args[1],
          email: args[2],
          password: args[3],
          ...(args[4] ? { stag_student_id: args[4] } : {}),
          ...(args[5] ? { stag_username: args[5] } : {}),
          ...(args[6] ? { stag_password: args[6] } : {}),
        }

    const response = await api.register(payload)
    if (response.status === 'error') {
      const err = new Error(getAuthErrorMessage(response.error))
      if (response.errors) {
        err.errors = response.errors
      }
      throw err
    }

    const { user: userData, token } = response.data

    localStorage.setItem(LS_AUTH, JSON.stringify({ token, user: userData }))
    setAuthToken(token)
    setUser(userData)
    navigate('/dashboard', { replace: true })
  }, [navigate])

  useEffect(() => {
    const handleUnauthorized = () => {
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
    refreshUser,
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