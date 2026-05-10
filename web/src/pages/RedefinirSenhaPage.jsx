import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Input } from '../components/ui/Input'

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

  /* ── Link inválido ── */
  if (!email || !token) {
    return (
      <div className={root}>
        <div className={card}>
          <div className="w-16 h-16 rounded-[20px] bg-amber/10 border-[1.5px] border-amber/30 flex items-center justify-center text-amber self-center mb-5">
            <AlertTriangleIcon />
          </div>
          <h1 className={title}>Link inválido</h1>
          <p className={subtitle}>Este link de redefinição é inválido ou expirou. Solicite um novo link para continuar.</p>
          <button className={btnPrimary} onClick={() => navigate('/esqueci-senha')}>Solicitar novo link</button>
        </div>
      </div>
    )
  }

  const validate = () => {
    const errs = {}
    if (!novaSenha)                  errs.novaSenha = 'Informe a nova senha'
    else if (novaSenha.length < 6)   errs.novaSenha = 'A senha deve ter ao menos 6 caracteres'
    if (!confirmarSenha)             errs.confirmarSenha = 'Confirme a nova senha'
    else if (novaSenha !== confirmarSenha) errs.confirmarSenha = 'As senhas não coincidem'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    setLoading(true)
    try {
      await axios.post('/Auth/resetar-senha', { email, token: token, novaSenha: novaSenha }, { withCredentials: true })
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.title || err.response?.data || 'Erro ao redefinir senha. O link pode ter expirado.'
      setApiError(typeof msg === 'string' ? msg : 'Tente solicitar um novo link.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Sucesso ── */
  if (success) {
    return (
      <div className={root}>
        <div className={card}>
          <div className="w-16 h-16 rounded-[20px] bg-green/10 border-[1.5px] border-green/30 flex items-center justify-center text-green self-center mb-5">
            <CheckCircleIcon />
          </div>
          <h1 className={title}>Senha redefinida!</h1>
          <p className={subtitle}>Sua senha foi atualizada com sucesso. Agora você já pode acessar o portal.</p>
          <button className={btnPrimary} onClick={() => navigate('/login')}>Ir para o login</button>
        </div>
      </div>
    )
  }

  /* ── Formulário ── */
  return (
    <div className={root}>
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 500px 320px at 50% -10%, rgba(27,112,176,.12) 0%, transparent 70%)' }} />

      <div className={card}>

        <button onClick={() => navigate('/login')} className={btnBack}>
          <ArrowLeftIcon /> Voltar ao login
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[var(--blue-sub)] border-[1.5px] border-[var(--blue-bdr)] flex items-center justify-center text-blue-l mb-5">
          <KeyIcon />
        </div>

        <h1 className={title}>Criar nova senha</h1>
        <p className={subtitle}>
          Defina uma nova senha para a conta <strong className="text-t1">{email}</strong>.
        </p>

        <form onSubmit={handleSubmit} noValidate className="w-full">
          <Input
            label="Nova senha"
            type="password"
            value={novaSenha}
            onChange={(e) => { setNovaSenha(e.target.value); setErrors(p => ({ ...p, novaSenha: undefined })) }}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            error={errors.novaSenha}
          />

          {/* Requisitos */}
          <div className="flex flex-col gap-[5px] mt-1 mb-4">
            <Req ok={novaSenha.length >= 6}    text="Mínimo 6 caracteres" />
            <Req ok={/[A-Z]/.test(novaSenha)}  text="Uma letra maiúscula" />
            <Req ok={/[0-9]/.test(novaSenha)}  text="Um número" />
          </div>

          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => { setConfirmarSenha(e.target.value); setErrors(p => ({ ...p, confirmarSenha: undefined })) }}
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            error={errors.confirmarSenha}
          />

          {apiError && (
            <div className="flex items-center gap-2 bg-red/10 border border-red/30 rounded-[10px] px-3.5 py-2.5 mb-3 text-[12px] text-red">
              <AlertIcon /><span>{apiError}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className={btnPrimary + ' mt-2'}>
            {loading ? <Spinner /> : 'Salvar nova senha'}
          </button>
        </form>

        <p className="text-center text-[12px] text-t3 mt-5">
          Lembrou a senha?{' '}
          <Link to="/login" className="text-blue-l font-semibold no-underline hover:opacity-75 transition-opacity duration-200">Entrar</Link>
        </p>

      </div>
    </div>
  )
}

/* ── Requisito visual ── */
function Req({ ok, text }) {
  return (
    <div className={`flex items-center gap-[7px] text-[11px] transition-colors duration-200 ${ok ? 'text-green' : 'text-t3'}`}>
      {ok ? <CheckSmallIcon /> : <DotIcon />}
      <span>{text}</span>
    </div>
  )
}

/* ── Classes compartilhadas ── */
const root      = 'flex-1 flex items-center justify-center px-8 py-10 relative'
const card      = 'w-full max-w-[400px] relative z-10 flex flex-col'
const title     = 'text-2xl font-extrabold text-t1 tracking-tight mb-2'
const subtitle  = 'text-[13px] text-t2 leading-relaxed mb-7'
const btnPrimary = 'w-full bg-blue-grad border-none rounded-[11px] py-3.5 text-white text-[13px] font-bold flex items-center justify-center gap-2 tracking-[0.3px] shadow-[0_6px_20px_var(--blue-glow)] hover:brightness-110 disabled:opacity-65 disabled:cursor-not-allowed transition-all duration-200'
const btnBack    = 'inline-flex items-center gap-[7px] bg-transparent border-none cursor-pointer text-t2 text-[12px] font-semibold self-start mb-8 p-0 font-sans hover:text-blue-l transition-colors duration-200'

/* ── Ícones ── */
function ArrowLeftIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> }
function KeyIcon()           { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg> }
function CheckCircleIcon()   { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
function AlertTriangleIcon() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> }
function AlertIcon()         { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> }
function CheckSmallIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function DotIcon()           { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="2"/></svg> }
function Spinner()           { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin-fast"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
