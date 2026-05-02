import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, signup, isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    navigate('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let success: boolean
      if (isSignup) {
        success = await signup(email, password, email.split('@')[0])
      } else {
        success = await login(email, password)
      }
      if (success) {
        navigate('/')
      } else {
        setError('Authentication failed')
      }
    } catch {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-bg-0 px-6">
      <div class="w-full max-w-md bg-bg-2 border border-border-default rounded-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold tracking-tight mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p class="text-text-2 text-sm">
            {isSignup ? 'Sign up to start building' : 'Login to your account'}
          </p>
        </div>

        {error && (
          <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-[11.5px] text-text-2 mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              placeholder="you@example.com"
              class="w-full px-3 py-2.5 rounded-lg border border-border-default bg-bg-1 text-text-0 text-[13px] outline-none focus:border-green placeholder:text-text-3 transition-colors"
              required
            />
          </div>
          <div>
            <label class="block text-[11.5px] text-text-2 mb-1.5 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
              placeholder="••••••••"
              class="w-full px-3 py-2.5 rounded-lg border border-border-default bg-bg-1 text-text-0 text-[13px] outline-none focus:border-green placeholder:text-text-3 transition-colors"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            class="w-full py-2.5 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dim transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button
            onClick={() => { setIsSignup(!isSignup); setError('') }}
            class="text-[12px] text-text-3 hover:text-green transition-colors"
          >
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}
