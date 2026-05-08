import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Input } from '../components/ui/Input'
import './ConfirmarCadastroPage.css'

/* ══════════════════════════════════════════════════
   CONFIRMAR CADASTRO
   Acessada via link no e-mail após admin aprovar a solicitação:
   /confirmar-cadastro?email=xxx&token=xxx

   Chama POST /Auth/confirmarCadastro
   Body: { email, token, password }
══════════════════════════════════════════════════ */
export default function ConfirmarCadastroPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [senha, setSenha]           = useState('')
  const [confirmar, setConfirmar]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [erros, setErros]           = useState({})
  const [apiError, setApiError]     = useState(null)
  const [tentouEnviar, setTentouEnviar] = useState(false)

  const reqs = useMemo(() => ({
    length:  senha.length >= 8,
    upper:   /[A-Z]/.test(senha),
    lower:   /[a-z]/.test(senha),
    numSpec: /[0-9!@#$%^&*()\-_=+[\]{}|;':",.<>?/\\]/.test(senha),
    match:   senha.length > 0 && senha === confirmar,
  }), [senha, confirmar])

  const isFormValid = Object.values(reqs).every(Boolean)

  /* Link inválido */
  if (!email || !token) {
    return (
      <div className="cc-root">
        <div className="cc-card">
          <div className="cc-icon-wrap cc-icon-warn">
            <AlertTriangleIcon />
          </div>
          <h1 className="cc-title">Link inválido</h1>
          <p className="cc-subtitle">
            Este link de confirmação é inválido ou expirou.
            Entre em contato com o administrador para receber um novo link.
          </p>
          <button className="cc-btn" onClick={() => navigate('/login')}>
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!reqs.length || !reqs.upper || !reqs.lower || !reqs.numSpec)
      e.senha = 'A senha não atende todos os requisitos'
    if (!confirmar)
      e.confirmar = 'Confirme sua senha'
    else if (!reqs.match)
      e.confirmar = 'As senhas não coincidem'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTentouEnviar(true)
    setApiError(null)
    if (!validate()) return

    setLoading(true)
    try {
      await axios.post('/Auth/confirmarCadastro', {
        email,
        token,
        password: senha,
      }, { withCredentials: true })
      setSuccess(true)
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.title  ||
        err.response?.data         ||
        'Erro ao confirmar cadastro. O link pode ter expirado.'
      setApiError(typeof msg === 'string' ? msg : 'Tente solicitar um novo link com o administrador.')
    } finally {
      setLoading(false)
    }
  }

  /* Sucesso */
  if (success) {
    return (
      <div className="cc-root">
        <div className="cc-card">
          <div className="cc-icon-wrap cc-icon-green">
            <CheckCircleIcon />
          </div>
          <h1 className="cc-title">Cadastro concluído!</h1>
          <p className="cc-subtitle">
            Sua senha foi criada com sucesso. Agora você já pode acessar o portal com seu e-mail e senha.
          </p>
          <button className="cc-btn" onClick={() => navigate('/login')}>
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  /* Formulário */
  return (
    <div className="cc-root">
      <div className="cc-glow" aria-hidden />

      <div className="cc-card">

        <button onClick={() => navigate('/login')} className="cc-back">
          <ArrowLeftIcon /> Voltar ao login
        </button>

        <div className="cc-icon-wrap cc-icon-blue">
          <UserCheckIcon />
        </div>

        <h1 className="cc-title">Confirmar cadastro</h1>
        <p className="cc-subtitle">
          Crie uma senha para ativar sua conta e acessar o portal.
        </p>

        {/* E-mail somente leitura */}
        <div className="cc-email-display">
          <span className="cc-email-lbl">E-mail</span>
          <div className="cc-email-val">
            <MailIcon />
            <span>{email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>

          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value)
              if (tentouEnviar) setErros(p => ({ ...p, senha: undefined }))
            }}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={tentouEnviar ? erros.senha : undefined}
          />

          {/* Requisitos em tempo real */}
          <div className="cc-reqs">
            <Req ok={reqs.length}  text="Mínimo 8 caracteres" />
            <Req ok={reqs.upper}   text="Uma letra maiúscula" />
            <Req ok={reqs.lower}   text="Uma letra minúscula" />
            <Req ok={reqs.numSpec} text="Um número ou caractere especial" />
          </div>

          <Input
            label="Confirmar senha"
            type="password"
            value={confirmar}
            onChange={(e) => {
              setConfirmar(e.target.value)
              if (tentouEnviar) setErros(p => ({ ...p, confirmar: undefined }))
            }}
            placeholder="Repita a senha"
            autoComplete="new-password"
            error={tentouEnviar ? erros.confirmar : undefined}
          />

          {apiError && (
            <div className="cc-error-banner">
              <AlertIcon /> <span>{apiError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="cc-btn"
            style={{ marginTop: 8 }}
          >
            {loading ? <Spinner /> : 'Concluir cadastro'}
          </button>

        </form>

        <p className="cc-hint">
          Já tem uma conta? <Link to="/login" className="cc-link">Entrar</Link>
        </p>

      </div>
    </div>
  )
}

/* ── Requisito visual ── */
function Req({ ok, text }) {
  return (
    <div className={`cc-req ${ok ? 'cc-req--ok' : ''}`}>
      {ok ? <CheckSmallIcon /> : <DotIcon />}
      <span>{text}</span>
    </div>
  )
}

/* ── Ícones ── */
function ArrowLeftIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> }
function UserCheckIcon()     { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> }
function CheckCircleIcon()   { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
function AlertTriangleIcon() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> }
function AlertIcon()         { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> }
function MailIcon()          { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> }
function CheckSmallIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function DotIcon()           { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="2"/></svg> }
function Spinner()           { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin .8s linear infinite' }}><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
