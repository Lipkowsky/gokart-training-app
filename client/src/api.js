import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const baseURL = import.meta.env.VITE_API_BASE

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 8000,
})

const refreshApi = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 8000,
})

let refreshPromise = null
let accessExp = null

// 📌 helper do pobrania exp z access_token w cookie
function getAccessExp() {
  try {
    const match = document.cookie.match(/access_token=([^;]+)/)
    if (!match) return null
    const decoded = jwtDecode(match[1])
    return decoded.exp * 1000 // ms
  } catch {
    return null
  }
}

// 📌 helper: czy trzeba odświeżyć token?
function needRefresh() {
  if (!accessExp) return true
  const now = Date.now()
  const buffer = 5000 // 5s zapasu
  return accessExp - buffer < now
}

// 📌 odświeżanie z singletonem
async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = refreshApi.post('/auth/refresh')
      .then(() => {
        accessExp = getAccessExp()
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  await refreshPromise
  await new Promise(r => setTimeout(r, 150)) // ⏳ dajemy czas cookie
}

// 📌 Request interceptor
api.interceptors.request.use(async (config) => {
  if (needRefresh()) {
    await refreshToken()
  }
  return config
})

// 📌 Response interceptor (fallback na 401)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (!error.response || error.response.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    try {
      await refreshToken()
      return api(original) // retry
    } catch (e) {
      return Promise.reject(e)
    }
  }
)

export default api
