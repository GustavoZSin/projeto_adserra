import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Input } from '../components/ui/Input'

export default function EsqueciSenhaPage() {
  const navigate = useNavigate()

  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.trim())               { setError('Informe seu e-mail institucional'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Informe um e-mail válido'); return }

    setLoading(true)
    try {
      await axios.post('/Auth/esqueci-minha-senha', { email }, { withCredentials: true })
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data || 'Erro ao processar solicitação.'
      setError(typeof msg === 'string' ? msg : 'Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Sucesso ── */
  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 py-10 relative">
        <div className="w-full max-w-[400px] flex flex-col">
          <div className="w-16 h-16 rounded-[20px] bg-green/10 border-[1.5px] border-green/30 flex items-center justify-center text-green self-center mb-5">
            <MailSentIcon />
          </div>
          <h1 className="text-2xl font-extrabold text-t1 tracking-tight mb-2 text-center">Verifique seu e-mail</h1>
          <p className="text-[13px] text-t2 leading-relaxed mb-7 text-center max-w-[300px] mx-auto">
            Se o endereço <strong className="text-t1">{email}</strong> estiver cadastrado,
            você receberá um link para redefinir sua senha em instantes.
          </p>
          <div className="flex items-start gap-2.5 bg-[var(--blue-sub)] border border-[var(--blue-bdr)] rounded-[10px] px-3.5 py-[11px] text-[12px] text-blue-l leading-[1.55] mb-6">
            <InfoIcon />
            <span>Não esqueça de verificar a pasta de spam caso não encontre o e-mail.</span>
          </div>
          <button onClick={() => navigate('/login')} className={btnPrimary}>
            Voltar ao login
          </button>
        </div>
      </div>
    )
  }

  /* ── Formulário ── */
  return (
    <div className="flex-1 flex items-center justify-center px-8 py-10 relative">
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 500px 320px at 50% -10%, rgba(27,112,176,.12) 0%, transparent 70%)' }} />

      <div className="w-full max-w-[400px] relative z-10 flex flex-col">

        <button onClick={() => navigate('/login')} className={btnBack}>
          <ArrowLeftIcon /><span>Voltar ao login</span>
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[var(--blue-sub)] border-[1.5px] border-[var(--blue-bdr)] flex items-center justify-center text-blue-l mb-5">
          <LockIcon />
        </div>

        <h1 className="text-2xl font-extrabold text-t1 tracking-tight mb-2">Esqueceu sua senha?</h1>
        <p className="text-[13px] text-t2 leading-relaxed mb-7">
          Informe seu e-mail institucional e enviaremos um link para você criar uma nova senha.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="E-mail institucional"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            placeholder="nome@fsg.edu.br"
            autoComplete="email"
            error={error}
            icon={<MailIcon />}
          />

          <button type="submit" disabled={loading} className={btnPrimary + ' mt-1'}>
            {loading ? <Spinner /> : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="text-center text-[12px] text-t3 mt-5">
          Lembrou a senha?{' '}
          <Link to="/login" className="text-blue-l font-semibold no-underline hover:opacity-75 transition-opacity duration-200">
            Entrar
          </Link>
        </p>

      </div>
    </div>
  )
}

/* ── Classes reutilizáveis locais ── */
const btnPrimary = 'w-full bg-blue-grad border-none rounded-[11px] py-3.5 text-white text-[13px] font-bold flex items-center justify-center gap-2 tracking-[0.3px] shadow-[0_6px_20px_var(--blue-glow)] hover:brightness-110 disabled:opacity-65 disabled:cursor-not-allowed transition-all duration-200'
const btnBack    = 'inline-flex items-center gap-[7px] bg-transparent border-none cursor-pointer text-t2 text-[12px] font-semibold self-start mb-8 p-0 font-sans hover:text-blue-l transition-colors duration-200'

/* ── Ícones ── */
function ArrowLeftIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> }
function LockIcon()      { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> }
function MailIcon()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> }
function MailSentIcon()  { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 14 2 2 4-4"/></svg> }
function InfoIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> }
function Spinner()       { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin-fast"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
