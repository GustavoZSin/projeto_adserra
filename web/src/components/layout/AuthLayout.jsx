import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoImg from '../../assets/adserra-logo.png'
import { publicacaoService } from '../../services/api'
import clsx from 'clsx'

export default function AuthLayout() {
  const { pathname } = useLocation()
  const isLogin = pathname === '/login'

  return (
    <div className="min-h-screen flex bg-bg">

      {/* ── Painel esquerdo — desktop only ── */}
      <aside className="hidden md:flex w-[420px] flex-shrink-0 flex-col relative overflow-hidden px-10 py-12"
             style={{ background: 'linear-gradient(145deg, #0c3d6b 0%, #1B70B0 55%, #2484CC 100%)' }}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="absolute -bottom-[100px] -left-[60px] w-[360px] h-[360px] rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="absolute top-[140px] -right-[50px] w-[180px] h-[180px] rounded-full bg-white/[0.06] pointer-events-none" />

        <div className="relative z-10 flex-shrink-0">
          <div className="mb-10">
            <LogoWhite />
          </div>
          <h2 className="text-[28px] font-extrabold text-white leading-[1.25] mb-[14px] tracking-[-0.4px]">
            Portal exclusivo<br />para docentes
          </h2>
          <p className="text-[13px] text-white/70 leading-[1.7]">
            Associação dos Docentes do Centro Universitário da Serra Gaúcha.
            Acesse eventos, notícias e ações da associação.
          </p>
        </div>

        {isLogin && (
          <div className="relative z-10 mt-7 flex-1 flex flex-col min-h-0">
            <CarouselPublicacoes />
          </div>
        )}

        <div className={clsx('relative z-10 flex flex-shrink-0', isLogin ? 'mt-6' : 'mt-auto')}>
          {[
            { n: '48',  l: 'Docentes ativos' },
            { n: '12+', l: 'Eventos anuais'  },
            { n: 'FSG', l: 'Instituição'     },
          ].map(({ n, l }) => (
            <div key={n} className="flex-1 flex flex-col items-center gap-1 px-3 border-r border-white/[0.18] first:pl-0 last:border-r-0">
              <span className="text-[26px] font-black text-white tracking-[-0.5px]">{n}</span>
              <span className="text-[10px] text-white/60 font-medium text-center">{l}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Conteúdo da página ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Outlet />
      </div>

    </div>
  )
}

/* ── Carousel ── */

const TAG_META = {
  evento:  { label: 'Evento',  bg: 'bg-blue/70'  },
  acao:    { label: 'Ação',    bg: 'bg-green/70' },
  noticia: { label: 'Notícia', bg: 'bg-amber/70' },
  aviso:   { label: 'Aviso',   bg: 'bg-amber/70' },
}

function CarouselPublicacoes() {
  const [publicacoes, setPublicacoes] = useState([])
  const [carregando, setCarregando]   = useState(true)
  const [pagina, setPagina]           = useState(0)

  const POR_PAGINA   = 3
  const totalPaginas = Math.max(1, Math.ceil(publicacoes.length / POR_PAGINA))

  useEffect(() => {
    publicacaoService.listar()
      .then(({ data }) => setPublicacoes(data.filter(p => p.publica).slice(0, 9)))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    if (totalPaginas <= 1) return
    const t = setInterval(() => setPagina(p => (p + 1) % totalPaginas), 5000)
    return () => clearInterval(t)
  }, [totalPaginas])

  const slice = publicacoes.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-bold text-white mb-[2px]">Destaques públicos</p>
        <p className="text-[10px] text-white/50 leading-[1.5]">Confira as novidades da associação.</p>
      </div>

      {carregando ? (
        <div className="flex gap-2">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : publicacoes.length === 0 ? (
        <div className="flex gap-2 opacity-40 pointer-events-none">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            {slice.map(pub => <CardPublicacao key={pub.id} pub={pub} />)}
          </div>
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-[6px]">
              {Array.from({ length: totalPaginas }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPagina(i)}
                  className={clsx(
                    'w-[6px] h-[6px] rounded-full border-none cursor-pointer p-0 transition-all duration-300',
                    i === pagina ? 'bg-white scale-125' : 'bg-white/30'
                  )}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CardPublicacao({ pub }) {
  const tipo = pub.tipo?.toLowerCase() ?? 'evento'
  const meta = TAG_META[tipo] ?? TAG_META.evento
  const dataFormatada = pub.data
    ? new Date(pub.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : ''

  return (
    <div className="flex-1 min-w-0 rounded-[10px] bg-white/[0.1] border border-white/[0.12] overflow-hidden">
      <div
        className="w-full h-[52px] relative overflow-hidden"
        style={pub.imagemCapaUrl ? {} : { background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))' }}
      >
        {pub.imagemCapaUrl && (
          <img src={pub.imagemCapaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="p-[6px]">
        <span className={clsx('inline-block text-[7px] font-bold uppercase tracking-[0.4px] px-[5px] py-[2px] rounded-[4px] text-white mb-[4px]', meta.bg)}>
          {meta.label}
        </span>
        <p className="text-[9px] font-bold text-white leading-[1.35] line-clamp-2 mb-[3px]">{pub.titulo}</p>
        <p className="text-[8px] text-white/40">{dataFormatada}</p>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex-1 min-w-0 rounded-[10px] bg-white/[0.08] overflow-hidden animate-pulse">
      <div className="w-full h-[52px] bg-white/[0.05]" />
      <div className="p-[6px] flex flex-col gap-[5px]">
        <div className="h-[8px] w-10 bg-white/[0.12] rounded-[3px]" />
        <div className="h-[8px] w-full bg-white/[0.08] rounded-[3px]" />
        <div className="h-[7px] w-3/4 bg-white/[0.06] rounded-[3px]" />
      </div>
    </div>
  )
}

function LogoWhite() {
  return (
    <img
      src={logoImg}
      alt="ADSerra"
      height={76}
      style={{ width: 'auto', display: 'block', userSelect: 'none', filter: 'brightness(0) invert(1)' }}
      draggable={false}
    />
  )
}
