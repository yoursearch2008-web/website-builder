import { create } from 'zustand'
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

interface AppUser {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: AppUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error || !data.user) return false
      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.email!.split('@')[0],
      }
      set({ user: appUser, isAuthenticated: true })
      return true
    } catch {
      return false
    }
  },

  signup: async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error || !data.user) return false
      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email!,
        name,
      }
      set({ user: appUser, isAuthenticated: true })
      return true
    } catch {
      return false
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ user: null, isAuthenticated: false })
        return
      }
      const appUser: AppUser = {
        id: user.id,
        email: user.email!,
        name: user.email!.split('@')[0],
      }
      set({ user: appUser, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
