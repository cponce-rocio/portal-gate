import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import FacturacionPage from './pages/FacturacionPage'
import GatersPage from './pages/GatersPage'
import PregatePage from './pages/PregatePage'

// Route guard by role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

const RoleRedirect = () => {
  const { user } = useAuthStore()
  const routes = { facturacion: '/facturacion', gaters: '/gaters', pregate: '/pregate' }
  return <Navigate to={routes[user?.role] || '/login'} replace />
}

export default function App() {
  const initAuth = useAuthStore(s => s.initAuth)
  useEffect(() => { initAuth() }, [initAuth])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<RoleRedirect />} />

        <Route path="facturacion" element={
          <ProtectedRoute allowedRoles={['facturacion']}>
            <FacturacionPage />
          </ProtectedRoute>
        } />

        <Route path="gaters" element={
          <ProtectedRoute allowedRoles={['gaters']}>
            <GatersPage />
          </ProtectedRoute>
        } />

        <Route path="pregate" element={
          <ProtectedRoute allowedRoles={['pregate']}>
            <PregatePage />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
