import axios from 'axios'
import { jwtDecode } from 'jwt-decode'  // 👈 poprawione

const baseURL = import.meta.env.VITE_API_BASE;

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
let accessExp = null // czas wygaśnięcia access tokena

// 📌 helper do pobrania exp z ciasteczka access_token
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

// 📌 Request interceptor
api.interceptors.request.use(async (config) => {
  if (!accessExp) {
    accessExp = getAccessExp()
  }

  const now = Date.now()

  // jeśli access wygasł lub nie istnieje → odśwież
  if (!accessExp || accessExp < now) {
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
    await new Promise(r => setTimeout(r, 50)) // ⏳ czekamy aż cookie się zapisze
  }

  return config
})

// 📌 Response interceptor (fallback, np. access unieważniony na backendzie)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (!error.response || error.response.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshApi.post('/auth/refresh')
        .then(() => {
          accessExp = getAccessExp()
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    try {
      await refreshPromise
      await new Promise(r => setTimeout(r, 50))
      return api(original)
    } catch (e) {
      return Promise.reject(e)
    }
  }
)

export default api
