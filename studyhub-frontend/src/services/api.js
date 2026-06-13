import * as mockApi from './api.mock'
import * as realApi from './api.real'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'
const activeApi = isMock ? mockApi : realApi

export const login = activeApi.login
export const register = activeApi.register
export const logout = activeApi.logout
export const getUser = activeApi.getUser
export const getSubjects = activeApi.getSubjects
export const createSubject = activeApi.createSubject
export const getEvents = activeApi.getEvents
export const createEvent = activeApi.createEvent
export const editEvent = activeApi.editEvent
export const deleteEvent = activeApi.deleteEvent
export const updateEventStatus = activeApi.updateEventStatus
export const getResources = activeApi.getResources
export const createResource = activeApi.createResource
