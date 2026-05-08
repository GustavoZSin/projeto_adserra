import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getIniciais } from '../utils/usuario'
import clsx from 'clsx'

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

const filterPill = 'flex-shrink-0 px-3 py-[5px] rounded-[20px] text-[10px] font-semibold cursor-pointer font-sans border transition-all duration-[250ms]'
const btnBase    = 'flex items-center gap-[5px] rounded-[8px] px-[11px] py-[6px] text-[11px] font-bold font-sans cursor-pointer border-none transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'

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
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden relative">
        <div className="px-[15px] py-[11px] flex items-center justify-between flex-shrink-0 border-b border-bdr2 bg-bg">
          <span className="text-[15px] font-extrabold text-t1">Eventos</span>
          <div className="flex items-center gap-2">
            <button className="w-[30px] h-[30px] bg-s2 rounded-[9px] flex items-center justify-center text-t2 border-none cursor-pointer hover:bg-s3" aria-label="Buscar">
              <SearchIcon />
            </button>
            <div className="w-[30px] h-[30px] bg-blue-grad rounded-[9px] flex items-center justify-center text-[11px] font-bold text-white tracking-[0.5px] font-sans select-none flex-shrink-0">
              {initials}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-[13px] py-[11px] pb-5 scrollbar-hide">
          <Filters filtro={filtro} setFiltro={setFiltro} className="mb-3" />

          {visiveis.length === 0 && <p className="text-[11px] text-t3 text-center py-8">Nenhum evento encontrado.</p>}

          {visiveis.map(ev => (
            <div key={ev.id} className="bg-s1 border border-bdr rounded-[13px] overflow-hidden mb-[9px]">
              <div className="w-full h-20 flex items-center justify-center text-icon relative"
                   style={{ background: 'linear-gradient(135deg, var(--s2), var(--s3))' }}>
                <EventIcon tipo={ev.tipo} />
                {ev.badge && <EventBadge label={ev.badge} color={ev.badgeColor} />}
              </div>
              <div className="px-3 py-[10px] pb-3">
                <div className="flex justify-between items-start mb-[5px] gap-[6px]">
                  <p className="text-[12px] font-bold text-t1">{ev.titulo}</p>
                  <EventTag tag={ev.tag} color={ev.tagColor} />
                </div>
                <p className="text-[9px] text-t3 flex items-center gap-1 mb-0.5"><CalendarIcon s={12} />{formatarDataLonga(ev.data)}</p>
                <p className="text-[9px] text-t3 flex items-center gap-1 mb-0.5"><MapPinIcon s={12} />{ev.local}</p>
                <div className="flex flex-wrap gap-[6px] mt-[9px]">
                  <button className={clsx(btnBase, 'bg-blue-grad text-white shadow-[0_3px_10px_var(--blue-glow)] hover:opacity-90')}><EyeIcon s={12} />Detalhes</button>
                  <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')}><ImageIcon s={12} />Galeria</button>
                  {isAdmin && <>
                    <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')} onClick={() => handleEditar(ev.id)}>
                      <EditIcon s={12} />Editar
                    </button>
                    <button className={clsx(btnBase, 'bg-red/[0.1] border border-red/25 text-red hover:bg-red/[0.18]')}
                      onClick={() => setConfirmId(ev.id)} disabled={deletando === ev.id}>
                      <TrashIcon s={12} />Excluir
                    </button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <button className="absolute bottom-3 right-[14px] w-[42px] h-[42px] bg-blue-grad rounded-[12px] flex items-center justify-center text-white border-none shadow-[0_5px_16px_var(--blue-glow)] cursor-pointer z-[6] hover:opacity-90"
                  onClick={() => navigate('/publicar')} aria-label="Novo evento">
            <PlusIcon s={18} />
          </button>
        )}
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block py-5 px-[22px]">
        <div className="flex items-center justify-between mb-[18px]">
          <p className="text-[19px] font-black text-t1">Eventos</p>
          <div className="flex items-center gap-[9px]">
            <div className="flex items-center gap-[7px] bg-s1 border-[1.5px] border-bdr rounded-[9px] px-3 py-[7px] text-[11px] text-t3 cursor-text hover:border-blue-l transition-colors">
              <SearchIcon s={13} /><span>Buscar eventos...</span>
            </div>
            {isAdmin && (
              <button className={clsx(btnBase, 'bg-blue-grad text-white shadow-[0_3px_10px_var(--blue-glow)] hover:opacity-90')} onClick={() => navigate('/publicar')}>
                <PlusIcon s={13} />Novo evento
              </button>
            )}
          </div>
        </div>

        <Filters filtro={filtro} setFiltro={setFiltro} className="mb-4" />

        {visiveis.length === 0 && <p className="text-[11px] text-t3 text-center py-8">Nenhum evento encontrado.</p>}

        <div className="grid grid-cols-3 gap-3">
          {visiveis.map(ev => (
            <div key={ev.id} className="bg-s1 border border-bdr rounded-[13px] overflow-hidden">
              <div className="w-full h-[100px] flex items-center justify-center text-icon relative"
                   style={{ background: 'linear-gradient(135deg, var(--s2), var(--s3))' }}>
                <EventIcon tipo={ev.tipo} s={24} />
                {ev.badge && <EventBadge label={ev.badge} color={ev.badgeColor} />}
              </div>
              <div className="p-3">
                <p className="text-[12px] font-bold text-t1 mb-1">{ev.titulo}</p>
                <p className="text-[10px] text-t3 flex items-center gap-1 mb-[9px] flex-wrap">
                  <CalendarIcon s={12} />{formatarDataCurta(ev.data)}
                  <span className="mx-0.5">·</span>
                  <MapPinIcon s={12} />{ev.local}
                </p>
                <div className="flex gap-[6px] flex-wrap">
                  <button className={clsx(btnBase, 'bg-blue-grad text-white shadow-[0_3px_10px_var(--blue-glow)] hover:opacity-90')}><EyeIcon s={12} />Ver mais</button>
                  <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')}><ImageIcon s={12} />Galeria</button>
                  {isAdmin && <>
                    <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')} onClick={() => handleEditar(ev.id)}>
                      <EditIcon s={12} />Editar
                    </button>
                    <button className={clsx(btnBase, 'bg-red/[0.1] border border-red/25 text-red hover:bg-red/[0.18]')}
                      onClick={() => setConfirmId(ev.id)} disabled={deletando === ev.id}>
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

/* ── Shared sub-components ── */

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

function EventBadge({ label, color }) {
  return (
    <span className={clsx(
      'absolute top-[7px] right-[7px] rounded-[5px] px-[7px] py-0.5 text-[8px] font-bold text-white tracking-[0.3px]',
      color === 'blue'  && 'bg-blue',
      color === 'green' && 'bg-green',
      color === 'amber' && 'bg-amber',
    )}>{label}</span>
  )
}

function EventTag({ tag, color }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-[20px] text-[8px] font-bold tracking-[0.3px] uppercase whitespace-nowrap flex-shrink-0',
      color === 'blue'  && 'bg-[var(--blue-sub)] text-blue-l border border-[var(--blue-bdr)]',
      color === 'green' && 'bg-green/[0.1] text-green',
      color === 'amber' && 'bg-amber/[0.1] text-amber',
    )}>{tag}</span>
  )
}

/* ── Modal de confirmação ── */
function ConfirmModal({ titulo, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur z-[200] flex items-center justify-center p-5" onClick={onCancel}>
      <div className="bg-s1 border border-bdr rounded-[18px] px-6 py-7 max-w-[320px] w-full flex flex-col items-center text-center shadow-sh" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red/[0.12] rounded-[14px] flex items-center justify-center text-red mb-4">
          <TrashIcon s={28} />
        </div>
        <h2 className="text-[16px] font-extrabold text-t1 mb-2">Excluir evento?</h2>
        <p className="text-[11px] text-t3 leading-[1.6] mb-[22px] [&_strong]:text-t2 [&_strong]:font-semibold">
          <strong>"{titulo}"</strong> será removido permanentemente. Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-2 w-full">
          <button className="flex-1 bg-transparent border-[1.5px] border-bdr rounded-[10px] py-[10px] text-t2 text-[12px] font-semibold font-sans cursor-pointer hover:bg-s2 transition-colors"
                  onClick={onCancel}>Cancelar</button>
          <button className="flex-1 bg-red-grad border-none rounded-[10px] py-[10px] text-white text-[12px] font-bold font-sans cursor-pointer shadow-[0_4px_14px_rgba(239,68,68,0.35)] hover:opacity-90 transition-opacity"
                  onClick={onConfirm}>Excluir</button>
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
