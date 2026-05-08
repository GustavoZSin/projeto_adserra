import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) return null

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return children
}
