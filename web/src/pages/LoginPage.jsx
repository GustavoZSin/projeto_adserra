import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import logoImg from '../assets/adserra-logo.png'

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
    <div className="flex-1 flex items-start justify-center px-5 pt-9 pb-12 relative min-h-screen
                    md:items-center md:px-12 md:py-10">

      {/* Glow azul sutil — só no mobile */}
      <div className="absolute inset-0 pointer-events-none md:hidden"
           style={{ background: 'radial-gradient(ellipse 460px 300px at 50% -10%, rgba(27,112,176,.12) 0%, transparent 70%)' }} />

      <div className="w-full max-w-[380px] relative z-10">

        {/* Logo — só no mobile */}
        <div className="flex flex-col items-center mb-7 md:hidden">
          <img src={logoImg} alt="ADSerra" height={68} className="w-auto select-none" draggable={false} />
        </div>

        <h1 className="text-xl font-extrabold text-t1 mb-1.5 tracking-tight md:text-[26px]">
          Bem-vindo de volta
        </h1>
        <p className="text-[13px] text-t2 mb-7">
          Acesse o portal com sua matrícula ou e-mail
        </p>

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

          <div className="flex justify-end mt-2 mb-5">
            <Link to="/esqueci-senha"
                  className="text-[11px] font-semibold text-blue-l no-underline hover:opacity-75 transition-opacity duration-200">
              Esqueceu a senha?
            </Link>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red/10 border border-red/30 rounded-[10px] px-3.5 py-2.5 mb-3.5 text-[12px] text-red">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-grad border-none rounded-[11px] py-3.5 text-white text-[13px] font-bold
                       flex items-center justify-center gap-2 mb-4 tracking-[0.3px]
                       shadow-[0_6px_20px_var(--blue-glow)] hover:brightness-110
                       disabled:opacity-65 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? <Spinner /> : 'Entrar'}
          </button>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="flex-1 h-px bg-bdr" />
          <span className="text-[11px] text-t3">ou</span>
          <div className="flex-1 h-px bg-bdr" />
        </div>

        <button
          onClick={() => navigate('/interesse')}
          className="w-full bg-transparent border-[1.5px] border-bdr rounded-[11px] py-3 text-t2 text-[13px] font-semibold font-sans
                     cursor-pointer hover:border-blue-l hover:text-blue-l hover:bg-[var(--blue-sub)] transition-all duration-200"
        >
          Tenho interesse em ingressar
        </button>

      </div>
    </div>
  )
}

function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
function Spinner() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className="animate-spin-fast"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
}
