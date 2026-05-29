import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Input } from '../components/ui/Input'
import { ArrowLeft, UserCheck, CheckCircle2, AlertTriangle, Mail, Check, Circle, Loader2 } from 'lucide-react'

export default function ConfirmarCadastroPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [senha, setSenha]               = useState('')
  const [confirmar, setConfirmar]       = useState('')
  const [loading, setLoading]           = useState(false)
  const [success, setSuccess]           = useState(false)
  const [erros, setErros]               = useState({})
  const [apiError, setApiError]         = useState(null)
  const [tentouEnviar, setTentouEnviar] = useState(false)

  const reqs = useMemo(() => ({
    length:  senha.length >= 8,
    upper:   /[A-Z]/.test(senha),
    lower:   /[a-z]/.test(senha),
    numSpec: /[0-9!@#$%^&*()\-_=+[\]{}|;':",.<>?/\\]/.test(senha),
    match:   senha.length > 0 && senha === confirmar,
  }), [senha, confirmar])

  const isFormValid = Object.values(reqs).every(Boolean)

  /* ── Link inválido ── */
  if (!email || !token) {
    return (
      <div className={root}>
        <div className={card}>
          <div className="w-16 h-16 rounded-[20px] bg-amber/10 border-[1.5px] border-amber/30 flex items-center justify-center text-amber self-center mb-5">
            <AlertTriangle size={28} strokeWidth={1.8} />
          </div>
          <h1 className={title}>Link inválido</h1>
          <p className={subtitle}>Este link de confirmação é inválido ou expirou. Entre em contato com o administrador para receber um novo link.</p>
          <button className={btnPrimary} onClick={() => navigate('/login')}>Ir para o login</button>
        </div>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!reqs.length || !reqs.upper || !reqs.lower || !reqs.numSpec) e.senha = 'A senha não atende todos os requisitos'
    if (!confirmar)     e.confirmar = 'Confirme sua senha'
    else if (!reqs.match) e.confirmar = 'As senhas não coincidem'
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
      await axios.post('/Auth/resetar-senha', { email, token, novaSenha: senha }, { withCredentials: true })
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.title || err.response?.data || 'Erro ao confirmar cadastro. O link pode ter expirado.'
      setApiError(typeof msg === 'string' ? msg : 'Tente solicitar um novo link com o administrador.')
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
          <h1 className={title}>Cadastro concluído!</h1>
          <p className={subtitle}>Sua senha foi criada com sucesso. Agora você já pode acessar o portal com seu e-mail e senha.</p>
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
          <UserCheck size={26} strokeWidth={1.8} />
        </div>

        <h1 className={title}>Confirmar cadastro</h1>
        <p className={subtitle}>Crie uma senha para ativar sua conta e acessar o portal.</p>

        {/* E-mail somente leitura */}
        <div className="mb-5">
          <span className="block text-[9px] font-bold text-t3 tracking-[1.2px] uppercase mb-1.5">E-mail</span>
          <div className="flex items-center gap-2 bg-s2 border-[1.5px] border-bdr rounded-[11px] px-3.5 py-[11px] text-t2 text-[13px] font-sans">
            <Mail size={14} strokeWidth={1.8} />
            <span>{email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="w-full">
          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); if (tentouEnviar) setErros(p => ({ ...p, senha: undefined })) }}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={tentouEnviar ? erros.senha : undefined}
          />

          {/* Requisitos em tempo real */}
          <div className="flex flex-col gap-[5px] mt-1 mb-4">
            <Req ok={reqs.length}  text="Mínimo 8 caracteres" />
            <Req ok={reqs.upper}   text="Uma letra maiúscula" />
            <Req ok={reqs.lower}   text="Uma letra minúscula" />
            <Req ok={reqs.numSpec} text="Um número ou caractere especial" />
          </div>

          <Input
            label="Confirmar senha"
            type="password"
            value={confirmar}
            onChange={(e) => { setConfirmar(e.target.value); if (tentouEnviar) setErros(p => ({ ...p, confirmar: undefined })) }}
            placeholder="Repita a senha"
            autoComplete="new-password"
            error={tentouEnviar ? erros.confirmar : undefined}
          />

          {apiError && (
            <div className="flex items-center gap-2 bg-red/10 border border-red/30 rounded-[10px] px-3.5 py-2.5 mb-3 text-[12px] text-red">
              <AlertTriangle size={13} strokeWidth={1.8} style={{ flexShrink: 0 }} /><span>{apiError}</span>
            </div>
          )}

          <button type="submit" disabled={!isFormValid || loading} className={btnPrimary + ' mt-2'}>
            {loading ? <Loader2 size={16} strokeWidth={1.8} className="animate-spin-fast" /> : 'Concluir cadastro'}
          </button>
        </form>

        <p className="text-center text-[12px] text-t3 mt-5">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-l font-semibold no-underline hover:opacity-75 transition-opacity duration-200">Entrar</Link>
        </p>

      </div>
    </div>
  )
}

function Req({ ok, text }) {
  return (
    <div className={`flex items-center gap-[7px] text-[11px] transition-colors duration-200 ${ok ? 'text-green' : 'text-t3'}`}>
      {ok ? <Check size={12} strokeWidth={1.8} /> : <Circle size={12} strokeWidth={1.8} />}
      <span>{text}</span>
    </div>
  )
}

/* ── Classes compartilhadas ── */
const root       = 'flex-1 flex items-center justify-center px-8 py-10 relative'
const card       = 'w-full max-w-[400px] relative z-10 flex flex-col'
const title      = 'text-2xl font-extrabold text-t1 tracking-tight mb-2'
const subtitle   = 'text-[13px] text-t2 leading-relaxed mb-7'
const btnPrimary = 'w-full bg-blue-grad border-none rounded-[11px] py-3.5 text-white text-[13px] font-bold flex items-center justify-center gap-2 tracking-[0.3px] shadow-[0_6px_20px_var(--blue-glow)] hover:brightness-110 disabled:opacity-65 disabled:cursor-not-allowed transition-all duration-200'
const btnBack    = 'inline-flex items-center gap-[7px] bg-transparent border-none cursor-pointer text-t2 text-[12px] font-semibold self-start mb-8 p-0 font-sans hover:text-blue-l transition-colors duration-200'

