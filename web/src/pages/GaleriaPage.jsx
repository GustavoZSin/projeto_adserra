import { useState, useMemo, useEffect } from 'react'
import { publicacaoService } from '../services/api'
import clsx from 'clsx'

const SV = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function formatarData(dataStr) {
  if (!dataStr) return ''
  const d = new Date(dataStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function GaleriaPage() {
  const [publicacoes, setPublicacoes] = useState([])
  const [carregando, setCarregando]   = useState(true)
  const [filtroId, setFiltroId]       = useState('todos')
  const [fotoAberta, setFotoAberta]   = useState(null)

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      try {
        const { data } = await publicacaoService.listar()

        const temImagens = data.some(p => p.imagensPublicacao?.length > 0)

        if (temImagens) {
          setPublicacoes(
            data.filter(p => p.publica !== false && p.imagensPublicacao?.length > 0)
          )
        } else {
          // listar não retorna imagens — busca individual em paralelo
          const detalhes = await Promise.all(
            data
              .filter(p => p.publica !== false)
              .map(p => publicacaoService.obter(p.id).then(r => r.data).catch(() => null))
          )
          setPublicacoes(
            detalhes.filter(p => p && (p.imagensPublicacao?.length > 0))
          )
        }
      } catch {
        // falha silenciosa
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const todasFotos = useMemo(() =>
    publicacoes.flatMap(pub =>
      (pub.imagensPublicacao ?? []).map(img => ({
        id:           img.id,
        url:          img.url ?? img.uRL,
        eventoId:     pub.id,
        eventoTitulo: pub.titulo,
        eventoData:   pub.data,
      }))
    ), [publicacoes])

  const fotosFiltradas = useMemo(() =>
    filtroId === 'todos'
      ? todasFotos
      : todasFotos.filter(f => f.eventoId === filtroId),
    [todasFotos, filtroId])

  const toggleFiltro = (id) => setFiltroId(prev => prev === id ? 'todos' : id)

  return (
    <>
      {/* Lightbox */}
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
        <header className="flex-shrink-0 px-[15px] pt-[13px] pb-[10px] border-b border-bdr2 bg-bg">
          <p className="text-[16px] font-extrabold text-t1">Galeria de Fotos</p>
        </header>

        {/* Filtros mobile */}
        {publicacoes.length > 0 && (
          <div className="flex-shrink-0 flex gap-2 px-[15px] py-[10px] overflow-x-auto scrollbar-hide">
            {publicacoes.map(pub => (
              <FilterPill
                key={pub.id}
                label={pub.titulo}
                active={filtroId === pub.id}
                onClick={() => toggleFiltro(pub.id)}
              />
            ))}
            <FilterPill
              label="Todos"
              active={filtroId === 'todos'}
              onClick={() => setFiltroId('todos')}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide px-[15px] pb-5">
          {carregando ? (
            <GradeSkeleton cols={2} />
          ) : fotosFiltradas.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {fotosFiltradas.map(foto => (
                <button
                  key={foto.id}
                  onClick={() => setFotoAberta(foto.url)}
                  className="w-full aspect-square rounded-[10px] overflow-hidden border border-bdr bg-s2 cursor-pointer p-0 transition-all duration-[250ms] active:brightness-90"
                >
                  <img src={foto.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ DESKTOP ══ */}
      <div className="hidden md:flex md:flex-col py-5 px-[22px] md:h-screen md:overflow-y-auto md:scrollbar-thin">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-[18px] flex-shrink-0">
          <p className="text-[19px] font-black text-t1">Galeria de Fotos</p>
        </div>

        {/* Filtros desktop */}
        {publicacoes.length > 0 && (
          <div className="flex gap-2 mb-[18px] overflow-x-auto scrollbar-hide pb-[2px] flex-shrink-0">
            {publicacoes.map(pub => (
              <FilterPill
                key={pub.id}
                label={pub.titulo}
                active={filtroId === pub.id}
                onClick={() => toggleFiltro(pub.id)}
              />
            ))}
            <FilterPill
              label="Todos"
              active={filtroId === 'todos'}
              onClick={() => setFiltroId('todos')}
            />
          </div>
        )}

        {/* Grade de fotos */}
        {carregando ? (
          <GradeSkeleton cols={4} />
        ) : fotosFiltradas.length === 0 ? (
          <EmptyState />
        ) : (
          <GradeDesktop fotos={fotosFiltradas} onFotoClick={setFotoAberta} />
        )}
      </div>
    </>
  )
}

/* ── Grade desktop com destaque 2×2 na primeira foto ── */
function GradeDesktop({ fotos, onFotoClick }) {
  return (
    <div className="grid grid-cols-4 gap-[10px]">
      {fotos.map((foto, i) => {
        const destaque = i === 0
        return (
          <button
            key={foto.id}
            onClick={() => onFotoClick(foto.url)}
            className={clsx(
              'relative overflow-hidden rounded-[14px] border border-bdr bg-s2 cursor-pointer p-0 transition-all duration-[350ms] hover:brightness-90',
              destaque ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
            )}
          >
            <img src={foto.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {destaque && (
              <div
                className="absolute bottom-0 left-0 right-0 px-[14px] py-[10px] pt-8"
                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}
              >
                <p className="text-[12px] font-semibold text-white leading-snug truncate">
                  {foto.eventoTitulo}
                </p>
                <p className="text-[10px] text-white/50 flex items-center gap-1 mt-[2px]">
                  <CalendarIcon />{formatarData(foto.eventoData)}
                </p>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ── Filter pill ── */
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex-shrink-0 px-3 py-[5px] rounded-[20px] text-[10px] font-semibold cursor-pointer font-sans border-none transition-all duration-[250ms] whitespace-nowrap',
        active ? 'text-white shadow-blue-glow' : 'bg-s2 text-t3 border border-bdr'
      )}
      style={active ? { background: 'linear-gradient(135deg, var(--blue-d), var(--blue-l))' } : {}}
    >
      {label}
    </button>
  )
}

/* ── Estado vazio ── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-t3">
      <ImageIcon />
      <p className="text-[12px] font-semibold">Nenhuma foto encontrada</p>
    </div>
  )
}

/* ── Skeleton de carregamento ── */
function GradeSkeleton({ cols }) {
  return (
    <div className="grid gap-[10px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols === 4 ? 8 : 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-[14px] bg-s2 border border-bdr animate-pulse" />
      ))}
    </div>
  )
}

/* ── Ícones ── */
function CalendarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" {...SV}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  )
}
function ImageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" {...SV}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  )
}
