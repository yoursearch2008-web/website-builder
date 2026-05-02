import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    // Mock API call - replace with real backend later
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = { id: '1', email, name: email.split('@')[0] }
        const mockToken = 'mock-jwt-token-' + Date.now()
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('auth_user', JSON.stringify(mockUser))
        set({ user: mockUser, token: mockToken, isAuthenticated: true })
        resolve(true)
      }, 500)
    })
  },

  signup: async (email, password, name) => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = { id: '1', email, name }
        const mockToken = 'mock-jwt-token-' + Date.now()
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('auth_user', JSON.stringify(mockUser))
        set({ user: mockUser, token: mockToken, isAuthenticated: true })
        resolve(true)
      }, 500)
    })
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  checkAuth: () => {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true })
      } catch {
        get().logout()
      }
    }
  },
}))
