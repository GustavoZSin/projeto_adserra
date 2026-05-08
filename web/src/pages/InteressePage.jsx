import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { authService } from '../services/api'

export default function InteressePage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ nomeCompleto: '', matricula: '', email: '', departamento: '', mensagem: '' })
  const [autorizaDesconto, setAutorizaDesconto] = useState(false)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [apiError, setApiError] = useState(null)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.nomeCompleto.trim()) errs.nomeCompleto = 'Informe seu nome completo'
    if (!form.email.trim())        errs.email = 'Informe seu e-mail institucional'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'E-mail inválido'
    if (!form.departamento.trim()) errs.departamento = 'Informe seu departamento'
    if (!autorizaDesconto)         errs.autorizaDesconto = 'É necessário autorizar o desconto para prosseguir'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    setLoading(true)
    try {
      await authService.solicitarIngresso({ nomeCompleto: form.nomeCompleto, email: form.email, departamento: form.departamento, matricula: form.matricula || null, mensagem: form.mensagem || null, autorizaDesconto })
      setSuccess(true)
    } catch (err) {
      setApiError(err.response?.data?.message || err.response?.data || 'Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const toggleAutoriza = () => {
    setAutorizaDesconto(v => !v)
    if (errors.autorizaDesconto) setErrors(prev => ({ ...prev, autorizaDesconto: undefined }))
  }

  /* ── Sucesso ── */
  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px] flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-[20px] bg-green/10 border-[1.5px] border-green/30 flex items-center justify-center text-green mb-5">
            <CheckCircleIcon />
          </div>
          <h2 className="text-[22px] font-extrabold text-t1 mb-2.5">Solicitação enviada!</h2>
          <p className="text-[13px] text-t3 leading-[1.7] mb-7">
            Seu interesse foi registrado. O administrador analisará seu vínculo docente e entrará em contato pelo e-mail informado.
          </p>
          <button onClick={() => navigate('/login')} className={clsx(btnPrimary, 'max-w-[280px]')}>
            Voltar ao login
          </button>
        </div>
      </div>
    )
  }

  const fieldNome = <Field label="Nome completo" value={form.nomeCompleto} onChange={set('nomeCompleto')} placeholder="Nome do professor" error={errors.nomeCompleto} />
  const fieldMatricula = <Field label="Matrícula docente" value={form.matricula} onChange={set('matricula')} placeholder="Matrícula funcional" />
  const fieldEmail = <Field label="E-mail institucional" value={form.email} onChange={set('email')} placeholder="nome@fsg.edu.br" type="email" icon={<MailIcon />} error={errors.email} />
  const fieldDep = <Field label="Departamento / Área de docência" value={form.departamento} onChange={set('departamento')} placeholder="Ex: Engenharia, Direito, Saúde..." error={errors.departamento} />
  const fieldMsg = <FieldTextarea label="Mensagem (opcional)" value={form.mensagem} onChange={set('mensagem')} placeholder="Conte brevemente sobre sua atuação docente..." />

  return (
    <div className="flex-1 flex flex-col">

      {/* ── Topbar — mobile only ── */}
      <div className="md:hidden flex items-center px-[15px] py-[11px] border-b border-bdr2 flex-shrink-0">
        <button onClick={() => navigate(-1)} aria-label="Voltar"
                className="w-[26px] h-[26px] bg-s2 border border-bdr rounded-[8px] flex items-center justify-center text-t2 cursor-pointer flex-shrink-0 mr-2 hover:bg-s3 transition-colors">
          <ArrowLeftIcon />
        </button>
        <span className="text-[12px] font-semibold text-t1">Solicitação de ingresso</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-[14px] pb-10 md:px-12 md:py-10 md:max-w-[560px] md:mx-auto md:overflow-visible">

        {/* ── Back link — desktop only ── */}
        <button onClick={() => navigate(-1)}
                className="hidden md:inline-flex items-center gap-[7px] bg-transparent border-none cursor-pointer text-t2 text-[12px] font-semibold mb-7 p-0 font-sans hover:text-blue-l transition-colors duration-200">
          <ArrowLeftIcon /> Voltar ao login
        </button>

        {/* ── Título — desktop only ── */}
        <p className="hidden md:block text-[19px] font-black text-t1 mb-5">Solicitação de ingresso</p>

        {/* ── Hero banner — desktop only ── */}
        <div className="hidden md:block relative overflow-hidden rounded-2xl px-[22px] py-[18px] mb-5"
             style={{ background: 'linear-gradient(135deg, var(--blue-d), var(--blue))' }}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/[0.07] pointer-events-none" />
          <p className="relative z-10 text-[10px] font-bold tracking-[1.5px] uppercase text-white/60 mb-0.5">Plataforma exclusiva para docentes</p>
          <p className="relative z-10 text-[18px] font-extrabold text-white mb-1.5">Tenho interesse em ingressar</p>
          <p className="relative z-10 text-[12px] text-white/75 leading-relaxed">
            Destinada exclusivamente a professores do Centro Universitário da Serra Gaúcha.
            O administrador verificará seu vínculo docente antes de liberar o acesso.
          </p>
        </div>

        {/* ── Cabeçalho — mobile only ── */}
        <div className="md:hidden text-center mb-[18px]">
          <p className="text-[16px] font-extrabold text-t1 mb-1">Tenho interesse em ingressar</p>
          <p className="text-[11px] text-t3 leading-[1.5]">
            Esta plataforma é destinada exclusivamente a docentes do Centro Universitário da Serra Gaúcha.
          </p>
        </div>

        {/* ── Notice ── */}
        <div className="flex items-start gap-2 bg-[var(--blue-sub)] border border-[var(--blue-bdr)] rounded-[10px] px-3 py-[10px] mb-3.5">
          <span className="text-blue-l flex-shrink-0 mt-px"><InfoIcon /></span>
          <span className="text-[10px] md:text-[12px] text-blue-l leading-[1.55]">
            Após o envio, o administrador verificará seu vínculo docente com a FSG e
            entrará em contato pelo e-mail institucional informado.
          </span>
        </div>

        {/* ── Formulário ── */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Mobile: coluna única */}
          <div className="md:hidden flex flex-col gap-2.5">
            {fieldNome}{fieldEmail}{fieldDep}{fieldMatricula}
          </div>

          {/* Desktop: grid 2 colunas */}
          <div className="hidden md:grid grid-cols-2 gap-3">
            {fieldNome}{fieldMatricula}{fieldEmail}{fieldDep}
          </div>

          <div className="mb-4 mt-2">{fieldMsg}</div>

          {/* Checkbox */}
          <div
            className="flex items-start gap-2.5 cursor-pointer select-none mb-1.5 py-0.5"
            onClick={toggleAutoriza}
          >
            <div className={clsx(
              'w-[17px] h-[17px] rounded-[5px] flex-shrink-0 mt-0.5 flex items-center justify-center border-[1.5px] transition-all duration-200',
              autorizaDesconto
                ? 'bg-blue-grad border-blue shadow-[0_2px_8px_var(--blue-glow)]'
                : errors.autorizaDesconto ? 'bg-inp border-red' : 'bg-inp border-bdr'
            )}>
              {autorizaDesconto && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span className={clsx('text-[11px] md:text-[13px] leading-[1.55] transition-colors', autorizaDesconto ? 'text-t1' : 'text-t2')}>
              Eu quero me associar e autorizo o desconto de pagamento na minha folha salarial mensal.
            </span>
          </div>
          {errors.autorizaDesconto && (
            <span className="flex items-center gap-[5px] text-[10px] text-red mb-2.5">
              <AlertIcon /> {errors.autorizaDesconto}
            </span>
          )}

          {apiError && (
            <div className="bg-red/10 border border-red/30 rounded-[10px] px-3.5 py-2.5 text-[12px] text-red mb-3">
              {apiError}
            </div>
          )}

          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? <Spinner /> : 'Enviar solicitação'}
          </button>

          <p className="text-[10px] text-t3 text-center mt-2">
            Você será notificado por e-mail após a análise do administrador
          </p>
        </form>

      </div>
    </div>
  )
}

