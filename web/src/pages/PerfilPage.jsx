import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { perfilService } from '../services/api'
import { Input } from '../components/ui/Input'
import { getIniciais } from '../utils/usuario'
import clsx from 'clsx'

const SV = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function formatarDataCriacao(dataStr) {
  if (!dataStr) return ''
  return new Date(dataStr).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export default function PerfilPage() {
  const { user, isAdmin } = useAuth()

  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Campos do formulário de perfil
  const [nome, setNome]             = useState('')
  const [email, setEmail]           = useState('')
  const [departamento, setDept]     = useState('')

  // Estado de salvamento do perfil
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [errosPerfil, setErrosPerfil]       = useState({})
  const [successPerfil, setSuccessPerfil]   = useState(false)

  // Campos de senha
  const [senhaAtual, setSenhaAtual]       = useState('')
  const [novaSenha, setNovaSenha]         = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  // Estado de salvamento de senha
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [errosSenha, setErrosSenha]       = useState({})
  const [successSenha, setSuccessSenha]   = useState(false)

  useEffect(() => {
    perfilService.obter()
      .then(({ data }) => {
        setPerfil(data)
        setNome(data.nomeCompleto ?? '')
        setEmail(data.emailInstitucional ?? '')
        setDept(data.departamento ?? '')
      })
      .catch(() => {/* falha silenciosa */})
      .finally(() => setCarregando(false))
  }, [])

  /* ── Salvar perfil ── */
  const handleSalvarPerfil = async (e) => {
    e.preventDefault()
    const erros = {}
    if (!nome.trim()) erros.nome = 'Nome é obrigatório'
    if (!email.trim()) erros.email = 'E-mail é obrigatório'
    if (Object.keys(erros).length) { setErrosPerfil(erros); return }

    setSalvandoPerfil(true)
    setErrosPerfil({})
    setSuccessPerfil(false)
    try {
      await perfilService.atualizar({
        nomeCompleto: nome.trim(),
        emailInstitucional: email.trim(),
        departamento: departamento.trim() || null,
      })
      setSuccessPerfil(true)
      setTimeout(() => setSuccessPerfil(false), 3000)
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data ?? 'Erro ao salvar perfil.'
      setErrosPerfil({ geral: typeof msg === 'string' ? msg : 'Erro ao salvar perfil.' })
    } finally {
      setSalvandoPerfil(false)
    }
  }

  /* ── Alterar senha ── */
  const handleAlterarSenha = async (e) => {
    e.preventDefault()
    const erros = {}
    if (!senhaAtual) erros.senhaAtual = 'Informe a senha atual'
    if (!novaSenha)  erros.novaSenha  = 'Informe a nova senha'
    else if (novaSenha.length < 6) erros.novaSenha = 'Mínimo de 6 caracteres'
    if (novaSenha !== confirmarSenha) erros.confirmarSenha = 'As senhas não coincidem'
    if (Object.keys(erros).length) { setErrosSenha(erros); return }

    setSalvandoSenha(true)
    setErrosSenha({})
    setSuccessSenha(false)
    try {
      await perfilService.alterarSenha({
        senhaAtual,
        novaSenha,
        confirmarNovaSenha: confirmarSenha,
      })
      setSuccessSenha(true)
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setTimeout(() => setSuccessSenha(false), 3000)
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data ?? 'Erro ao alterar senha.'
      setErrosSenha({ geral: typeof msg === 'string' ? msg : 'Senha atual incorreta.' })
    } finally {
      setSalvandoSenha(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-full py-16 text-[11px] text-t3">
        Carregando...
      </div>
    )
  }

  const iniciais = getIniciais(perfil ?? user)
  const membro   = formatarDataCriacao(perfil?.dataCriacao)

  return (
    <>
      {/* ══ MOBILE ══ */}
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden">
        <header className="flex-shrink-0 px-[15px] pt-[13px] pb-[10px] border-b border-bdr2 bg-bg">
          <p className="text-[16px] font-extrabold text-t1">Meu Perfil</p>
        </header>

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide px-[15px] pb-8">
          {/* Avatar card */}
          <div className="flex items-center gap-4 py-[18px]">
            <div className="w-14 h-14 rounded-[16px] bg-blue-grad flex items-center justify-center text-[20px] font-bold text-white flex-shrink-0 font-sans select-none">
              {iniciais}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-extrabold text-t1 truncate">{perfil?.nomeCompleto ?? '—'}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <RoleBadge admin={isAdmin} />
                {perfil?.matricula && (
                  <span className="text-[10px] text-t3 font-medium">{perfil.matricula}</span>
                )}
              </div>
              {membro && <p className="text-[9px] text-t3 mt-1">Membro desde {membro}</p>}
            </div>
          </div>

          {/* Informações readonly */}
          <InfoCard perfil={perfil} />

          {/* Editar perfil */}
          <section className="mb-5">
            <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-[10px]">
              Editar dados
            </p>
            <div className="bg-s1 border border-bdr rounded-[13px] p-[14px]">
              <form onSubmit={handleSalvarPerfil} noValidate>
                <Input
                  label="Nome completo"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  error={errosPerfil.nome}
                  autoComplete="name"
                />
                <Input
                  label="E-mail institucional"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={errosPerfil.email}
                  autoComplete="email"
                />
                <Input
                  label="Departamento"
                  value={departamento}
                  onChange={e => setDept(e.target.value)}
                  placeholder="Ex: Computação"
                />
                {errosPerfil.geral && (
                  <p className="text-[11px] text-red mb-2">{errosPerfil.geral}</p>
                )}
                <BtnSalvar loading={salvandoPerfil} success={successPerfil} />
              </form>
            </div>
          </section>

          {/* Alterar senha */}
          <section className="mb-5">
            <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-[10px]">
              Alterar senha
            </p>
            <div className="bg-s1 border border-bdr rounded-[13px] p-[14px]">
              <form onSubmit={handleAlterarSenha} noValidate>
                <Input
                  label="Senha atual"
                  type="password"
                  value={senhaAtual}
                  onChange={e => setSenhaAtual(e.target.value)}
                  error={errosSenha.senhaAtual}
                  autoComplete="current-password"
                />
                <Input
                  label="Nova senha"
                  type="password"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  error={errosSenha.novaSenha}
                  autoComplete="new-password"
                />
                <Input
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  error={errosSenha.confirmarSenha}
                  autoComplete="new-password"
                />
                {errosSenha.geral && (
                  <p className="text-[11px] text-red mb-2">{errosSenha.geral}</p>
                )}
                <BtnSalvar loading={salvandoSenha} success={successSenha} label="Alterar senha" />
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* ══ DESKTOP ══ */}
      <div className="hidden md:flex md:flex-col py-5 px-[22px] md:h-screen md:overflow-y-auto md:scrollbar-thin">
        {/* Topbar */}
        <div className="mb-[22px] flex-shrink-0">
          <p className="text-[19px] font-black text-t1">Meu Perfil</p>
        </div>

        <div className="flex gap-5 items-start max-w-[900px]">
          {/* Coluna esquerda — avatar + info */}
          <div className="w-[240px] flex-shrink-0 flex flex-col gap-4">
            {/* Avatar card */}
            <div className="bg-s1 border border-bdr rounded-[14px] p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-[72px] h-[72px] rounded-[20px] bg-blue-grad flex items-center justify-center text-[26px] font-bold text-white font-sans select-none">
                {iniciais}
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-t1 leading-snug">{perfil?.nomeCompleto ?? '—'}</p>
                <div className="flex items-center justify-center gap-2 mt-[6px] flex-wrap">
                  <RoleBadge admin={isAdmin} />
                </div>
                {perfil?.matricula && (
                  <p className="text-[10px] text-t3 mt-[5px] font-medium">{perfil.matricula}</p>
                )}
                {membro && (
                  <p className="text-[9px] text-t3 mt-[4px]">Membro desde {membro}</p>
                )}
              </div>
            </div>

            {/* Informações readonly */}
            <InfoCardDesktop perfil={perfil} />
          </div>

          {/* Coluna direita — formulários */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Editar perfil */}
            <div className="bg-s1 border border-bdr rounded-[14px] p-5">
              <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-4">
                Editar dados
              </p>
              <form onSubmit={handleSalvarPerfil} noValidate>
                <div className="grid grid-cols-2 gap-x-3">
                  <div className="col-span-2">
                    <Input
                      label="Nome completo"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      error={errosPerfil.nome}
                      autoComplete="name"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label="E-mail institucional"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      error={errosPerfil.email}
                      autoComplete="email"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label="Departamento"
                      value={departamento}
                      onChange={e => setDept(e.target.value)}
                      placeholder="Ex: Computação"
                    />
                  </div>
                </div>
                {errosPerfil.geral && (
                  <p className="text-[11px] text-red mb-3">{errosPerfil.geral}</p>
                )}
                <div className="flex justify-end">
                  <BtnSalvar loading={salvandoPerfil} success={successPerfil} />
                </div>
              </form>
            </div>

            {/* Alterar senha */}
            <div className="bg-s1 border border-bdr rounded-[14px] p-5">
              <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-4">
                Alterar senha
              </p>
              <form onSubmit={handleAlterarSenha} noValidate>
                <Input
                  label="Senha atual"
                  type="password"
                  value={senhaAtual}
                  onChange={e => setSenhaAtual(e.target.value)}
                  error={errosSenha.senhaAtual}
                  autoComplete="current-password"
                />
                <div className="grid grid-cols-2 gap-x-3">
                  <Input
                    label="Nova senha"
                    type="password"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    error={errosSenha.novaSenha}
                    autoComplete="new-password"
                  />
                  <Input
                    label="Confirmar nova senha"
                    type="password"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    error={errosSenha.confirmarSenha}
                    autoComplete="new-password"
                  />
                </div>
                {errosSenha.geral && (
                  <p className="text-[11px] text-red mb-3">{errosSenha.geral}</p>
                )}
                <div className="flex justify-end">
                  <BtnSalvar loading={salvandoSenha} success={successSenha} label="Alterar senha" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Informações somente-leitura (mobile) ── */
function InfoCard({ perfil }) {
  if (!perfil) return null
  return (
    <div className="bg-s1 border border-bdr rounded-[13px] p-[14px] mb-5">
      <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-[10px]">
        Informações
      </p>
      <div className="flex flex-col gap-[10px]">
        <InfoRow icon={<MailIcon />}       label="E-mail"      value={perfil.emailInstitucional} />
        <InfoRow icon={<HashIcon />}       label="Matrícula"   value={perfil.matricula ?? '—'} />
        <InfoRow icon={<BuildingIcon />}   label="Departamento" value={perfil.departamento ?? '—'} />
      </div>
    </div>
  )
}

/* ── Informações somente-leitura (desktop) ── */
function InfoCardDesktop({ perfil }) {
  if (!perfil) return null
  return (
    <div className="bg-s1 border border-bdr rounded-[14px] p-4 flex flex-col gap-[10px]">
      <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px]">Informações</p>
      <InfoRow icon={<MailIcon />}     label="E-mail"       value={perfil.emailInstitucional} />
      <InfoRow icon={<HashIcon />}     label="Matrícula"    value={perfil.matricula ?? '—'} />
      <InfoRow icon={<BuildingIcon />} label="Departamento" value={perfil.departamento ?? '—'} />
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-[8px]">
      <span className="text-t3 flex-shrink-0 mt-[1px]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-t3 uppercase tracking-[1px]">{label}</p>
        <p className="text-[11px] text-t1 font-medium break-all">{value || '—'}</p>
      </div>
    </div>
  )
}

/* ── Badge de role ── */
function RoleBadge({ admin }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-[2px] rounded-[20px] text-[8px] font-bold tracking-[0.3px] uppercase',
      admin
        ? 'bg-[var(--blue-sub)] text-blue-l border border-[var(--blue-bdr)]'
        : 'bg-green/[0.1] text-green'
    )}>
      {admin ? 'Admin' : 'Docente'}
    </span>
  )
}

/* ── Botão salvar com estados ── */
function BtnSalvar({ loading, success, label = 'Salvar alterações' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={clsx(
        'flex items-center gap-[6px] rounded-[10px] px-4 py-[8px] text-[11px] font-bold font-sans cursor-pointer border-none transition-all duration-[250ms] disabled:opacity-60 disabled:cursor-not-allowed',
        success
          ? 'bg-green/[0.15] text-green'
          : 'bg-blue-grad text-white shadow-blue-glow hover:brightness-110'
      )}
    >
      {loading ? (
        <><SpinIcon />Salvando...</>
      ) : success ? (
        <><CheckIcon />Salvo!</>
      ) : (
        label
      )}
    </button>
  )
}

/* ── Ícones ── */
function MailIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" {...SV}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> }
function HashIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" {...SV}><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg> }
function BuildingIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" {...SV}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01"/></svg> }
function SpinIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" {...SV} className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> }
function CheckIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" {...SV}><path d="M20 6 9 17l-5-5"/></svg> }
