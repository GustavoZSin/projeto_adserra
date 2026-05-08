import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAprovacoesPendentes } from '../contexts/AprovacoesPendentesContext'
import { getIniciais } from '../utils/usuario'
import clsx from 'clsx'

// TODO: substituir por chamada à API — solicitacaoIngressoService.listar()
const MOCK_SOLICITACOES = [
  {
    id: 1, nome: 'Lucas Silveira',      email: 'lucas.silveira@fsg.edu.br',
    matricula: '987654321', departamento: 'Engenharia',    data: '22 Abr 2026',
    status: 'pendente',
    mensagem: 'Sou docente do curso de Engenharia Civil há 3 anos e gostaria de participar ativamente das ações da associação.',
    avatarGrad: 'linear-gradient(135deg,var(--blue-d),var(--blue-l))',
  },
  {
    id: 2, nome: 'Ana Paula Rodrigues', email: 'ana.rodrigues@fsg.edu.br',
    matricula: '112233445', departamento: 'Direito',       data: '21 Abr 2026',
    status: 'pendente',
    mensagem: 'Leciono no curso de Direito e tenho interesse em acompanhar e contribuir com as atividades da ADSerra.',
    avatarGrad: 'linear-gradient(135deg,#059669,#10B981)',
  },
  {
    id: 3, nome: 'Roberto Menezes',     email: 'roberto.menezes@fsg.edu.br',
    matricula: '556677889', departamento: 'Administração', data: '20 Abr 2026',
    status: 'pendente',
    mensagem: '',
    avatarGrad: 'linear-gradient(135deg,#D97706,#F59E0B)',
  },
  {
    id: 4, nome: 'Davi Chidem',         email: 'davi.chidem@fsg.edu.br',
    matricula: '334455667', departamento: 'Medicina',      data: '10 Abr 2026',
    status: 'aprovado',
    mensagem: '',
    avatarGrad: 'linear-gradient(135deg,var(--blue-d),var(--blue-l))',
  },
  {
    id: 5, nome: 'Carlos Ferreira',     email: 'carlos.ferreira@fsg.edu.br',
    matricula: '998877665', departamento: 'Psicologia',    data: '08 Abr 2026',
    status: 'recusado',
    mensagem: '',
    avatarGrad: 'linear-gradient(135deg,var(--s3),var(--s2))',
  },
]

const FILTROS = ['Todos', 'Pendentes', 'Aprovados', 'Recusados']

function getInicaisSolicitacao(nome) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

const filterPill = 'flex-shrink-0 px-3 py-[5px] rounded-[20px] text-[10px] font-semibold cursor-pointer font-sans border transition-all duration-[250ms]'
const btnBase    = 'inline-flex items-center gap-[5px] px-[13px] py-[7px] rounded-[9px] text-[11px] font-bold font-sans cursor-pointer transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'

