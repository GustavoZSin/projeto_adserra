import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Input } from '../components/ui/Input'
import { ArrowLeft, Key, CheckCircle2, AlertTriangle, Check, Circle, Loader2 } from 'lucide-react'

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
            <AlertTriangle size={28} strokeWidth={1.8} />
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
    if (!novaSenha)                              errs.novaSenha = 'Informe a nova senha'
    else if (novaSenha.length < 6)               errs.novaSenha = 'A senha deve ter ao menos 6 caracteres'
    else if (!/[A-Z]/.test(novaSenha))           errs.novaSenha = 'A senha deve ter ao menos uma letra maiúscula'
    else if (!/[0-9]/.test(novaSenha))           errs.novaSenha = 'A senha deve ter ao menos um número'
    else if (!/[^A-Za-z0-9]/.test(novaSenha))   errs.novaSenha = 'A senha deve ter ao menos um caractere especial'
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
      await axios.post('/Auth/resetar-senha', { email, token: token, novaSenha: novaSenha })
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      const erros = data?.erros
      const msg = Array.isArray(erros) && erros.length > 0
        ? erros.join(' ')
        : (typeof data === 'string' ? data : data?.detail || data?.title || 'Erro ao redefinir senha. O link pode ter expirado.')
      setApiError(msg)
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
            <CheckCircle2 size={30} strokeWidth={1.8} />
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
          <ArrowLeft size={15} strokeWidth={1.8} /> Voltar ao login
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[var(--blue-sub)] border-[1.5px] border-[var(--blue-bdr)] flex items-center justify-center text-blue-l mb-5">
          <Key size={26} strokeWidth={1.8} />
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
            <Req ok={novaSenha.length >= 6}              text="Mínimo 6 caracteres" />
            <Req ok={/[A-Z]/.test(novaSenha)}            text="Uma letra maiúscula" />
            <Req ok={/[0-9]/.test(novaSenha)}            text="Um número" />
            <Req ok={/[^A-Za-z0-9]/.test(novaSenha)}    text="Um caractere especial (!@#$...)" />
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
              <AlertTriangle size={13} strokeWidth={1.8} style={{ flexShrink: 0 }} /><span>{apiError}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className={btnPrimary + ' mt-2'}>
            {loading ? <Loader2 size={16} strokeWidth={1.8} className="animate-spin-fast" /> : 'Salvar nova senha'}
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
      {ok ? <Check size={12} strokeWidth={1.8} /> : <Circle size={12} strokeWidth={1.8} />}
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

