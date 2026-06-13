/* eslint-disable no-unused-vars */
import httpClient from './httpClient'

const success = (data) => ({ data, error: null, status: 'success' })
const failure = (error) => ({ data: null, error, status: 'error' })

const dispatchUnauthorized = () => {
  window.dispatchEvent(new Event('studyhub:unauthorized'))
}

const isNetworkError = (error) => !error.response

const normalizeHttpError = (error) => {
  if (error?.response?.status === 401) {
    dispatchUnauthorized()
    return failure('unauthorized')
  }

  if (isNetworkError(error)) {
    return failure('network_error')
  }

  if (error?.response?.status === 500) {
    return failure('server_error')
  }

  return failure(error?.response?.data?.message || error?.message || 'unknown_error')
}

const request = async (handler) => {
  try {
    const data = await handler()
    return success(data)
  } catch (error) {
    return normalizeHttpError(error)
  }
}

// ── Auth API Functions ───────────────────────────────────────────

export const login = async (email, password) => {
  return request(() => httpClient.post('/login', { email, password }).then((res) => res.data))
}

export const register = async (name, email, password) => {
  return request(() => httpClient.post('/register', { name, email, password }).then((res) => res.data))
}

export const logout = async (userId) => {
  return request(() => httpClient.post('/logout').then((res) => res.data))
}

export const getUser = async (token) => {
  return request(() => httpClient.get('/user').then((res) => res.data))
}

// ── Application State API Functions ──────────────────────────────

export const getSubjects = async (userId) => {
  return request(() => httpClient.get('/subjects').then((res) => res.data))
}

export const createSubject = async (userId, newSubject) => {
  return request(() => httpClient.post('/subjects', newSubject).then((res) => res.data))
}

export const getEvents = async (userId) => {
  return request(() => httpClient.get('/events').then((res) => res.data))
}

export const createEvent = async (userId, newEvent) => {
  return request(() => httpClient.post('/events', newEvent).then((res) => res.data))
}

export const editEvent = async (userId, eventId, updatedEvent) => {
  return request(() => httpClient.put(`/events/${eventId}`, updatedEvent).then((res) => res.data))
}

export const deleteEvent = async (userId, eventId) => {
  return request(() => httpClient.delete(`/events/${eventId}`).then((res) => res.data))
}

export const updateEventStatus = async (userId, eventId, status) => {
  return request(() => httpClient.patch(`/events/${eventId}/status`, { status }).then((res) => res.data))
}

export const getResources = async (userId) => {
  return request(() => httpClient.get('/materials').then((res) => res.data))
}

export const createResource = async (userId, newResource) => {
  return request(() => httpClient.post('/materials', newResource).then((res) => res.data))
}