export default function AprovarCadastrosPage() {
  const { user }   = useAuth()
  const { setPendentes } = useAprovacoesPendentes()
  const initials   = getIniciais(user)
  const [filtro, setFiltro]               = useState('Todos')
  const [solicitacoes, setSolicitacoes]   = useState(MOCK_SOLICITACOES)
  const [processando, setProcessando]     = useState(null)
  const [confirmando, setConfirmando]     = useState(null)

  const contagem = useMemo(() => ({
    pendentes: solicitacoes.filter(s => s.status === 'pendente').length,
    aprovados: solicitacoes.filter(s => s.status === 'aprovado').length,
    recusados: solicitacoes.filter(s => s.status === 'recusado').length,
  }), [solicitacoes])

  useEffect(() => {
    setPendentes(contagem.pendentes)
  }, [contagem.pendentes, setPendentes])

  const visiveis = useMemo(() => {
    if (filtro === 'Pendentes') return solicitacoes.filter(s => s.status === 'pendente')
    if (filtro === 'Aprovados') return solicitacoes.filter(s => s.status === 'aprovado')
    if (filtro === 'Recusados') return solicitacoes.filter(s => s.status === 'recusado')
    return solicitacoes
  }, [solicitacoes, filtro])

  const handleAcao = async (id, acao) => {
    setConfirmando(null)
    setProcessando(id)
    try {
      // TODO: await solicitacaoService.aprovar(id) / .reprovar(id)
      await new Promise(r => setTimeout(r, 700))
      setSolicitacoes(prev =>
        prev.map(s => s.id === id ? { ...s, status: acao === 'aprovar' ? 'aprovado' : 'recusado' } : s)
      )
    } catch {
      // TODO: exibir feedback de erro
    } finally {
      setProcessando(null)
    }
  }

  const itemConfirmando = solicitacoes.find(s => s.id === confirmando?.id)

  return (
    <>
      {confirmando && (
        <ConfirmModal
          nome={itemConfirmando?.nome}
          acao={confirmando.acao}
          onCancel={() => setConfirmando(null)}
          onConfirm={() => handleAcao(confirmando.id, confirmando.acao)}
        />
      )}

      {/* ══════════ MOBILE ══════════ */}
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden">
        <div className="px-[15px] py-[11px] flex items-center justify-between flex-shrink-0 border-b border-bdr2 bg-bg">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-t1">Aprovação de Cadastros</span>
            {contagem.pendentes > 0 && (
              <span className="bg-amber text-white rounded-[10px] px-[7px] py-px text-[9px] font-bold leading-[1.4]">{contagem.pendentes}</span>
            )}
          </div>
          <div className="w-[30px] h-[30px] bg-blue-grad rounded-[9px] flex items-center justify-center text-[11px] font-bold text-white tracking-[0.5px] font-sans select-none flex-shrink-0">
            {initials}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-[13px] py-[11px] pb-5 scrollbar-hide">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-[7px] mb-3">
            <StatCard cor="amber" icon={<ClockIcon />}       n={contagem.pendentes} label="Pendentes" />
            <StatCard cor="green" icon={<CheckCircleIcon />} n={contagem.aprovados} label="Aprovados" />
            <StatCard cor="red"   icon={<XCircleIcon />}     n={contagem.recusados} label="Recusados" />
          </div>

          {/* Filtros */}
          <Filters filtro={filtro} setFiltro={setFiltro} className="mb-3" />

          {/* Cards */}
          {visiveis.length === 0 && <p className="text-[11px] text-t3 text-center py-8">Nenhuma solicitação encontrada.</p>}
          {visiveis.map(s => (
            <CardSolicitacao
              key={s.id}
              s={s}
              processando={processando === s.id}
              onAprovar={() => setConfirmando({ id: s.id, acao: 'aprovar' })}
              onRecusar={() => setConfirmando({ id: s.id, acao: 'recusar' })}
            />
          ))}
        </div>
      </div>

      {/* ══════════ DESKTOP ══════════ */}
      <div className="hidden md:block py-5 px-[22px]">
        <div className="flex items-start justify-between mb-[18px]">
          <div>
            <div className="flex items-center gap-[10px]">
              <p className="text-[19px] font-black text-t1">Aprovação de Cadastros</p>
              {contagem.pendentes > 0 && (
                <span className="inline-flex items-center px-[10px] py-[3px] rounded-[20px] text-[9px] font-bold bg-amber/[0.12] text-amber border border-amber/25">
                  {contagem.pendentes} pendentes
                </span>
              )}
            </div>
            <p className="text-[11px] text-t3 mt-[3px]">Solicitações de ingresso pendentes de análise</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-[10px] mb-[18px]">
          <WebStatCard cor="amber" icon={<ClockIcon size={16} />}       n={contagem.pendentes} label="Pendentes" />
          <WebStatCard cor="green" icon={<CheckCircleIcon size={16} />} n={contagem.aprovados} label="Aprovados" />
          <WebStatCard cor="red"   icon={<XCircleIcon size={16} />}     n={contagem.recusados} label="Recusados" />
        </div>

        {/* Filtros */}
        <Filters filtro={filtro} setFiltro={setFiltro} className="mb-[14px]" />

        {/* Lista */}
        <div className="flex flex-col gap-2">
          {visiveis.length === 0 && <p className="text-[11px] text-t3 text-center py-8">Nenhuma solicitação encontrada.</p>}
          {visiveis.map(s => (
            <CardSolicitacao
              key={s.id}
              s={s}
              processando={processando === s.id}
              onAprovar={() => setConfirmando({ id: s.id, acao: 'aprovar' })}
              onRecusar={() => setConfirmando({ id: s.id, acao: 'recusar' })}
            />
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Shared ── */

function Filters({ filtro, setFiltro, className }) {
  return (
    <div className={clsx('flex gap-[6px] overflow-x-auto scrollbar-hide pb-0.5', className)}>
      {FILTROS.map(f => (
        <button key={f}
          className={clsx(filterPill, filtro === f
            ? 'bg-blue-grad text-white border-transparent shadow-[0_3px_9px_var(--blue-glow)]'
            : 'border-bdr bg-s2 text-t3'
          )}
          onClick={() => setFiltro(f)}>{f}
        </button>
      ))}
    </div>
  )
}

/* ── Card de solicitação ── */
function CardSolicitacao({ s, processando, onAprovar, onRecusar }) {
  const borderColor = s.status === 'pendente' ? 'var(--amber)' : s.status === 'aprovado' ? 'var(--green)' : 'var(--red)'
  const iniciais    = getInicaisSolicitacao(s.nome)
  const dataLabel   = s.status === 'aprovado' ? 'Aprovado em' : s.status === 'recusado' ? 'Recusado em' : 'Solicitado em'
  const dataColor   = s.status === 'aprovado' ? 'var(--green)' : s.status === 'recusado' ? 'var(--red)' : undefined

  return (
    <div className="bg-s1 border border-bdr rounded-[13px] overflow-hidden mb-[9px] flex"
         style={{ opacity: s.status === 'pendente' ? 1 : 0.75 }}>
      <div className="w-1 flex-shrink-0" style={{ background: borderColor }} />
      <div className="flex-1 px-3 py-3 pl-[10px] min-w-0">

        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-2 mb-[10px]">
          <div className="flex items-center gap-[9px] min-w-0">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 font-sans"
                 style={{ background: s.avatarGrad }}>
              {iniciais}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="text-[12px] font-bold text-t1">{s.nome}</p>
              <p className="text-[9px] text-t3 whitespace-nowrap overflow-hidden text-ellipsis">{s.email}</p>
            </div>
          </div>
          <StatusBadge status={s.status} />
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-2 mb-[10px]">
          <InfoCell label="Matrícula"    value={s.matricula} />
          <InfoCell label="Departamento" value={s.departamento} />
          <InfoCell label={dataLabel}    value={s.data} valueColor={dataColor} />
        </div>

        {/* Mensagem */}
        {s.status === 'pendente' && (
          <div className="bg-s2 border border-bdr rounded-[8px] px-[10px] py-2 mb-[10px]">
            <p className="text-[8px] font-bold uppercase tracking-[0.5px] text-t3 mb-[3px]">Mensagem do professor</p>
            <p className="text-[10px] text-t2 leading-[1.5]">{s.mensagem || '—'}</p>
          </div>
        )}

        {/* Ações */}
        {s.status === 'pendente' && (
          <div className="flex flex-wrap gap-[6px]">
            <button className={clsx(btnBase, 'bg-green-grad text-white shadow-green-btn border-none hover:opacity-90')}
                    onClick={onAprovar} disabled={processando}>
              {processando ? <SpinnerIcon /> : <CheckCircleIcon />} Aprovar
            </button>
            <button className={clsx(btnBase, 'bg-red/[0.08] border border-red/30 text-red hover:bg-red/[0.14]')}
                    onClick={onRecusar} disabled={processando}>
              <XCircleIcon /> Recusar
            </button>
            <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')}>
              <MailIcon /> Contatar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sub-componentes ── */

function StatCard({ cor, icon, n, label }) {
  return (
    <div className="bg-s1 border border-bdr rounded-[11px] p-[10px] flex items-center gap-2">
      <div className={clsx(
        'w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0',
        cor === 'amber' && 'bg-amber/[0.12] text-amber',
        cor === 'green' && 'bg-green/[0.12] text-green',
        cor === 'red'   && 'bg-red/[0.10] text-red',
      )}>{icon}</div>
      <div>
        <p className="text-[17px] font-extrabold text-t1 leading-[1.1]">{n}</p>
        <p className="text-[9px] text-t3 font-medium">{label}</p>
      </div>
    </div>
  )
}

function WebStatCard({ cor, icon, n, label }) {
  return (
    <div className="bg-s1 border border-bdr rounded-[13px] px-4 py-[14px] flex items-center gap-3">
      <div className={clsx(
        'w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0',
        cor === 'amber' && 'bg-amber/[0.12] text-amber',
        cor === 'green' && 'bg-green/[0.12] text-green',
        cor === 'red'   && 'bg-red/[0.10] text-red',
      )}>{icon}</div>
      <div>
        <p className="text-[22px] font-extrabold text-t1 leading-[1.1]">{n}</p>
        <p className="text-[10px] text-t3 font-medium">{label}</p>
      </div>
    </div>
  )
}

function InfoCell({ label, value, valueColor }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[8px] font-semibold uppercase tracking-[0.5px] text-t3">{label}</p>
      <p className="text-[11px] font-semibold text-t1" style={valueColor ? { color: valueColor } : {}}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-[9px] py-[3px] rounded-[20px] text-[8px] font-bold tracking-[0.5px] whitespace-nowrap flex-shrink-0 border',
      status === 'pendente' && 'bg-amber/[0.12] text-amber border-amber/25',
      status === 'aprovado' && 'bg-green/[0.12] text-green border-green/25',
      status === 'recusado' && 'bg-red/[0.10] text-red border-red/20',
    )}>
      {status === 'pendente' ? 'PENDENTE' : status === 'aprovado' ? 'APROVADO' : 'RECUSADO'}
    </span>
  )
}

function ConfirmModal({ nome, acao, onCancel, onConfirm }) {
  const aprovando = acao === 'aprovar'
  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur z-[200] flex items-center justify-center p-5" onClick={onCancel}>
      <div className="bg-s1 border border-bdr rounded-[18px] px-6 py-7 max-w-[340px] w-full flex flex-col items-center text-center shadow-sh" onClick={e => e.stopPropagation()}>
        <div className={clsx(
          'w-14 h-14 rounded-[14px] flex items-center justify-center mb-4',
          aprovando ? 'bg-green/[0.12] text-green' : 'bg-red/[0.10] text-red'
        )}>
          {aprovando ? <CheckCircleIcon size={26} /> : <XCircleIcon size={26} />}
        </div>
        <p className="text-[16px] font-extrabold text-t1 mb-2">{aprovando ? 'Aprovar solicitação?' : 'Recusar solicitação?'}</p>
        <p className="text-[11px] text-t3 leading-[1.6] mb-[22px]">
          {aprovando
            ? `O docente ${nome} receberá acesso ao portal e um e-mail de confirmação.`
            : `A solicitação de ${nome} será recusada e o docente será notificado.`}
        </p>
        <div className="flex gap-2 w-full">
          <button className="flex-1 bg-s2 border border-bdr rounded-[9px] py-[9px] text-t2 text-[11px] font-bold font-sans cursor-pointer hover:bg-s3 transition-colors"
                  onClick={onCancel}>Cancelar</button>
          <button className={clsx(
            'flex-1 border-none rounded-[9px] py-[9px] text-white text-[11px] font-bold font-sans cursor-pointer hover:opacity-90 transition-opacity',
            aprovando ? 'bg-green-grad shadow-green-btn' : 'bg-red-grad shadow-red-btn'
          )}
                  onClick={onConfirm}>
            {aprovando ? 'Sim, aprovar' : 'Sim, recusar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Ícones ── */
const IC = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }
function CheckCircleIcon({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" {...IC} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
function XCircleIcon({ size = 13 })     { return <svg width={size} height={size} viewBox="0 0 24 24" {...IC} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> }
function ClockIcon({ size = 16 })       { return <svg width={size} height={size} viewBox="0 0 24 24" {...IC} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function MailIcon({ size = 13 })        { return <svg width={size} height={size} viewBox="0 0 24 24" {...IC} strokeWidth="1.8"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> }
function SpinnerIcon()                  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="animate-spin-fast"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
