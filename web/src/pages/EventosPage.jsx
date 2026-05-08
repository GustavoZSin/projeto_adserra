import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getIniciais } from '../utils/usuario'
import './EventosPage.css'

// TODO: substituir por chamada à API — eventosService.listar()
const MOCK_EVENTOS = [
  { id: 1, titulo: 'Evento 2 FSG',      tipo: 'evento',   data: '2025-04-26', local: 'Campus Sede FSG',       badge: 'Em breve', badgeColor: 'blue',  tag: 'Evento',    tagColor: 'blue'  },
  { id: 2, titulo: 'Semana Acadêmica',  tipo: 'acao',     data: '2025-04-30', local: 'Auditório Principal',   badge: 'Novo',     badgeColor: 'green', tag: 'Acadêmico', tagColor: 'green' },
  { id: 3, titulo: 'Palestra STEM',     tipo: 'palestra', data: '2025-05-05', local: 'Sala 201 — Bloco B',    badge: null,       badgeColor: null,    tag: 'Palestra',  tagColor: 'amber' },
]

const FILTROS = ['Todos', 'Próximos', 'Passados', 'Ações', 'Palestras']

function filtrarEventos(eventos, filtro) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  switch (filtro) {
    case 'Próximos':  return eventos.filter(e => new Date(e.data + 'T00:00:00') >= hoje)
    case 'Passados':  return eventos.filter(e => new Date(e.data + 'T00:00:00') <  hoje)
    case 'Ações':     return eventos.filter(e => e.tipo === 'acao')
    case 'Palestras': return eventos.filter(e => e.tipo === 'palestra')
    default:          return eventos
  }
}

