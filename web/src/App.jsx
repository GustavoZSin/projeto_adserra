import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PrivateRoute } from './components/layout/PrivateRoute'
import AuthLayout       from './components/layout/AuthLayout'
import LoginPage        from './pages/LoginPage'
import InteressePage    from './pages/InteressePage'
import EsqueciSenhaPage    from './pages/EsqueciSenhaPage'
import RedefinirSenhaPage  from './pages/RedefinirSenhaPage'

// ── Placeholder de Dashboard (substituir quando implementar) ──
function DashboardPage() {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: 40, color: 'var(--t1)' }}>
      <h1 style={{ marginBottom: 8 }}>Dashboard — em construção</h1>
      <p style={{ color: 'var(--t3)' }}>
        Logado como: {user?.matricula || user?.id}
      </p>
      <button
        onClick={logout}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          background: 'var(--blue)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        Sair
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Públicas — compartilham o painel esquerdo no desktop ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/interesse"     element={<InteressePage />} />
            <Route path="/esqueci-senha"  element={<EsqueciSenhaPage />} />
            <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
          </Route>

          {/* ── Protegidas ── */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* ── Raiz → login ── */}
          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