/* ── Campos locais ── */
function Field({ label, value, onChange, placeholder, type = 'text', icon, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="w-full">
      <span className="block text-[9px] md:text-[10px] font-bold text-t3 tracking-[1px] uppercase mb-1">{label}</span>
      <div className={clsx(
        'flex items-center bg-inp rounded-[11px] px-3 py-[10px] md:py-[11px] md:px-3.5 gap-2',
        'border-[1.5px] transition-[border-color,box-shadow] duration-[250ms]',
        focused ? 'border-blue shadow-[0_0_0_3px_var(--blue-sub)]' : error ? 'border-red' : 'border-bdr'
      )}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
               onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
               className="flex-1 bg-transparent border-none outline-none text-t1 text-[11px] md:text-[13px] font-sans placeholder:text-t3" />
        {icon && <span className="text-icon flex items-center flex-shrink-0">{icon}</span>}
      </div>
      {error && <span className="block text-[10px] text-red mt-1">{error}</span>}
    </div>
  )
}

function FieldTextarea({ label, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="w-full">
      <span className="block text-[9px] md:text-[10px] font-bold text-t3 tracking-[1px] uppercase mb-1">{label}</span>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={4}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                className={clsx(
                  'w-full bg-inp rounded-[11px] px-3 py-[10px] text-t1 text-[11px] md:text-[13px] font-sans resize-none outline-none placeholder:text-t3',
                  'border-[1.5px] transition-[border-color,box-shadow] duration-[250ms] md:h-20',
                  focused ? 'border-blue shadow-[0_0_0_3px_var(--blue-sub)]' : 'border-bdr'
                )} />
    </div>
  )
}

const btnPrimary = 'w-full bg-blue-grad border-none rounded-[11px] py-3 text-white text-[13px] font-bold flex items-center justify-center gap-2 tracking-[0.3px] shadow-[0_6px_18px_var(--blue-glow)] hover:brightness-110 disabled:opacity-65 disabled:cursor-not-allowed transition-all duration-200 mb-2'

/* ── Ícones ── */
function ArrowLeftIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> }
function InfoIcon()        { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> }
function MailIcon()        { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> }
function AlertIcon()       { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> }
function CheckCircleIcon() { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
function Spinner()         { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin-fast"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
