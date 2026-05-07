import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './EsqueciSenhaPage.css'

/* ══════════════════════════════════════════════════
   ESQUECI MINHA SENHA
   Chama POST /Auth/forgotPassword (ASP.NET Identity)
══════════════════════════════════════════════════ */
export default function EsqueciSenhaPage() {
  const navigate = useNavigate()

  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState(null)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Informe seu e-mail institucional')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Informe um e-mail válido')
      return
    }

    setLoading(true)
    try {
      // Endpoint gerado automaticamente pelo MapIdentityApi<User>()
      await axios.post('/Auth/esqueci-minha-senha', { email }, { withCredentials: true })
      setSuccess(true)
    } catch (err) {
      // Identity retorna 200 mesmo sem encontrar o e-mail (por segurança),
      // então erros reais são raros aqui
      const msg = err.response?.data?.detail || err.response?.data || 'Erro ao processar solicitação.'
      setError(typeof msg === 'string' ? msg : 'Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Tela de sucesso ── */
  if (success) {
    return (
      <div className="rp-root">
        <div className="rp-card">
          <div className="rp-success-icon">
            <MailSentIcon />
          </div>
          <h1 className="rp-title" style={{ textAlign: 'center' }}>Verifique seu e-mail</h1>
          <p className="rp-subtitle" style={{ textAlign: 'center', maxWidth: 300, margin: '0 auto 28px' }}>
            Se o endereço <strong style={{ color: 'var(--t1)' }}>{email}</strong> estiver cadastrado,
            você receberá um link para redefinir sua senha em instantes.
          </p>
          <div className="rp-notice">
            <InfoIcon />
            <span>Não esqueça de verificar a pasta de spam caso não encontre o e-mail.</span>
          </div>
          <button className="rp-btn-primary" onClick={() => navigate('/login')}>
            Voltar ao login
          </button>
        </div>
      </div>
    )
  }

  /* ── Formulário ── */
  return (
    <div className="rp-root">
      <div className="rp-glow" aria-hidden />

      <div className="rp-card">

        {/* Voltar */}
        <button onClick={() => navigate('/login')} className="rp-back" aria-label="Voltar">
          <ArrowLeftIcon />
          <span>Voltar ao login</span>
        </button>

        {/* Ícone */}
        <div className="rp-icon-wrap">
          <LockIcon />
        </div>

        <h1 className="rp-title">Esqueceu sua senha?</h1>
        <p className="rp-subtitle">
          Informe seu e-mail institucional e enviaremos um link para você criar uma nova senha.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="rp-inp-wrap">
            <span className="rp-inp-lbl">E-mail institucional</span>
            <div className={`rp-inp-f ${focused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
              <input
                className="rp-inp-native"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="nome@fsg.edu.br"
                autoComplete="email"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              <span className="rp-inp-ico"><MailIcon /></span>
            </div>
            {error && (
              <span className="rp-inp-err">
                <AlertIcon /> {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rp-btn-primary"
          >
            {loading ? <Spinner /> : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="rp-hint">
          Lembrou a senha?{' '}
          <Link to="/login" className="rp-link">Entrar</Link>
        </p>

      </div>
    </div>
  )
}

/* ── Ícones ── */
function ArrowLeftIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
}
function LockIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}
function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
}
function MailSentIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 14 2 2 4-4"/></svg>
}
function InfoIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
}
function AlertIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
function Spinner() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin .8s linear infinite' }}><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
}
