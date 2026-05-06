import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--t3)', marginTop: 3 }}>
            Associação dos Docentes · Serra Gaúcha
          </div>
        </div>

        <h1 className="login-title">Bem-vindo de volta</h1>
        <p className="login-subtitle">Acesse o portal com sua matrícula ou e-mail</p>

        <form onSubmit={handleSubmit} noValidate>

          <div className="inp-wrap">
            <span className="inp-lbl">Matrícula ou e-mail</span>
            <InputField
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Ex: 123456 ou nome@fsg.edu.br"
              autoComplete="username"
              icon={<UserIcon />}
              error={fieldErrors.identifier}
            />
          </div>

          <div className="inp-wrap" style={{ marginBottom: 2 }}>
            <span className="inp-lbl">Senha</span>
            <PasswordField
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              error={fieldErrors.senha}
            />
          </div>

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

/* ── Campos ── */
function InputField({ value, onChange, placeholder, autoComplete, icon, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <>
      <div className={`inp-f ${focused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
        <input
          className="inp-native"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <span className="inp-ico">{icon}</span>
      </div>
      {error && <span className="inp-err">{error}</span>}
    </>
  )
}

function PasswordField({ value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow]       = useState(false)
  return (
    <>
      <div className={`inp-f ${focused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
        <input
          className="inp-native"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          autoComplete="current-password"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button type="button" className="eye-btn" onClick={() => setShow(v => !v)} tabIndex={-1}>
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <span className="inp-err">{error}</span>}
    </>
  )
}

/* ── Logo ── */
function LogoSVG() {
  return (
    <svg width="148" height="42" viewBox="0 0 296 80" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="64" fontFamily="Georgia,serif" fontSize="70" fontWeight="700" fill="var(--logo-ad)" style={{ transition: 'fill .35s' }}>AD</text>
      <text x="114" y="64" fontFamily="Georgia,serif" fontSize="70" fontWeight="700" fill="#1B70B0">Serra</text>
      <g transform="translate(266,0) scale(0.46)">
        <path d="M28,4 L58,2 L82,10 L98,20 L106,36 L112,52 L108,70 L96,84 L78,96 L58,104 L36,102 L18,92 L6,76 L2,56 L4,36 L12,18 Z" fill="#1B70B0" opacity=".9"/>
        <line x1="28" y1="4"  x2="108" y2="70" stroke="white" strokeWidth="3.5" opacity=".7"/>
        <line x1="2"  y1="56" x2="112" y2="52" stroke="white" strokeWidth="3.5" opacity=".7"/>
        <line x1="58" y1="2"  x2="58"  y2="104" stroke="white" strokeWidth="3.5" opacity=".7"/>
        <circle cx="57" cy="52" r="5" fill="white" opacity=".9"/>
      </g>
    </svg>
  )
}

/* ── Ícones ── */
function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function EyeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}
function EyeOffIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
function Spinner() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin .8s linear infinite' }}><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
}
