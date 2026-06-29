import {
  INITIAL_SUBJECTS,
  INITIAL_EVENTS,
  INITIAL_RESOURCES,
} from '../data/mockData'

const MOCK_DELAY = 600 // ms
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const success = (data) => ({ data, error: null, status: 'success' })
const failure = (error) => ({ data: null, error, status: 'error' })

const MOCK_USER_DB = [
  {
    id: 1,
    name: 'Bořek Šarman',
    username: 'boreksarman',
    email: 'borek.sarman@upol.cz',
    password: 'password',
    university: 'Palacký University Olomouc',
    faculty: 'Faculty of Science',
    program: 'Applied Informatics',
    year: '1st Year',
    stag_student_id: null,
    stag_username: null,
    stag_password: null,
    role: 'student',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
]
const mockRegisteredUsers = [...MOCK_USER_DB]

const sanitizeUser = (user) => {
  const copy = { ...user }
  delete copy.password
  return copy
}

const getNamespacedKey = (userId, key) => {
  const scope = userId || 'fallback'
  return `studyhub:${scope}:${key}`
}

const getAuthTokenFromStorage = () => {
  const authDataStr = localStorage.getItem('studyhub:auth')
  if (!authDataStr) return null

  try {
    const { token } = JSON.parse(authDataStr)
    return token || null
  } catch {
    return null
  }
}

const getCurrentMockUser = () => {
  const token = getAuthTokenFromStorage()
  if (!token) return null

  const parts = token.split('-')
  const userId = Number(parts[2])
  if (!Number.isFinite(userId)) return null

  return mockRegisteredUsers.find((user) => user.id === userId) ?? null
}

const normalizeRegisterPayload = (args) => {
  if (args.length === 1 && typeof args[0] === 'object') {
    return args[0]
  }

  const [name, username, email, password, stagStudentId, stagUsername, stagPassword] = args

  return {
    name,
    username,
    email,
    password,
    stag_student_id: stagStudentId || null,
    stag_username: stagUsername || null,
    stag_password: stagPassword || null,
  }
}

// ── Auth API Functions ───────────────────────────────────────────

export const login = async (email, password) => {
  await delay(MOCK_DELAY)

  const found = mockRegisteredUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )

  if (!found) {
    return failure('invalid_credentials')
  }

  const token = `mock-token-${found.id}-${Date.now()}`
  return success({ user: sanitizeUser(found), token })
}

export const register = async (...args) => {
  await delay(MOCK_DELAY)

  const payload = normalizeRegisterPayload(args)
  const errors = {}

  if (mockRegisteredUsers.find((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
    errors.email = ['The email has already been taken.']
  }
  if (payload.username && mockRegisteredUsers.find((u) => u.username && u.username.toLowerCase() === payload.username.toLowerCase())) {
    errors.username = ['The username has already been taken.']
  }

  if (Object.keys(errors).length > 0) {
    return {
      data: null,
      error: 'validation_error',
      errors: errors,
      status: 'error'
    }
  }

  const newUser = {
    id: Date.now(),
    name: payload.name,
    username: payload.username,
    email: payload.email,
    password: payload.password,
    university: 'Palacký University Olomouc',
    faculty: 'Faculty of Science',
    program: 'Student',
    year: '1st Year',
    stag_student_id: payload.stag_student_id ?? null,
    stag_username: payload.stag_username ?? null,
    stag_password: payload.stag_password ?? null,
    role: 'student',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  }

  mockRegisteredUsers.push(newUser)
  const token = `mock-token-${newUser.id}-${Date.now()}`
  return success({ user: sanitizeUser(newUser), token })
}

export const checkAvailability = async ({ email, username }) => {
  await delay(MOCK_DELAY)

  const errors = {}

  if (mockRegisteredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    errors.email = ['The email has already been taken.']
  }
  if (username && mockRegisteredUsers.find((u) => u.username && u.username.toLowerCase() === username.toLowerCase())) {
    errors.username = ['The username has already been taken.']
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, error: 'validation_error', errors, status: 'error' }
  }

  return success({ available: true })
}

export const logout = async (userId) => {
  await delay(200)

  if (userId) {
    localStorage.removeItem(getNamespacedKey(userId, 'subjects'))
    localStorage.removeItem(getNamespacedKey(userId, 'events'))
    localStorage.removeItem(getNamespacedKey(userId, 'materials'))
  }

  return success(null)
}

export const getUser = async (token) => {
  await delay(300)

  const authToken = token || getAuthTokenFromStorage()
  if (!authToken) {
    return failure('unauthorized')
  }

  const parts = authToken.split('-')
  const userId = Number(parts[2])

  const found = mockRegisteredUsers.find((u) => u.id === userId)
  if (!found) {
    return failure('unauthorized')
  }

  return success({ user: sanitizeUser(found) })
}

export const connectStag = async (payload) => {
  await delay(400)

  const currentUser = getCurrentMockUser()
  if (!currentUser) {
    return failure('unauthorized')
  }

  currentUser.stag_student_id = payload.stag_student_id ?? payload.stagStudentId ?? null
  currentUser.stag_username = payload.stag_username ?? payload.stagUsername ?? null
  currentUser.stag_password = payload.stag_password ?? payload.stagPassword ?? null

  return success({ user: sanitizeUser(currentUser) })
}

export const disconnectStag = async () => {
  await delay(300)

  const currentUser = getCurrentMockUser()
  if (!currentUser) {
    return failure('unauthorized')
  }

  currentUser.stag_student_id = null
  currentUser.stag_username = null
  currentUser.stag_password = null

  return success({ user: sanitizeUser(currentUser) })
}

// ── Application State API Functions ──────────────────────────────

export const getSubjects = async (userId) => {
  await delay(MOCK_DELAY)
  const key = getNamespacedKey(userId, 'subjects')
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      return success(JSON.parse(saved))
    } catch {
      return success(INITIAL_SUBJECTS)
    }
  }
  localStorage.setItem(key, JSON.stringify(INITIAL_SUBJECTS))
  return success(INITIAL_SUBJECTS)
}

