import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { NavbarNested } from './components/NavbarNested/NavbarNested'
import { IconLayoutDashboardFilled, IconListLetters } from '@tabler/icons-react'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DocumentsPage } from './pages/document/DocumentsPage'
const navbarData = [
  { label: 'Dashboard', icon: IconLayoutDashboardFilled, link: '/' },
  {
    label: 'Catalogue',
    icon: IconListLetters,
    initiallyOpened: true,
    links: [
      { label: 'Documents', link: '/documents' },
    ],
  },
]

function AppLayout() {
  return (
    <div className="flex h-screen">
      <NavbarNested data={navbarData} />
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}