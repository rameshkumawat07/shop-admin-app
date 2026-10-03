import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import type { User } from './api/types'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { CreateRecordPage, ManagementPage } from './pages/Management'
import './App.css'

type SessionUser = Omit<User, 'password'>
const SESSION_KEY = 'stockroom_user'
const THEME_KEY = 'stockroom_theme'

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) as SessionUser : null
  } catch { return null }
}

function ProtectedRoute({ user }: { user: SessionUser | null }) {
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const [user, setUser] = useState<SessionUser | null>(readSession)
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')
  const theme = createTheme({
    palette: { mode: dark ? 'dark' : 'light', primary: { main: '#246b4b' }, background: { default: dark ? '#141d17' : '#f5f7f4', paper: dark ? '#1b281f' : '#ffffff' } },
    typography: { fontFamily: "'DM Sans', sans-serif", button: { textTransform: 'none', fontWeight: 700 } },
    shape: { borderRadius: 9 },
  })

  function authenticate(nextUser: SessionUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }
  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }
  function toggleTheme() {
    setDark((current) => {
      const next = !current
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
      return next
    })
  }

  return <ThemeProvider theme={theme}><CssBaseline /><BrowserRouter><Routes>
    <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={authenticate} />} />
    <Route element={<ProtectedRoute user={user} />}>
      <Route element={<AppLayout dark={dark} toggleTheme={toggleTheme} onLogout={logout} />}>
        <Route index element={<Dashboard />} />
        <Route path="/:kind" element={<ManagementPage />} />
        <Route path="/:kind/new" element={<CreateRecordPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
  </Routes></BrowserRouter></ThemeProvider>
}

function App() { return <AppRoutes /> }

export default App
