import { create } from 'zustand'
import { api } from '../api/apiClient'

interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<string>
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  init: () => {
    const token = localStorage.getItem('accessToken')
    const raw = localStorage.getItem('user')
    if (token && raw) {
      set({ isAuthenticated: true, user: JSON.parse(raw) })
    }
  },

  login: async (email, password) => {
    const data = await api.post<{ accessToken: string; user: User }>('/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ isAuthenticated: true, user: data.user })
  },

  register: async (name, email, password) => {
    const data = await api.post<{ message: string }>('/auth/register', { name, email, password })
    return data.message
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    set({ isAuthenticated: false, user: null })
  },
}))
