import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { publicacaoService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import clsx from 'clsx'

const TAG_MAP = {
  evento:  { tag: 'Evento',  tagColor: 'blue'  },
  acao:    { tag: 'Ação',    tagColor: 'green' },
  noticia: { tag: 'Notícia', tagColor: 'amber' },
  aviso:   { tag: 'Aviso',   tagColor: 'amber' },
}

function formatarDataLonga(dataStr) {
  if (!dataStr) return ''
  const d = new Date(dataStr)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatarPublicadoEm(dataStr) {
  if (!dataStr) return ''
  const d = new Date(dataStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const SV = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }
const btnBase = 'flex items-center gap-[5px] rounded-[8px] px-[11px] py-[6px] text-[11px] font-bold font-sans cursor-pointer border-none transition-all duration-200 whitespace-nowrap'

export default function EventoDetalhePage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { isAdmin }  = useAuth()

  const [evento, setEvento]           = useState(null)
  const [carregando, setCarregando]   = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [fotoAberta, setFotoAberta]   = useState(null)

  useEffect(() => {
    publicacaoService.obter(id)
      .then(res => setEvento(res.data))
      .catch(err => { if (err.response?.status === 404) setNaoEncontrado(true) })
      .finally(() => setCarregando(false))
  }, [id])

  if (carregando) return (
    <div className="flex items-center justify-center h-full text-[11px] text-t3 py-16">Carregando...</div>
  )

  if (naoEncontrado || !evento) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
      <p className="text-[14px] font-bold text-t1">Evento não encontrado</p>
      <button onClick={() => navigate('/eventos')} className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')}>
        <ArrowLeftIcon />Voltar para Eventos
      </button>
    </div>
  )

  const tipo     = evento.tipo?.toLowerCase() ?? 'evento'
  const { tag, tagColor } = TAG_MAP[tipo] ?? { tag: evento.tipo, tagColor: 'blue' }
  const galeria  = evento.imagensPublicacao ?? []
  const temCapa  = !!evento.imagemCapaUrl

  return (
    <>
      {/* lightbox */}
      {fotoAberta && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur z-[300] flex items-center justify-center p-4"
          onClick={() => setFotoAberta(null)}
        >
          <img src={fotoAberta} alt="" className="max-w-full max-h-full rounded-[12px] object-contain" />
        </div>
      )}

      {/* ══ MOBILE ══ */}
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden">
        {/* header */}
        <header className="px-[15px] py-[11px] flex items-center gap-2 flex-shrink-0 border-b border-bdr2 bg-bg">
          <button onClick={() => navigate('/eventos')}
            className="w-[30px] h-[30px] bg-s2 rounded-[9px] flex items-center justify-center text-t2 border-none cursor-pointer hover:bg-s3 transition-colors flex-shrink-0">
            <ArrowLeftIcon />
          </button>
          <p className="text-[14px] font-extrabold text-t1 truncate flex-1">{evento.titulo}</p>
          {isAdmin && (
            <button onClick={() => navigate(`/publicar?id=${id}`)}
              className="w-[30px] h-[30px] bg-s2 rounded-[9px] flex items-center justify-center text-t2 border-none cursor-pointer hover:bg-s3 transition-colors flex-shrink-0">
              <EditIcon />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          {/* capa */}
          <div className="w-full h-[180px] flex items-center justify-center relative overflow-hidden text-icon flex-shrink-0"
               style={temCapa ? {} : { background: 'linear-gradient(135deg, var(--s2), var(--s3))' }}>
            {temCapa
              ? <img src={evento.imagemCapaUrl} alt={evento.titulo} className="absolute inset-0 w-full h-full object-cover" />
              : <EventIcon tipo={tipo} s={48} />}
          </div>

          <div className="px-[15px] py-[14px] pb-6">
            {/* título + tag */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h1 className="text-[17px] font-extrabold text-t1 leading-[1.3] flex-1">{evento.titulo}</h1>
              <EventTag tag={tag} color={tagColor} />
            </div>

            {/* meta */}
            <div className="flex flex-col gap-[6px] mb-4">
              <p className="text-[11px] text-t2 flex items-center gap-[6px]">
                <span className="text-blue-l"><CalendarIcon /></span>
                <span className="capitalize">{formatarDataLonga(evento.data)}</span>
              </p>
              {evento.local && (
                <p className="text-[11px] text-t2 flex items-center gap-[6px]">
                  <span className="text-blue-l"><MapPinIcon /></span>
                  {evento.local}
                </p>
              )}
            </div>

            {/* descrição */}
            {evento.descricao && (
              <div className="mb-5">
                <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-2">Descrição</p>
                <p className="text-[12px] text-t2 leading-[1.7] whitespace-pre-wrap">{evento.descricao}</p>
              </div>
            )}

            {/* galeria */}
            {galeria.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-2">Galeria</p>
                <div className="grid grid-cols-2 gap-2">
                  {galeria.map(img => (
                    <button key={img.id} onClick={() => setFotoAberta(img.url)}
                      className="w-full h-[90px] rounded-[10px] overflow-hidden border border-bdr bg-s2 cursor-pointer p-0">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* rodapé */}
            <div className="border-t border-bdr2 pt-3">
              <p className="text-[9px] text-t3">Publicado em {formatarPublicadoEm(evento.publicadoEm)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ DESKTOP ══ */}
      <div className="hidden md:block py-5 px-[22px] md:h-screen md:overflow-y-auto md:scrollbar-thin">
        {/* topbar */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate('/eventos')}
            className={clsx(btnBase, 'bg-s1 border border-bdr text-t2 hover:bg-s2')}>
            <ArrowLeftIcon />Voltar para Eventos
          </button>
          {isAdmin && (
            <button onClick={() => navigate(`/publicar?id=${id}`)}
              className={clsx(btnBase, 'bg-s2 border border-bdr text-t2 hover:bg-s3')}>
              <EditIcon />Editar
            </button>
          )}
        </div>

        <div className="max-w-[820px]">
          {/* capa */}
          <div className="w-full h-[240px] rounded-[16px] overflow-hidden flex items-center justify-center text-icon mb-6 relative"
               style={temCapa ? {} : { background: 'linear-gradient(135deg, var(--s2), var(--s3))' }}>
            {temCapa
              ? <img src={evento.imagemCapaUrl} alt={evento.titulo} className="absolute inset-0 w-full h-full object-cover" />
              : <EventIcon tipo={tipo} s={64} />}
          </div>

          {/* título + tag */}
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-[24px] font-extrabold text-t1 leading-[1.2] flex-1">{evento.titulo}</h1>
            <EventTag tag={tag} color={tagColor} />
          </div>

          {/* meta */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
            <p className="text-[12px] text-t2 flex items-center gap-[7px]">
              <span className="text-blue-l"><CalendarIcon s={14} /></span>
              <span className="capitalize">{formatarDataLonga(evento.data)}</span>
            </p>
            {evento.local && (
              <p className="text-[12px] text-t2 flex items-center gap-[7px]">
                <span className="text-blue-l"><MapPinIcon s={14} /></span>
                {evento.local}
              </p>
            )}
          </div>

          {/* descrição */}
          {evento.descricao && (
            <div className="bg-s1 border border-bdr rounded-[13px] p-5 mb-5">
              <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-3">Descrição</p>
              <p className="text-[13px] text-t2 leading-[1.8] whitespace-pre-wrap">{evento.descricao}</p>
            </div>
          )}

          {/* galeria */}
          {galeria.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-bold text-t3 uppercase tracking-[1.5px] mb-3">Galeria</p>
              <div className="grid grid-cols-3 gap-3">
                {galeria.map(img => (
                  <button key={img.id} onClick={() => setFotoAberta(img.url)}
                    className="w-full h-[130px] rounded-[12px] overflow-hidden border border-bdr bg-s2 cursor-pointer p-0 hover:brightness-95 transition-all duration-200">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* rodapé */}
          <div className="border-t border-bdr2 pt-4">
            <p className="text-[10px] text-t3">Publicado em {formatarPublicadoEm(evento.publicadoEm)}</p>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Sub-componentes ── */

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

function EventIcon({ tipo, s = 32 }) {
  if (tipo === 'acao') return <GraduationCapIcon s={s} />
  return <LandmarkIcon s={s} />
}

/* ── Ícones ── */
function ArrowLeftIcon()           { return <svg width="14" height="14" viewBox="0 0 24 24" {...SV}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> }
function CalendarIcon({ s = 12 })  { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> }
function MapPinIcon({ s = 12 })    { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> }
function EditIcon()                { return <svg width="12" height="12" viewBox="0 0 24 24" {...SV}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function LandmarkIcon({ s = 32 })  { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg> }
function GraduationCapIcon({ s = 32 }) { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> }
