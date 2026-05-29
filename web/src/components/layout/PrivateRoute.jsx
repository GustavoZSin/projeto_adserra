import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

/**
 * Protege rotas que exigem autenticação.
 * Enquanto carrega, mostra tela em branco; ao verificar,
 * redireciona para /login se não houver sessão.
 */
export function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <Loader2 size={32} strokeWidth={1.8} className="animate-spin" style={{ color: 'var(--blue)' }} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
