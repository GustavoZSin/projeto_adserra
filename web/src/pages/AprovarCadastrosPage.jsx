import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAprovacoesPendentes } from '../contexts/AprovacoesPendentesContext'
import { getIniciais } from '../utils/usuario'
import './AprovarCadastrosPage.css'

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

export default function AprovarCadastrosPage() {
  const { user }   = useAuth()
  const { setPendentes } = useAprovacoesPendentes()
  const initials   = getIniciais(user)
  const [filtro, setFiltro]               = useState('Todos')
  const [solicitacoes, setSolicitacoes]   = useState(MOCK_SOLICITACOES)
  const [processando, setProcessando]     = useState(null)
  const [confirmando, setConfirmando]     = useState(null) // { id, acao }

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
      <div className="ac-mobile">
        <div className="ac-topbar">
          <div>
            <span className="ac-topbar-title">Aprovação de Cadastros</span>
            {contagem.pendentes > 0 && (
              <span className="ac-topbar-badge">{contagem.pendentes}</span>
            )}
          </div>
          <div className="ac-avatar">{initials}</div>
        </div>

        <div className="ac-scroll">
          {/* Stats */}
          <div className="ac-stats-row">
            <StatCard cor="amber" icon={<ClockIcon />} n={contagem.pendentes} label="Pendentes" />
            <StatCard cor="green" icon={<CheckCircleIcon />} n={contagem.aprovados} label="Aprovados" />
            <StatCard cor="red"   icon={<XCircleIcon />}     n={contagem.recusados} label="Recusados" />
          </div>

          {/* Filtros */}
          <div className="ac-filters">
            {FILTROS.map(f => (
              <button key={f}
                className={`ac-filter-pill${filtro === f ? ' ac-filter-pill--on' : ''}`}
                onClick={() => setFiltro(f)}>{f}
              </button>
            ))}
          </div>

          {/* Cards */}
          {visiveis.length === 0 && <p className="ac-empty">Nenhuma solicitação encontrada.</p>}
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
      <div className="ac-desktop">
        <div className="ac-web-tb">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p className="ac-web-title">Aprovação de Cadastros</p>
              {contagem.pendentes > 0 && (
                <span className="ac-web-badge">{contagem.pendentes} pendentes</span>
              )}
            </div>
            <p className="ac-web-sub">Solicitações de ingresso pendentes de análise</p>
          </div>
        </div>

        {/* Stats */}
        <div className="ac-web-stats">
          <WebStatCard cor="amber" icon={<ClockIcon />}       n={contagem.pendentes} label="Pendentes" />
          <WebStatCard cor="green" icon={<CheckCircleIcon />} n={contagem.aprovados} label="Aprovados" />
          <WebStatCard cor="red"   icon={<XCircleIcon />}     n={contagem.recusados} label="Recusados" />
        </div>

        {/* Filtros */}
        <div className="ac-filters" style={{ marginBottom: 14 }}>
          {FILTROS.map(f => (
            <button key={f}
              className={`ac-filter-pill${filtro === f ? ' ac-filter-pill--on' : ''}`}
              onClick={() => setFiltro(f)}>{f}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="ac-list">
          {visiveis.length === 0 && <p className="ac-empty">Nenhuma solicitação encontrada.</p>}
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

/* ── Card de solicitação ── */
function CardSolicitacao({ s, processando, onAprovar, onRecusar }) {
  const borderColor  = s.status === 'pendente' ? 'var(--amber)' : s.status === 'aprovado' ? 'var(--green)' : 'var(--red)'
  const opacity      = s.status === 'pendente' ? 1 : 0.75
  const iniciais     = getInicaisSolicitacao(s.nome)
  const dataLabel    = s.status === 'aprovado' ? 'Aprovado em' : s.status === 'recusado' ? 'Recusado em' : 'Solicitado em'
  const dataColor    = s.status === 'aprovado' ? 'var(--green)' : s.status === 'recusado' ? 'var(--red)' : 'var(--t1)'

  return (
    <div className="ac-card" style={{ opacity }}>
      <div className="ac-card-border" style={{ background: borderColor }} />
      <div className="ac-card-body">

        {/* Cabeçalho */}
        <div className="ac-card-head">
          <div className="ac-card-id">
            <div className="ac-avatar-sm" style={{ background: s.avatarGrad }}>
              {iniciais}
            </div>
            <div>
              <p className="ac-card-name">{s.nome}</p>
              <p className="ac-card-email">{s.email}</p>
            </div>
          </div>
          <StatusBadge status={s.status} />
        </div>

        {/* Info grid */}
        <div className="ac-card-grid">
          <InfoCell label="Matrícula"   value={s.matricula}     />
          <InfoCell label="Departamento" value={s.departamento} />
          <InfoCell label={dataLabel}   value={s.data}  valueColor={dataColor} />
        </div>

        {/* Mensagem */}
        {s.status === 'pendente' && (
          <div className="ac-card-msg">
            <p className="ac-msg-label">Mensagem do professor</p>
            <p className="ac-msg-text">{s.mensagem || '—'}</p>
          </div>
        )}

        {/* Ações */}
        {s.status === 'pendente' && (
          <div className="ac-card-actions">
            <button className="ac-btn ac-btn--green" onClick={onAprovar} disabled={processando}>
              {processando ? <SpinnerIcon /> : <CheckCircleIcon />} Aprovar
            </button>
            <button className="ac-btn ac-btn--red-outline" onClick={onRecusar} disabled={processando}>
              <XCircleIcon /> Recusar
            </button>
            <button className="ac-btn ac-btn--ghost">
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
    <div className="ac-stat">
      <div className={`ac-stat-ico ac-stat-ico--${cor}`}>{icon}</div>
      <div>
        <p className="ac-stat-n">{n}</p>
        <p className="ac-stat-l">{label}</p>
      </div>
    </div>
  )
}

function WebStatCard({ cor, icon, n, label }) {
  return (
    <div className="ac-web-stat">
      <div className={`ac-stat-ico ac-stat-ico--${cor}`}>{icon}</div>
      <div>
        <p className="ac-stat-n">{n}</p>
        <p className="ac-stat-l">{label}</p>
      </div>
    </div>
  )
}

function InfoCell({ label, value, valueColor }) {
  return (
    <div className="ac-info-cell">
      <p className="ac-info-label">{label}</p>
      <p className="ac-info-value" style={valueColor ? { color: valueColor } : {}}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pendente: { cls: 'ac-badge--amber', text: 'PENDENTE' },
    aprovado: { cls: 'ac-badge--green', text: 'APROVADO' },
    recusado: { cls: 'ac-badge--red',   text: 'RECUSADO' },
  }
  const { cls, text } = map[status] || map.pendente
  return <span className={`ac-badge ${cls}`}>{text}</span>
}

function ConfirmModal({ nome, acao, onCancel, onConfirm }) {
  const aprovando = acao === 'aprovar'
  return (
    <div className="ac-modal-overlay" onClick={onCancel}>
      <div className="ac-modal" onClick={e => e.stopPropagation()}>
        <div className={`ac-modal-ico ac-modal-ico--${aprovando ? 'green' : 'red'}`}>
          {aprovando ? <CheckCircleIcon size={26} /> : <XCircleIcon size={26} />}
        </div>
        <p className="ac-modal-title">{aprovando ? 'Aprovar solicitação?' : 'Recusar solicitação?'}</p>
        <p className="ac-modal-sub">
          {aprovando
            ? `O docente ${nome} receberá acesso ao portal e um e-mail de confirmação.`
            : `A solicitação de ${nome} será recusada e o docente será notificado.`}
        </p>
        <div className="ac-modal-btns">
          <button className="ac-btn ac-btn--ghost ac-btn--full" onClick={onCancel}>Cancelar</button>
          <button
            className={`ac-btn ac-btn--full ${aprovando ? 'ac-btn--green' : 'ac-btn--red'}`}
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
function SpinnerIcon()                  { return <svg width="13" height="13" viewBox="0 0 24 24" {...IC} strokeWidth="2" style={{ animation: 'ac-spin .7s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
