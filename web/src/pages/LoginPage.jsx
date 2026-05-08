import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import logoImg from '../assets/adserra-logo.png'
import './LoginPage.css'

export default function LoginPage() {
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [senha, setSenha]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!identifier.trim()) errs.identifier = 'Informe sua matrícula ou e-mail'
    if (!senha.trim())       errs.senha = 'Informe sua senha'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    setLoading(true)
    const result = await login(identifier.trim(), senha)
    setLoading(false)
    if (result.success) navigate('/dashboard', { replace: true })
  }

  return (
    <div className="login-form-side">
      <div className="login-glow" aria-hidden />

      <div className="login-card">

        <div className="login-logo-mobile">
          <LogoSVG />
        </div>

        <h1 className="login-title">Bem-vindo de volta</h1>
        <p className="login-subtitle">Acesse o portal com sua matrícula ou e-mail</p>

        <form onSubmit={handleSubmit} noValidate>

          <Input
            label="Matrícula ou e-mail"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Ex: 123456 ou nome@fsg.edu.br"
            autoComplete="username"
            icon={<UserIcon />}
            error={fieldErrors.identifier}
          />

          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            error={fieldErrors.senha}
          />

          <div className="forgot-row" style={{ justifyContent: 'flex-end' }}>
            <Link to="/esqueci-senha" className="forgot-link">
              Esqueceu a senha?
            </Link>
          </div>

          {error && (
            <div className="error-banner">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Spinner /> : 'Entrar'}
          </button>

        </form>

        <div className="divider">
          <div className="div-line" />
          <span className="div-txt">ou</span>
          <div className="div-line" />
        </div>

        <button className="btn-ghost" onClick={() => navigate('/interesse')}>
          Tenho interesse em ingressar
        </button>

      </div>
    </div>
  )
}

/* ── Logo ── */
function LogoSVG() {
  return (
    <img
      src={logoImg}
      alt="ADSerra"
      height={68}
      style={{ width: 'auto', display: 'block', userSelect: 'none' }}
      draggable={false}
    />
  )
}

/* ── Ícones ── */
function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
function Spinner() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin .8s linear infinite' }}><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
}
