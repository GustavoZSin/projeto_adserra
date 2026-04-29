import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import './RedefinirSenhaPage.css'

/* ══════════════════════════════════════════════════
   REDEFINIR SENHA
   Acessada via link no e-mail:
   /redefinir-senha?email=xxx&token=xxx

   Chama POST /Auth/resetPassword (MapIdentityApi)
   Body: { email, resetCode, newPassword }
══════════════════════════════════════════════════ */
export default function RedefinirSenhaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [novaSenha, setNovaSenha]           = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading]               = useState(false)
  const [success, setSuccess]               = useState(false)
  const [errors, setErrors]                 = useState({})
  const [apiError, setApiError]             = useState(null)

  /* Link inválido (sem token ou email) */
  if (!email || !token) {
    return (
      <div className="rs-root">
        <div className="rs-card">
          <div className="rs-icon-wrap rs-icon-warn">
            <AlertTriangleIcon />
          </div>
          <h1 className="rs-title">Link inválido</h1>
          <p className="rs-subtitle">
            Este link de redefinição é inválido ou expirou.
            Solicite um novo link para continuar.
          </p>
          <button className="rs-btn" onClick={() => navigate('/esqueci-senha')}>
            Solicitar novo link
          </button>
        </div>
      </div>
    )
  }

  const validate = () => {
    const errs = {}
    if (!novaSenha)
      errs.novaSenha = 'Informe a nova senha'
    else if (novaSenha.length < 6)
      errs.novaSenha = 'A senha deve ter ao menos 6 caracteres'
    if (!confirmarSenha)
      errs.confirmarSenha = 'Confirme a nova senha'
    else if (novaSenha !== confirmarSenha)
      errs.confirmarSenha = 'As senhas não coincidem'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return

    setLoading(true)
    try {
      await axios.post('/Auth/resetPassword', {
        email,
        resetCode:   token,
        newPassword: novaSenha,
      }, { withCredentials: true })
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.detail ||
                  err.response?.data?.title  ||
                  err.response?.data         ||
                  'Erro ao redefinir senha. O link pode ter expirado.'
      setApiError(typeof msg === 'string' ? msg : 'Tente solicitar um novo link.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Sucesso ── */
  if (success) {
    return (
      <div className="rs-root">
        <div className="rs-card">
          <div className="rs-icon-wrap rs-icon-green">
            <CheckCircleIcon />
          </div>
          <h1 className="rs-title">Senha redefinida!</h1>
          <p className="rs-subtitle">
            Sua senha foi atualizada com sucesso. Agora você já pode acessar o portal.
          </p>
          <button className="rs-btn" onClick={() => navigate('/login')}>
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  /* ── Formulário ── */
  return (
    <div className="rs-root">
      <div className="rs-glow" aria-hidden />

      <div className="rs-card">

        {/* Back */}
        <button onClick={() => navigate('/login')} className="rs-back">
          <ArrowLeftIcon /> Voltar ao login
        </button>

        {/* Ícone */}
        <div className="rs-icon-wrap rs-icon-blue">
          <KeyIcon />
        </div>

        <h1 className="rs-title">Criar nova senha</h1>
        <p className="rs-subtitle">
          Defina uma nova senha para a conta{' '}
          <strong style={{ color: 'var(--t1)' }}>{email}</strong>.
        </p>

        <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>

          <PasswordField
            label="Nova senha"
            value={novaSenha}
            onChange={(e) => { setNovaSenha(e.target.value); setErrors(p => ({ ...p, novaSenha: undefined })) }}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            error={errors.novaSenha}
          />

          <PasswordField
            label="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => { setConfirmarSenha(e.target.value); setErrors(p => ({ ...p, confirmarSenha: undefined })) }}
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            error={errors.confirmarSenha}
          />

          {/* Requisitos */}
          <div className="rs-reqs">
            <Req ok={novaSenha.length >= 6}     text="Mínimo 6 caracteres" />
            <Req ok={/[A-Z]/.test(novaSenha)}   text="Uma letra maiúscula" />
            <Req ok={/[0-9]/.test(novaSenha)}   text="Um número" />
          </div>

          {apiError && (
            <div className="rs-error-banner">
              <AlertIcon /> <span>{apiError}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="rs-btn" style={{ marginTop: 8 }}>
            {loading ? <Spinner /> : 'Salvar nova senha'}
          </button>

        </form>

        <p className="rs-hint">
          Lembrou a senha? <Link to="/login" className="rs-link">Entrar</Link>
        </p>

      </div>
    </div>
  )
}

/* ── Requisito visual ── */
function Req({ ok, text }) {
  return (
    <div className={`rs-req ${ok ? 'rs-req--ok' : ''}`}>
      {ok ? <CheckSmallIcon /> : <DotIcon />}
      <span>{text}</span>
    </div>
  )
}

/* ── Campo de senha com toggle ── */
function PasswordField({ label, value, onChange, placeholder, autoComplete, error }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow]       = useState(false)
  return (
    <div className="rs-inp-wrap">
      <span className="rs-inp-lbl">{label}</span>
      <div className={`rs-inp-f ${focused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
        <input
          className="rs-inp-native"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button type="button" className="rs-eye-btn" onClick={() => setShow(v => !v)} tabIndex={-1}>
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <span className="rs-inp-err"><AlertIcon /> {error}</span>}
    </div>
  )
}

/* ── Ícones ── */
function ArrowLeftIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> }
function KeyIcon()           { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg> }
function CheckCircleIcon()   { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
function AlertTriangleIcon() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> }
function AlertIcon()         { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> }
function EyeIcon()           { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> }
function EyeOffIcon()        { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> }
function CheckSmallIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function DotIcon()           { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="2"/></svg> }
function Spinner()           { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin .8s linear infinite' }}><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
