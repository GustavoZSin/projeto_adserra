import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import './InteressePage.css'

/* ══════════════════════════════════════════════════
   INTERESSE — Solicitação de ingresso
   Mobile : topbar + coluna única + 1 botão
   Desktop: título de página + hero banner + grid 2 colunas + 2 botões
══════════════════════════════════════════════════ */
export default function InteressePage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nomeCompleto: '',
    matricula:    '',
    email:        '',
    departamento: '',
    mensagem:     '',
  })
  const [autorizaDesconto, setAutorizaDesconto] = useState(false)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [apiError, setApiError] = useState(null)

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

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
      await authService.solicitarIngresso({
        nomeCompleto:      form.nomeCompleto,
        email:             form.email,
        departamento:      form.departamento,
        matricula:         form.matricula || null,
        mensagem:          form.mensagem  || null,
        autorizaDesconto,
      })
      setSuccess(true)
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.response?.data ||
        'Erro ao enviar solicitação. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const toggleAutoriza = () => {
    setAutorizaDesconto(v => !v)
    if (errors.autorizaDesconto)
      setErrors(prev => ({ ...prev, autorizaDesconto: undefined }))
  }

  /* ── Sucesso ── */
  if (success) {
    return (
      <div className="int-success-root">
        <div className="int-success-card">
          <div className="int-success-ico"><CheckCircleIcon /></div>
          <h2 className="int-success-title">Solicitação enviada!</h2>
          <p className="int-success-sub">
            Seu interesse foi registrado. O administrador analisará seu vínculo
            docente e entrará em contato pelo e-mail informado.
          </p>
          <button className="int-btn-p" style={{ maxWidth: 280 }} onClick={() => navigate('/login')}>
            Voltar ao login
          </button>
        </div>
      </div>
    )
  }

  /* ── Campos compartilhados ── */
  const fieldNome = (
    <div className="int-inp-grp">
      <span className="int-inp-lbl">Nome completo</span>
      <TextField
        value={form.nomeCompleto}
        onChange={set('nomeCompleto')}
        placeholder="Nome do professor"
        error={errors.nomeCompleto}
      />
    </div>
  )
  const fieldMatricula = (
    <div className="int-inp-grp">
      <span className="int-inp-lbl">Matrícula docente</span>
      <TextField
        value={form.matricula}
        onChange={set('matricula')}
        placeholder="Matrícula funcional"
      />
    </div>
  )
  const fieldEmail = (
    <div className="int-inp-grp">
      <span className="int-inp-lbl">E-mail institucional</span>
      <TextField
        value={form.email}
        onChange={set('email')}
        placeholder="nome@fsg.edu.br"
        type="email"
        icon={<MailIcon />}
        error={errors.email}
      />
    </div>
  )
  const fieldDep = (
    <div className="int-inp-grp">
      <span className="int-inp-lbl">Departamento / Área de docência</span>
      <TextField
        value={form.departamento}
        onChange={set('departamento')}
        placeholder="Ex: Engenharia, Direito, Saúde..."
        error={errors.departamento}
      />
    </div>
  )
  const fieldMsg = (
    <div className="int-inp-grp" style={{ marginBottom: 16 }}>
      <span className="int-inp-lbl">Mensagem (opcional)</span>
      <TextareaField
        value={form.mensagem}
        onChange={set('mensagem')}
        placeholder="Conte brevemente sobre sua atuação docente..."
      />
    </div>
  )
  const checkboxAutoriza = (
    <>
      <div
        className={`int-checkbox-wrap ${autorizaDesconto ? 'checked' : ''} ${errors.autorizaDesconto ? 'error' : ''}`}
        onClick={toggleAutoriza}
      >
        <div className="int-checkbox-box">
          {autorizaDesconto && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
        <span className="int-checkbox-txt">
          Eu quero me associar e autorizo o desconto de pagamento na minha folha salarial mensal.
        </span>
      </div>
      {errors.autorizaDesconto && (
        <span className="int-checkbox-err">
          <AlertIcon /> {errors.autorizaDesconto}
        </span>
      )}
    </>
  )

  return (
    <div className="int-root">

      {/* ── Topbar — mobile only ── */}
      <div className="int-topbar">
        <button className="int-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeftIcon />
        </button>
        <span className="int-topbar-title">Solicitação de ingresso</span>
      </div>

      <div className="int-scroll">

        {/* ── Back link — desktop only ── */}
        <button className="int-web-back" onClick={() => navigate(-1)}>
          <ArrowLeftIcon /> Voltar ao login
        </button>

        {/* ── Título — desktop only ── */}
        <p className="int-web-page-title">Solicitação de ingresso</p>

        {/* ── Hero banner — desktop only ── */}
        <div className="int-web-hero">
          <div className="int-web-hero-circle" />
          <p className="int-web-hero-eyebrow">Plataforma exclusiva para docentes</p>
          <p className="int-web-hero-title">Tenho interesse em ingressar</p>
          <p className="int-web-hero-desc">
            Destinada exclusivamente a professores do Centro Universitário da Serra Gaúcha.
            O administrador verificará seu vínculo docente antes de liberar o acesso.
          </p>
        </div>

        {/* ── Cabeçalho — mobile only ── */}
        <div className="int-mobile-header">
          <p className="int-mobile-title">Tenho interesse em ingressar</p>
          <p className="int-mobile-sub">
            Esta plataforma é destinada exclusivamente a docentes do Centro Universitário da Serra Gaúcha.
          </p>
        </div>

        {/* ── Notice ── */}
        <div className="int-notice">
          <span className="int-notice-ico"><InfoIcon /></span>
          <span className="int-notice-txt">
            Após o envio, o administrador verificará seu vínculo docente com a FSG e
            entrará em contato pelo e-mail institucional informado.
          </span>
        </div>

        {/* ── Formulário ── */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Mobile: coluna única */}
          <div className="int-mobile-fields">
            {fieldNome}
            {fieldEmail}
            {fieldDep}
            {fieldMatricula}
          </div>

          {/* Desktop: grid 2 colunas */}
          <div className="int-web-grid">
            {fieldNome}
            {fieldMatricula}
            {fieldEmail}
            {fieldDep}
          </div>

          {fieldMsg}
          {checkboxAutoriza}

          {apiError && <div className="int-error-banner">{apiError}</div>}

          <button type="submit" disabled={loading} className="int-btn-p">
            {loading ? <Spinner /> : 'Enviar solicitação'}
          </button>

          <p className="int-hint">Você será notificado por e-mail após a análise do administrador</p>
        </form>

      </div>
    </div>
  )
}

/* ── Campos internos ── */

function TextField({ value, onChange, placeholder, type = 'text', icon, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <>
      <div className={`int-inp-f ${focused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
        <input
          className="int-inp-native"
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {icon && <span className="int-inp-ico">{icon}</span>}
      </div>
      {error && <span className="int-inp-err">{error}</span>}
    </>
  )
}

function TextareaField({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      className={`int-textarea ${focused ? 'focused' : ''}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

/* ── Ícones ── */
function ArrowLeftIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
}
function InfoIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
}
function MailIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
}
function AlertIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
function CheckCircleIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
function Spinner() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin .8s linear infinite' }}><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
}