function formatarDataLonga(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatarDataCurta(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function EventosPage() {
  const navigate              = useNavigate()
  const { user, isAdmin }     = useAuth()
  const [filtro, setFiltro]   = useState('Todos')
  const [eventos, setEventos] = useState(MOCK_EVENTOS)
  const [deletando, setDeletando] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const initials      = getIniciais(user)
  const visiveis      = useMemo(() => filtrarEventos(eventos, filtro), [eventos, filtro])
  const eventoMap     = useMemo(() => new Map(eventos.map(e => [e.id, e])), [eventos])
  const eventoConfirm = eventoMap.get(confirmId)

  const handleEditar = (id) => navigate(`/publicar?id=${id}`)

  const handleDeletar = async () => {
    const id = confirmId
    setConfirmId(null)
    setDeletando(id)
    try {
      // TODO: await eventosService.deletar(id)
      await new Promise(r => setTimeout(r, 600))
      setEventos(prev => prev.filter(e => e.id !== id))
    } catch {
      // TODO: exibir feedback de erro
    } finally {
      setDeletando(null)
    }
  }

  return (
    <>
      {confirmId != null && (
        <ConfirmModal
          titulo={eventoConfirm?.titulo}
          onCancel={() => setConfirmId(null)}
          onConfirm={handleDeletar}
        />
      )}

      {/* ── Mobile ── */}
      <div className="ev-mobile">
        <div className="ev-topbar">
          <span className="ev-topbar-title">Eventos</span>
          <div className="ev-tb-r">
            <button className="ev-tb-btn" aria-label="Buscar"><SearchIcon /></button>
            <div className="ev-avatar">{initials}</div>
          </div>
        </div>

        <div className="ev-scroll">
          <div className="ev-filters">
            {FILTROS.map(f => (
              <button key={f} className={`ev-filter-pill${filtro === f ? ' ev-filter-pill--on' : ''}`}
                onClick={() => setFiltro(f)}>{f}</button>
            ))}
          </div>

          {visiveis.length === 0 && <p className="ev-empty">Nenhum evento encontrado.</p>}

          {visiveis.map(ev => (
            <div key={ev.id} className="ev-card">
              <div className="ev-card-img">
                <EventIcon tipo={ev.tipo} />
                {ev.badge && <span className={`ev-badge ev-badge--${ev.badgeColor}`}>{ev.badge}</span>}
              </div>
              <div className="ev-card-body">
                <div className="ev-card-top">
                  <p className="ev-card-title">{ev.titulo}</p>
                  <span className={`ev-tag ev-tag--${ev.tagColor}`}>{ev.tag}</span>
                </div>
                <p className="ev-card-meta"><CalendarIcon s={12} />{formatarDataLonga(ev.data)}</p>
                <p className="ev-card-meta"><MapPinIcon s={12} />{ev.local}</p>
                <div className="ev-card-actions">
                  <button className="ev-btn-sm ev-btn-sm--p"><EyeIcon s={12} />Detalhes</button>
                  <button className="ev-btn-sm ev-btn-sm--g"><ImageIcon s={12} />Galeria</button>
                  {isAdmin && <>
                    <button className="ev-btn-sm ev-btn-sm--g" onClick={() => handleEditar(ev.id)}>
                      <EditIcon s={12} />Editar
                    </button>
                    <button className="ev-btn-sm ev-btn-sm--danger"
                      onClick={() => setConfirmId(ev.id)}
                      disabled={deletando === ev.id}>
                      <TrashIcon s={12} />Excluir
                    </button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <button className="ev-fab" onClick={() => navigate('/publicar')} aria-label="Novo evento">
            <PlusIcon s={18} />
          </button>
        )}
      </div>

      {/* ── Desktop ── */}
      <div className="ev-desktop">
        <div className="ev-web-tb">
          <p className="ev-web-title">Eventos</p>
          <div className="ev-web-tb-r">
            <div className="ev-web-search"><SearchIcon s={13} /><span>Buscar eventos...</span></div>
            {isAdmin && (
              <button className="ev-btn-sm ev-btn-sm--p" onClick={() => navigate('/publicar')}>
                <PlusIcon s={13} />Novo evento
              </button>
            )}
          </div>
        </div>

        <div className="ev-filters" style={{ marginBottom: 16 }}>
          {FILTROS.map(f => (
            <button key={f} className={`ev-filter-pill${filtro === f ? ' ev-filter-pill--on' : ''}`}
              onClick={() => setFiltro(f)}>{f}</button>
          ))}
        </div>

        {visiveis.length === 0 && <p className="ev-empty">Nenhum evento encontrado.</p>}

        <div className="ev-web-grid">
          {visiveis.map(ev => (
            <div key={ev.id} className="ev-web-card">
              <div className="ev-web-card-img">
                <EventIcon tipo={ev.tipo} s={24} />
                {ev.badge && <span className={`ev-badge ev-badge--${ev.badgeColor}`}>{ev.badge}</span>}
              </div>
              <div className="ev-web-card-body">
                <p className="ev-web-card-title">{ev.titulo}</p>
                <p className="ev-web-card-meta">
                  <CalendarIcon s={12} />{formatarDataCurta(ev.data)}
                  <span className="ev-web-card-dot">·</span>
                  <MapPinIcon s={12} />{ev.local}
                </p>
                <div className="ev-web-card-acts">
                  <button className="ev-btn-sm ev-btn-sm--p"><EyeIcon s={12} />Ver mais</button>
                  <button className="ev-btn-sm ev-btn-sm--g"><ImageIcon s={12} />Galeria</button>
                  {isAdmin && <>
                    <button className="ev-btn-sm ev-btn-sm--g" onClick={() => handleEditar(ev.id)}>
                      <EditIcon s={12} />Editar
                    </button>
                    <button className="ev-btn-sm ev-btn-sm--danger"
                      onClick={() => setConfirmId(ev.id)}
                      disabled={deletando === ev.id}>
                      <TrashIcon s={12} />Excluir
                    </button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Modal de confirmação ── */
function ConfirmModal({ titulo, onCancel, onConfirm }) {
  return (
    <div className="ev-modal-overlay" onClick={onCancel}>
      <div className="ev-modal" onClick={e => e.stopPropagation()}>
        <div className="ev-modal-ico"><TrashIcon s={28} /></div>
        <h2 className="ev-modal-title">Excluir evento?</h2>
        <p className="ev-modal-sub">
          <strong>"{titulo}"</strong> será removido permanentemente. Esta ação não pode ser desfeita.
        </p>
        <div className="ev-modal-actions">
          <button className="ev-modal-btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="ev-modal-btn-confirm" onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  )
}

/* ── Icon que muda conforme o tipo do evento ── */
function EventIcon({ tipo, s = 24 }) {
  if (tipo === 'acao')     return <GraduationCapIcon s={s} />
  if (tipo === 'palestra') return <MicIcon s={s} />
  return <LandmarkIcon s={s} />
}

/* ── Icons ── */
const SV = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function SearchIcon({ s = 14 })       { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> }
function CalendarIcon({ s = 12 })     { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> }
function MapPinIcon({ s = 12 })       { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> }
function EyeIcon({ s = 12 })          { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> }
function ImageIcon({ s = 12 })        { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> }
function EditIcon({ s = 12 })         { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function TrashIcon({ s = 12 })        { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> }
function PlusIcon({ s = 18 })         { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M5 12h14"/><path d="M12 5v14"/></svg> }
function LandmarkIcon({ s = 24 })     { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg> }
function GraduationCapIcon({ s = 24 }){ return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> }
function MicIcon({ s = 24 })          { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg> }
