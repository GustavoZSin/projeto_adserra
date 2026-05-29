import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getIniciais } from '../utils/usuario'
import { publicacaoService } from '../services/api'
import MenuAvatar from '../components/ui/MenuAvatar'
import clsx from 'clsx'
import { Search, Calendar, MapPin, Eye, Image, Pencil, Trash2, Plus, Landmark, Lock, GraduationCap, Mic } from 'lucide-react'

const TAG_MAP = {
  evento:  { tag: 'Evento',  tagColor: 'blue'  },
  acao:    { tag: 'Ação',    tagColor: 'green' },
  noticia: { tag: 'Notícia', tagColor: 'amber' },
  aviso:   { tag: 'Aviso',   tagColor: 'amber' },
}

const normalizarPublicacao = (p) => {
  const tipo = p.tipo.toLowerCase()
  const { tag, tagColor } = TAG_MAP[tipo] ?? { tag: p.tipo, tagColor: 'blue' }
  return {
    id: p.id,
    titulo: p.titulo,
    tipo,
    data: p.data.split('T')[0],
    local: p.local ?? '',
    imagemCapaUrl: p.imagemCapaUrl ?? null,
    publica: p.publica,
    tag,
    tagColor,
  }
}

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
  const [filtro, setFiltro]         = useState('Todos')
  const [busca, setBusca]           = useState('')
  const [mostrarBusca, setMostrarBusca] = useState(false)
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [deletando, setDeletando] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const initials = getIniciais(user)
  const visiveis = useMemo(() => {
    const porFiltro = filtrarEventos(eventos, filtro)
    const termo = busca.toLowerCase().trim()
    if (!termo) return porFiltro
    return porFiltro.filter(e =>
      e.titulo.toLowerCase().includes(termo) ||
      e.local?.toLowerCase().includes(termo)
    )
  }, [eventos, filtro, busca])
  const eventoMap     = useMemo(() => new Map(eventos.map(e => [e.id, e])), [eventos])
  const eventoConfirm = eventoMap.get(confirmId)

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      try {
        const { data } = await publicacaoService.listar()
        const visiveis = isAdmin ? data : data.filter(p => p.publica)
        setEventos(visiveis.map(normalizarPublicacao))
      } catch {
        // mantém lista vazia em caso de erro
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [isAdmin])

  const handleEditar = (id) => navigate(`/publicar?id=${id}`)

  const handleDeletar = async () => {
    const id = confirmId
    setConfirmId(null)
    setDeletando(id)
    try {
      await publicacaoService.deletar(id)
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
            <button
              className={clsx('w-[30px] h-[30px] rounded-[9px] flex items-center justify-center border-none cursor-pointer transition-colors', mostrarBusca ? 'bg-blue-grad text-white' : 'bg-s2 text-t2 hover:bg-s3')}
              aria-label="Buscar"
              onClick={() => { setMostrarBusca(v => !v); if (mostrarBusca) setBusca('') }}
            >
              <Search size={14} strokeWidth={1.8} />
            </button>
            <MenuAvatar />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-[13px] py-[11px] pb-5 scrollbar-hide">
          {mostrarBusca && (
            <div className="relative mb-3">
              <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-t3 pointer-events-none"><Search size={14} strokeWidth={1.8} /></span>
              <input
                autoFocus
                className="w-full bg-s1 border border-bdr rounded-[10px] pl-[30px] pr-3 py-[8px] text-[11px] text-t1 placeholder-t3 outline-none focus:border-blue-l transition-colors font-sans"
                placeholder="Buscar por título ou local..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
          )}

          <Filters filtro={filtro} setFiltro={setFiltro} className="mb-3" />

          {carregando && <p className="text-[11px] text-t3 text-center py-8">Carregando...</p>}
          {!carregando && visiveis.length === 0 && <p className="text-[11px] text-t3 text-center py-8">Nenhum evento encontrado.</p>}

          {visiveis.map(ev => (
            <div key={ev.id} className={clsx('bg-s1 rounded-[13px] overflow-hidden mb-[9px] border', !ev.publica ? 'border-amber/40 opacity-75' : 'border-bdr')}>
              <div className="w-full h-20 flex items-center justify-center text-icon relative overflow-hidden"
                   style={ev.imagemCapaUrl ? {} : { background: 'linear-gradient(135deg, var(--s2), var(--s3))' }}>
                {ev.imagemCapaUrl
                  ? <img src={ev.imagemCapaUrl} alt={ev.titulo} className="absolute inset-0 w-full h-full object-cover" />
                  : <EventIcon tipo={ev.tipo} />}
                {!ev.publica && <RascunhoBadge />}
              </div>
              <div className="px-3 py-[10px] pb-3">
                <div className="flex justify-between items-start mb-[5px] gap-[6px]">
                  <p className="text-[12px] font-bold text-t1">{ev.titulo}</p>
                  <EventTag tag={ev.tag} color={ev.tagColor} />
                </div>
                <p className="text-[9px] text-t3 flex items-center gap-1 mb-0.5"><Calendar size={12} strokeWidth={1.8} />{formatarDataLonga(ev.data)}</p>
                <p className="text-[9px] text-t3 flex items-center gap-1 mb-0.5"><MapPin size={12} strokeWidth={1.8} />{ev.local}</p>
                <div className="flex flex-wrap gap-[6px] mt-[9px]">
                  <button className={clsx(btnBase, 'bg-blue-grad text-white shadow-[0_3px_10px_var(--blue-glow)] hover:opacity-90')} onClick={() => navigate(`/eventos/${ev.id}`)}><Eye size={12} strokeWidth={1.8} />Detalhes</button>
                  <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')} onClick={() => navigate(`/eventos/${ev.id}`)}><Image size={12} strokeWidth={1.8} />Galeria</button>
                  {isAdmin && <>
                    <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')} onClick={() => handleEditar(ev.id)}>
                      <Pencil size={12} strokeWidth={1.8} />Editar
                    </button>
                    <button className={clsx(btnBase, 'bg-red/[0.1] border border-red/25 text-red hover:bg-red/[0.18]')}
                      onClick={() => setConfirmId(ev.id)} disabled={deletando === ev.id}>
                      <Trash2 size={12} strokeWidth={1.8} />Excluir
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
            <Plus size={18} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block py-5 px-[22px]">
        <div className="flex items-center justify-between mb-[18px]">
          <p className="text-[19px] font-black text-t1">Eventos</p>
          <div className="flex items-center gap-[9px]">
            <div className="relative">
              <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-t3 pointer-events-none"><Search size={13} strokeWidth={1.8} /></span>
              <input
                className="bg-s1 border-[1.5px] border-bdr rounded-[9px] pl-[30px] pr-3 py-[7px] text-[11px] text-t1 placeholder-t3 outline-none focus:border-blue-l transition-colors font-sans w-[200px]"
                placeholder="Buscar eventos..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
            {isAdmin && (
              <button className={clsx(btnBase, 'bg-blue-grad text-white shadow-[0_3px_10px_var(--blue-glow)] hover:opacity-90')} onClick={() => navigate('/publicar')}>
                <Plus size={13} strokeWidth={1.8} />Novo evento
              </button>
            )}
          </div>
        </div>

        <Filters filtro={filtro} setFiltro={setFiltro} className="mb-4" />

        {carregando && <p className="text-[11px] text-t3 text-center py-8">Carregando...</p>}
        {!carregando && visiveis.length === 0 && <p className="text-[11px] text-t3 text-center py-8">Nenhum evento encontrado.</p>}

        <div className="grid grid-cols-3 gap-3">
          {visiveis.map(ev => (
            <div key={ev.id} className={clsx('bg-s1 rounded-[13px] overflow-hidden border', !ev.publica ? 'border-amber/40 opacity-75' : 'border-bdr')}>
              <div className="w-full h-[100px] flex items-center justify-center text-icon relative overflow-hidden"
                   style={ev.imagemCapaUrl ? {} : { background: 'linear-gradient(135deg, var(--s2), var(--s3))' }}>
                {ev.imagemCapaUrl
                  ? <img src={ev.imagemCapaUrl} alt={ev.titulo} className="absolute inset-0 w-full h-full object-cover" />
                  : <EventIcon tipo={ev.tipo} s={24} />}
                {!ev.publica && <RascunhoBadge />}
              </div>
              <div className="p-3">
                <p className="text-[12px] font-bold text-t1 mb-1">{ev.titulo}</p>
                <p className="text-[10px] text-t3 flex items-center gap-1 mb-[9px] flex-wrap">
                  <Calendar size={12} strokeWidth={1.8} />{formatarDataCurta(ev.data)}
                  <span className="mx-0.5">·</span>
                  <MapPin size={12} strokeWidth={1.8} />{ev.local}
                </p>
                <div className="flex gap-[6px] flex-wrap">
                  <button className={clsx(btnBase, 'bg-blue-grad text-white shadow-[0_3px_10px_var(--blue-glow)] hover:opacity-90')} onClick={() => navigate(`/eventos/${ev.id}`)}><Eye size={12} strokeWidth={1.8} />Ver mais</button>
                  <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')} onClick={() => navigate(`/eventos/${ev.id}`)}><Image size={12} strokeWidth={1.8} />Galeria</button>
                  {isAdmin && <>
                    <button className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')} onClick={() => handleEditar(ev.id)}>
                      <Pencil size={12} strokeWidth={1.8} />Editar
                    </button>
                    <button className={clsx(btnBase, 'bg-red/[0.1] border border-red/25 text-red hover:bg-red/[0.18]')}
                      onClick={() => setConfirmId(ev.id)} disabled={deletando === ev.id}>
                      <Trash2 size={12} strokeWidth={1.8} />Excluir
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

function RascunhoBadge() {
  return (
    <span className="absolute top-[7px] left-[7px] flex items-center gap-[4px] bg-amber text-white rounded-[5px] px-[7px] py-[3px] text-[8px] font-bold tracking-[0.3px] shadow-sm">
      <Lock size={8} strokeWidth={2.5} /> Rascunho
    </span>
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
          <Trash2 size={28} strokeWidth={1.8} />
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
  if (tipo === 'acao')     return <GraduationCap size={s} strokeWidth={1.8} />
  if (tipo === 'palestra') return <Mic size={s} strokeWidth={1.8} />
  return <Landmark size={s} strokeWidth={1.8} />
}
