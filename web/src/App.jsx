import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AprovacoesPendentesProvider } from './contexts/AprovacoesPendentesContext'
import { PrivateRoute } from './components/layout/PrivateRoute'
import { AdminRoute }   from './components/layout/AdminRoute'
import AuthLayout from './components/layout/AuthLayout'
import AppLayout  from './components/layout/AppLayout'

const LoginPage              = lazy(() => import('./pages/LoginPage'))
const InteressePage          = lazy(() => import('./pages/InteressePage'))
const EsqueciSenhaPage       = lazy(() => import('./pages/EsqueciSenhaPage'))
const RedefinirSenhaPage     = lazy(() => import('./pages/RedefinirSenhaPage'))
const ConfirmarCadastroPage  = lazy(() => import('./pages/ConfirmarCadastroPage'))
const HomePage               = lazy(() => import('./pages/HomePage'))
const EventosPage            = lazy(() => import('./pages/EventosPage'))
const PublicarPage           = lazy(() => import('./pages/PublicarPage'))
const AprovarCadastrosPage   = lazy(() => import('./pages/AprovarCadastrosPage'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AprovacoesPendentesProvider>
        <Suspense fallback={null}>
        <Routes>
          {/* ── Públicas — painel azul no desktop ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/interesse"       element={<InteressePage />} />
            <Route path="/esqueci-senha"   element={<EsqueciSenhaPage />} />
            <Route path="/redefinir-senha"    element={<RedefinirSenhaPage />} />
            <Route path="/confirmar-cadastro" element={<ConfirmarCadastroPage />} />
          </Route>

          {/* ── Protegidas — compartilham AppLayout com bottom nav ── */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/eventos"   element={<EventosPage />} />
            <Route path="/publicar"          element={<AdminRoute><PublicarPage /></AdminRoute>} />
            <Route path="/aprovar-cadastros" element={<AdminRoute><AprovarCadastrosPage /></AdminRoute>} />
          </Route>

          {/* ── Raiz → login ── */}
          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
        </Suspense>
        </AprovacoesPendentesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
