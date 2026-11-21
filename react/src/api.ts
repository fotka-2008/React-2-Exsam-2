const BASE_URL = '/api'

export type User = {
  id: string
  name: string   
  email: string
  created_at: string
}

type AuthResponse = {
  user: User
  accessToken: string
  refreshToken: string
}

export type Folder = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export type Contact = {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  phone: string | null
  email: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export type DebtDirection = 'they_owe_me' | 'i_owe_them'

export type DebtStatus = 'pending' | 'partial' | 'paid'

export type Debt = {
  id: string
  user_id: string
  contact_id: string
  direction: DebtDirection
  amount: number
  currency: string
  description: string | null
  due_date: string | null
  status: DebtStatus
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  debt_id: string
  user_id: string
  amount: number
  note: string | null
  paid_at: string
  created_at: string
}

export type DashboardSummary = {
  totals: {
    they_owe_me: number
    i_owe_them: number
  }
  outstanding: {
    they_owe_me: number
    i_owe_them: number
    net_balance: number
  }
  counts: {
    pending: number
    partial: number
    paid: number
    total: number
  }
  contacts_count: number
  upcoming_due: {
    id: string
    amount: number
    currency: string
    direction: DebtDirection
    due_date: string
    status: DebtStatus
    contact_name: string
  }[]
}

export type Health = {
  status: string
  time: string
}

export function getAccessToken() {
  return localStorage.getItem('accessToken')
}

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return false

  try {
    const res = await fetch(BASE_URL + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false

    const data = await res.json()
    saveTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

let refreshing: Promise<boolean> | null = null

async function refreshTokens() {
  if (!refreshing) {
    refreshing = doRefresh()
  }
  const ok = await refreshing
  refreshing = null
  return ok
}

export async function request<T>(path: string, method = 'GET', body?: object): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  const token = getAccessToken()
  if (token) headers.Authorization = 'Bearer ' + token

  const options: RequestInit = { method, headers }
  if (body) options.body = JSON.stringify(body)

  let res = await fetch(BASE_URL + path, options)

  if (res.status === 401 && !path.startsWith('/auth')) {
    const ok = await refreshTokens()
    if (!ok) {
      clearTokens()
      window.location.href = '/login'
      throw new Error('Сессия тамом шуд')
    }
    headers.Authorization = 'Bearer ' + getAccessToken()
    res = await fetch(BASE_URL + path, options)
  }

  if (res.status === 204) return null as T

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Хатогӣ рух дод')
  return data
}

export async function register(name: string, email: string, password: string) {
  const data = await request<AuthResponse>('/auth/register', 'POST', { name, email, password })
  saveTokens(data.accessToken, data.refreshToken)
  return data.user
}

export async function login(email: string, password: string) {
  const data = await request<AuthResponse>('/auth/login', 'POST', { email, password })
  saveTokens(data.accessToken, data.refreshToken)
  return data.user
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken')
  try {
    await request('/auth/logout', 'POST', { refreshToken })
  } catch {
  }
  clearTokens()
}

export async function checkHealth() {
  const res = await fetch('/health')
  if (!res.ok) throw new Error('Сервер ҷавоб намедиҳад')
  const data: Health = await res.json()
  return data
}