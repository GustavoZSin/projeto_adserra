import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useAuth } from '../contexts/AuthContext'
import { getIniciais } from '../utils/usuario'
import logoImg from '../assets/adserra-logo.png'
import { publicacaoService } from '../services/api'

const COR_AVATARES = [
  'linear-gradient(135deg,var(--blue-d),var(--blue-l))',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  'linear-gradient(135deg,#EF4444,#DC2626)',
]

function formatarDataEvento(dataStr, local) {
  const data = new Date(dataStr)
  const formatada = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  return local ? `${formatada} · ${local}` : formatada
}

function formatarDataEventoCurta(dataStr) {
  return new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatarTempo(dataStr) {
  const data = new Date(dataStr)
  const agora = new Date()
  const diffH = Math.floor((agora - data) / 3_600_000)
  const diffD = Math.floor(diffH / 24)
  const hhmm  = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diffH < 1)  return 'Agora'
  if (diffH < 24) return `Hoje · ${hhmm}`
  if (diffD === 1) return `Ontem · ${hhmm}`
  return `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · ${hhmm}`
}

function textoAtividadePorTipo(tipo) {
  switch (tipo) {
    case 'Evento':  return 'publicou um novo evento'
    case 'Acao':    return 'registrou uma ação'
    case 'Noticia': return 'publicou uma notícia'
    case 'Aviso':   return 'publicou um aviso'
    default:        return 'fez uma publicação'
  }
}

