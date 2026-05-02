import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './layout/ErrorBoundary'
import { AppLayout } from './layout/AppLayout'
import { Dashboard } from './routes/Dashboard'
import { Editor } from './routes/Editor'
import { Components } from './routes/Components'
import { Deploy } from './routes/Deploy'
import { Settings } from './routes/Settings'
import { NotFound } from './routes/NotFound'
import { Login } from './routes/Login'
import { useAuthStore } from '@/store/authStore'
import { useKeyboardShortcuts } from './lib/useKeyboardShortcuts'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, checkAuth, navigate])

  return isAuthenticated ? <>{children}</> : null
}

function AppRoutes() {
  useKeyboardShortcuts()
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="new" element={<Navigate to="/" replace />} />
        <Route
          path="editor"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="components"
          element={
            <ProtectedRoute>
              <Components />
            </ProtectedRoute>
          }
        />
        <Route
          path="deploy"
          element={
            <ProtectedRoute>
              <Deploy />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
