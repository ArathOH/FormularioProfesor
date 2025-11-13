import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthGate() {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="p-8">Cargando…</div>
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />
  return <Outlet />
}