function obterSaudacao() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function obterDataHero() {
  const raw = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export default function HomePage() {
  const { user } = useAuth()
  const iniciais  = getIniciais(user)
  const primeiroNome = user?.name ? user.name.split(' ')[0] : 'Professor'

  const [publicacoes, setPublicacoes] = useState([])
  const [carregando, setCarregando]   = useState(true)

  useEffect(() => {
    publicacaoService.listar({ Publicas: true })
      .then(r => setPublicacoes(r.data ?? []))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const umaSemanaAtras = new Date()
  umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7)

  const eventosProximos = publicacoes
    .filter(p => p.tipo === 'Evento' && new Date(p.data) >= hoje)
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 3)

  const noticiasList = publicacoes
    .filter(p => p.tipo === 'Noticia')
    .sort((a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm))
    .slice(0, 3)

  const atividadeRecente = [...publicacoes]
    .sort((a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm))
    .slice(0, 4)

  const qtdEventos  = eventosProximos.length
  const qtdAcoes    = publicacoes.filter(p => p.tipo === 'Acao').length
  const qtdNoticias = publicacoes.filter(p => p.tipo === 'Noticia').length

  const novosEventos  = publicacoes.filter(p => p.tipo === 'Evento'  && new Date(p.publicadoEm) >= umaSemanaAtras).length
  const novasAcoes    = publicacoes.filter(p => p.tipo === 'Acao'    && new Date(p.publicadoEm) >= umaSemanaAtras).length
  const novosNoticias = publicacoes.filter(p => p.tipo === 'Noticia' && new Date(p.publicadoEm) >= umaSemanaAtras).length

  const tendEventos  = novosEventos  > 0 ? `${novosEventos} novo${novosEventos  !== 1 ? 's' : ''}`  : null
  const tendAcoes    = novasAcoes    > 0 ? `${novasAcoes} nova${novasAcoes    !== 1 ? 's' : ''}`    : null
  const tendNoticias = novosNoticias > 0 ? `${novosNoticias} nova${novosNoticias !== 1 ? 's' : ''}` : null

  return (
    <>
      {/* ══════════ MOBILE ══════════ */}
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden">
        <header className="px-[15px] py-[11px] flex items-center justify-between flex-shrink-0 border-b border-bdr2 bg-bg">
          <LogoPequena />
          <div className="flex items-center gap-2">
            <button className="w-[30px] h-[30px] bg-s2 rounded-[9px] flex items-center justify-center text-t2 relative cursor-pointer border-none hover:bg-s3" aria-label="Notificações">
              <IconeSino size={16} />
              <span className="w-[6px] h-[6px] bg-red rounded-full absolute top-[5px] right-[5px] border-[1.5px] border-bg" aria-hidden="true" />
            </button>
            <div className="w-[30px] h-[30px] bg-blue-grad rounded-[9px] flex items-center justify-center text-[11px] font-bold text-white tracking-[0.5px] flex-shrink-0 font-sans select-none">
              {iniciais}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto min-h-0 px-[13px] py-[11px] pb-4 scrollbar-hide">
          {/* Hero */}
          <div className="rounded-[14px] px-[15px] py-[13px] mb-3 relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, var(--blue-d) 0%, var(--blue) 55%, var(--blue-l) 100%)' }}>
            <div className="absolute -top-[22px] -right-[22px] w-20 h-20 rounded-full bg-white/[0.07] pointer-events-none" />
            <div className="absolute -bottom-[36px] right-2 w-[100px] h-[100px] rounded-full bg-white/[0.04] pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[9px] text-white/55 mb-0.5 capitalize">{obterDataHero()}</p>
                <p className="text-[14px] font-bold text-white">{obterSaudacao()}, Prof. {primeiroNome}</p>
              </div>
              <span className="bg-white/[0.15] rounded-[7px] px-2 py-[3px] text-[8px] font-bold text-white whitespace-nowrap">Docente</span>
            </div>
          </div>

          {/* Stats (3) */}
          <div className="flex gap-[6px] mb-[13px]">
            <CardEstatistica icon={<IconeCalendario size={13} />} iconCls="bg-[var(--blue-sub)] text-blue-l" n={carregando ? '—' : qtdEventos}  label="Eventos" />
            <CardEstatistica icon={<IconeRelampago />}            iconCls="bg-green/[0.12] text-green"       n={carregando ? '—' : qtdAcoes}     label="Ações" />
            <CardEstatistica icon={<IconeJornal />}               iconCls="bg-amber/[0.12] text-amber"       n={carregando ? '—' : qtdNoticias}  label="Notícias" />
          </div>

          {/* Próximos Eventos */}
          <div className="flex justify-between items-center mb-[9px]">
            <span className="text-[12px] font-bold text-t1">Próximos Eventos</span>
            <button className="text-[10px] font-semibold text-blue-l cursor-pointer bg-transparent border-none p-0 font-sans">Ver todos</button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-[14px] pb-0.5">
            {carregando ? (
              <p className="text-[10px] text-t3 py-2">Carregando...</p>
            ) : eventosProximos.length === 0 ? (
              <p className="text-[10px] text-t3 py-2">Nenhum evento próximo</p>
            ) : (
              eventosProximos.map(ev => (
                <CardEventoMobile
                  key={ev.id}
                  icon={<IconeCalendario size={22} />}
                  title={ev.titulo}
                  date={formatarDataEventoCurta(ev.data)}
                />
              ))
            )}
          </div>

          {/* Últimas Notícias */}
          <div className="flex justify-between items-center mb-[9px]">
            <span className="text-[12px] font-bold text-t1">Últimas Notícias</span>
            <button className="text-[10px] font-semibold text-blue-l cursor-pointer bg-transparent border-none p-0 font-sans">Ver todas</button>
          </div>
          {carregando ? (
            <p className="text-[10px] text-t3">Carregando...</p>
          ) : noticiasList.length === 0 ? (
            <p className="text-[10px] text-t3">Nenhuma notícia recente</p>
          ) : (
            noticiasList.map(n => (
              <CardNoticiaMobile
                key={n.id}
                icon={<IconeJornal />}
                tag="Notícia"
                tagColor="amber"
                title={n.titulo}
                time={formatarTempo(n.publicadoEm)}
              />
            ))
          )}
        </div>
      </div>

      {/* ══════════ DESKTOP ══════════ */}
      <div className="hidden md:block py-5 px-[22px]">
        {/* Topbar web */}
        <div className="flex items-center justify-between mb-[18px]">
          <p className="text-[19px] font-black text-t1">Início</p>
          <div className="flex items-center gap-[9px]">
            <div className="flex items-center gap-[7px] bg-s1 border-[1.5px] border-bdr rounded-[9px] px-3 py-[7px] text-[11px] text-t3 cursor-pointer hover:border-blue-l transition-colors">
              <IconeBusca /> <span>Buscar...</span>
            </div>
            <button className="w-[33px] h-[33px] bg-s1 border-[1.5px] border-bdr rounded-[9px] flex items-center justify-center text-t2 cursor-pointer relative flex-shrink-0" aria-label="Notificações">
              <IconeSino size={16} />
              <span className="w-[6px] h-[6px] bg-red rounded-full absolute top-[5px] right-[5px] border-[1.5px] border-bg" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Stats (4) */}
        <div className="flex gap-[10px] mb-[18px]">
          <CardEstatisticaWeb icon={<IconeCalendario size={16} />}  iconCls="bg-[var(--blue-sub)] text-blue-l" n={carregando ? '—' : qtdEventos}  label="Eventos próximos"    tendencia={tendEventos} />
          <CardEstatisticaWeb icon={<IconeRelampago size={16} />}   iconCls="bg-green/[0.12] text-green"       n={carregando ? '—' : qtdAcoes}     label="Ações registradas"   tendencia={tendAcoes} />
          <CardEstatisticaWeb icon={<IconeJornal size={16} />}      iconCls="bg-amber/[0.12] text-amber"       n={carregando ? '—' : qtdNoticias}  label="Notícias publicadas" tendencia={tendNoticias} />
          <CardEstatisticaWeb icon={<IconeUsuarios size={16} />}    iconCls="bg-[var(--blue-sub)] text-blue-l" n="—"                               label="Docentes ativos"     tendencia={null} />
        </div>

        {/* Grid 2 colunas */}
        <div className="grid grid-cols-2 gap-3">
          {/* Próximos Eventos */}
          <div className="bg-s1 border border-bdr rounded-[13px] p-[15px]">
            <div className="flex justify-between items-center mb-[13px]">
              <span className="text-[12px] font-bold text-t1">Próximos Eventos</span>
              <button className="text-[11px] font-semibold text-blue-l cursor-pointer bg-transparent border-none p-0 font-sans">Ver todos</button>
            </div>
            {carregando ? (
              <p className="text-[11px] text-t3">Carregando...</p>
            ) : eventosProximos.length === 0 ? (
              <p className="text-[11px] text-t3">Nenhum evento próximo</p>
            ) : (
              eventosProximos.map(ev => (
                <ItemEventoWeb
                  key={ev.id}
                  icon={<IconeCalendario size={16} />}
                  nome={ev.titulo}
                  meta={formatarDataEvento(ev.data, ev.local)}
                  tag="Evento"
                  corTag="blue"
                />
              ))
            )}
          </div>

          {/* Atividade recente */}
          <div className="bg-s1 border border-bdr rounded-[13px] p-[15px]">
            <div className="flex justify-between items-center mb-[13px]">
              <span className="text-[12px] font-bold text-t1">Atividade recente</span>
              <button className="text-[11px] font-semibold text-blue-l cursor-pointer bg-transparent border-none p-0 font-sans">Ver tudo</button>
            </div>
            {carregando ? (
              <p className="text-[11px] text-t3">Carregando...</p>
            ) : atividadeRecente.length === 0 ? (
              <p className="text-[11px] text-t3">Sem atividade recente</p>
            ) : (
              atividadeRecente.map((p, i) => (
                <ItemAtividadeWeb
                  key={p.id}
                  iniciais={getIniciais({ name: p.nomePublicadoPor })}
                  corAvatar={COR_AVATARES[i % COR_AVATARES.length]}
                  texto={<><b>{p.nomePublicadoPor}</b> {textoAtividadePorTipo(p.tipo)}</>}
                  tempo={formatarTempo(p.publicadoEm)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Sub-componentes mobile ── */

function CardEstatistica({ icon, iconCls, n, label }) {
  return (
    <div className="flex-1 bg-s1 border border-bdr rounded-[12px] p-[10px] px-[9px] flex flex-col gap-[3px]">
      <div className={clsx('w-6 h-6 rounded-[7px] flex items-center justify-center mb-0.5 flex-shrink-0', iconCls)}>{icon}</div>
      <span className="text-[18px] font-extrabold text-t1 leading-[1.1]">{n}</span>
      <span className="text-[8px] font-semibold text-t3">{label}</span>
    </div>
  )
}

function CardEventoMobile({ icon, badge, title, date }) {
  return (
    <div className="flex-shrink-0 w-[120px] bg-s1 border border-bdr rounded-[12px] overflow-hidden">
      <div className="w-full h-[58px] flex items-center justify-center relative text-icon"
           style={{ background: 'linear-gradient(135deg, var(--s2), var(--s3))' }}>
        {icon}
        {badge && (
          <span className={clsx(
            'absolute top-[7px] right-[7px] rounded-[5px] px-[7px] py-0.5 text-[8px] font-bold text-white',
            badge.color === 'blue'  && 'bg-blue',
            badge.color === 'green' && 'bg-green',
            badge.color === 'amber' && 'bg-amber',
          )}>{badge.label}</span>
        )}
      </div>
      <div className="px-[9px] py-2 pb-[10px]">
        <p className="text-[10px] font-semibold text-t1 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
        <p className="text-[9px] text-t3 flex items-center gap-[3px]"><IconeCalendario size={12} />{date}</p>
      </div>
    </div>
  )
}

function CardNoticiaMobile({ icon, tag, tagColor, title, time }) {
  return (
    <div className="bg-s1 border border-bdr rounded-[12px] p-[10px] flex gap-[9px] items-center mb-[7px]">
      <div className="w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center text-icon"
           style={{ background: 'linear-gradient(135deg, var(--s2), var(--s3))' }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={clsx(
          'text-[8px] font-bold tracking-[0.5px] uppercase mb-0.5',
          tagColor === 'blue'  && 'text-blue-l',
          tagColor === 'green' && 'text-green',
          tagColor === 'amber' && 'text-amber',
        )}>{tag}</p>
        <p className="text-[10px] font-semibold text-t1 leading-[1.3] mb-px whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
        <p className="text-[9px] text-t3 flex items-center gap-[3px]"><IconeRelogio />{time}</p>
      </div>
    </div>
  )
}

/* ── Sub-componentes desktop ── */

function CardEstatisticaWeb({ icon, iconCls, n, label, tendencia }) {
  return (
    <div className="flex-1 bg-s1 border border-bdr rounded-[13px] px-[13px] py-[14px]">
      <div className="flex justify-between items-center mb-[9px]">
        <div className={clsx('w-8 h-8 rounded-[9px] flex items-center justify-center', iconCls)}>{icon}</div>
        {tendencia && <span className="text-[10px] font-bold text-green flex items-center gap-[3px]"><IconeTendenciaAlta />{tendencia}</span>}
      </div>
      <p className="text-[24px] font-black text-t1">{n}</p>
      <p className="text-[10px] text-t3 mt-0.5">{label}</p>
    </div>
  )
}

function ItemEventoWeb({ icon, nome, meta, tag, corTag }) {
  return (
    <div className="flex items-center gap-[10px] py-[9px] border-b border-bdr2 last:border-b-0 last:pb-0">
      <div className="w-[34px] h-[34px] rounded-[9px] bg-[var(--blue-sub)] border border-[var(--blue-bdr)] flex items-center justify-center text-blue-l flex-shrink-0">
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="text-[11px] font-semibold text-t1 mb-0.5">{nome}</p>
        <p className="text-[10px] text-t3 flex items-center gap-[3px]"><IconeCalendario size={12} />{meta}</p>
      </div>
      <span className={clsx(
        'ml-auto flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-[20px] text-[8px] font-bold tracking-[0.3px] uppercase',
        corTag === 'blue'  && 'bg-[var(--blue-sub)] text-blue-l border border-[var(--blue-bdr)]',
        corTag === 'green' && 'bg-green/[0.1] text-green',
        corTag === 'amber' && 'bg-amber/[0.1] text-amber',
      )}>{tag}</span>
    </div>
  )
}

function ItemAtividadeWeb({ iniciais, corAvatar, texto, tempo }) {
  return (
    <div className="flex items-center gap-[9px] py-[9px] border-b border-bdr2 last:border-b-0">
      <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 font-sans"
           style={{ background: corAvatar }}>
        {iniciais}
      </div>
      <div>
        <p className="text-[10px] text-t1 leading-[1.4] [&_b]:text-blue-l [&_b]:font-semibold">{texto}</p>
        <p className="text-[9px] text-t3 mt-px">{tempo}</p>
      </div>
    </div>
  )
}

/* ── Logo topbar mobile ── */
function LogoPequena() {
  return (
    <img
      src={logoImg}
      alt="ADSerra"
      height={40}
      style={{ width: 'auto', display: 'block', userSelect: 'none' }}
      draggable={false}
    />
  )
}

/* ── Ícones (Lucide) ── */
const IC = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function IconeSino({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
}
function IconeCalendario({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
function IconeRelampago({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function IconeJornal({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
}
function IconeRelogio() {
  return <svg width="12" height="12" viewBox="0 0 24 24" {...IC}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IconeUsuarios({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconeBusca() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...IC}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
}
function IconeTendenciaAlta() {
  return <svg width="12" height="12" viewBox="0 0 24 24" {...IC}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
}