export const createSubject = async (userId, newSubject) => {
  await delay(100)
  const key = getNamespacedKey(userId, 'subjects')
  const saved = localStorage.getItem(key)
  const list = saved ? JSON.parse(saved) : INITIAL_SUBJECTS
  const updatedList = [...list, newSubject]
  localStorage.setItem(key, JSON.stringify(updatedList))
  return success(newSubject)
}

export const deleteSubject = async (userId, subjectId) => {
  await delay(100)
  const key = getNamespacedKey(userId, 'subjects')
  const saved = localStorage.getItem(key)
  const list = saved ? JSON.parse(saved) : INITIAL_SUBJECTS
  const updatedList = list.filter((s) => s.id !== Number(subjectId) && s.id !== subjectId)
  localStorage.setItem(key, JSON.stringify(updatedList))
  return success(subjectId)
}


export const getEvents = async (userId) => {
  await delay(MOCK_DELAY)
  const key = getNamespacedKey(userId, 'events')
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      return success(JSON.parse(saved))
    } catch {
      return success(INITIAL_EVENTS)
    }
  }
  localStorage.setItem(key, JSON.stringify(INITIAL_EVENTS))
  return success(INITIAL_EVENTS)
}

export const createEvent = async (userId, newEvent) => {
  await delay(100)
  const key = getNamespacedKey(userId, 'events')
  const saved = localStorage.getItem(key)
  const list = saved ? JSON.parse(saved) : INITIAL_EVENTS
  const updatedList = [...list, newEvent]
  localStorage.setItem(key, JSON.stringify(updatedList))
  return success(newEvent)
}

export const editEvent = async (userId, eventId, updatedEvent) => {
  await delay(100)
  const key = getNamespacedKey(userId, 'events')
  const saved = localStorage.getItem(key)
  const list = saved ? JSON.parse(saved) : INITIAL_EVENTS
  const updatedList = list.map((e) => (e.id === Number(eventId) ? updatedEvent : e))
  localStorage.setItem(key, JSON.stringify(updatedList))
  return success(updatedEvent)
}

export const deleteEvent = async (userId, eventId) => {
  await delay(100)
  const key = getNamespacedKey(userId, 'events')
  const saved = localStorage.getItem(key)
  const list = saved ? JSON.parse(saved) : INITIAL_EVENTS
  const updatedList = list.filter((e) => e.id !== Number(eventId))
  localStorage.setItem(key, JSON.stringify(updatedList))
  return success(eventId)
}

export const updateEventStatus = async (userId, eventId, status) => {
  await delay(100)
  const key = getNamespacedKey(userId, 'events')
  const saved = localStorage.getItem(key)
  const list = saved ? JSON.parse(saved) : INITIAL_EVENTS
  const updatedList = list.map((e) => (e.id === Number(eventId) ? { ...e, status } : e))
  localStorage.setItem(key, JSON.stringify(updatedList))
  const updatedEvent = updatedList.find((e) => e.id === Number(eventId))
  return success(updatedEvent)
}

export const getResources = async (userId) => {
  await delay(MOCK_DELAY)
  const key = getNamespacedKey(userId, 'materials')
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      return success(JSON.parse(saved))
    } catch {
      return success(INITIAL_RESOURCES)
    }
  }
  localStorage.setItem(key, JSON.stringify(INITIAL_RESOURCES))
  return success(INITIAL_RESOURCES)
}

export const createResource = async (userId, newResource) => {
  await delay(100)
  const key = getNamespacedKey(userId, 'materials')
  const saved = localStorage.getItem(key)
  const list = saved ? JSON.parse(saved) : INITIAL_RESOURCES
  const updatedList = [...list, newResource]
  localStorage.setItem(key, JSON.stringify(updatedList))
  return success(newResource)
}
