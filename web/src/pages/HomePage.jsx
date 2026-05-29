import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Bell, Calendar, Zap, Newspaper, Clock, Users, Search, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getIniciais } from '../utils/usuario'
import logoImg from '../assets/adserra-logo.png'
import { publicacaoService, usuariosService } from '../services/api'
import MenuAvatar from '../components/ui/MenuAvatar'
import SinoDropdown from '../components/ui/SinoDropdown'


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

function labelAtividadePorTipo(tipo) {
  switch (tipo) {
    case 'Evento':  return 'Novo evento publicado'
    case 'Acao':    return 'Nova ação registrada'
    case 'Noticia': return 'Nova notícia publicada'
    case 'Aviso':   return 'Novo aviso publicado'
    default:        return 'Nova publicação'
  }
}

function rotaPorId(id) {
  return `/eventos/${id}`
}

function iconePorTipo(tipo) {
  switch (tipo) {
    case 'Evento':  return <Calendar size={14} strokeWidth={1.8} />
    case 'Acao':    return <Zap size={14} strokeWidth={1.8} />
    case 'Noticia': return <Newspaper size={14} strokeWidth={1.8} />
    case 'Aviso':   return <Bell size={14} strokeWidth={1.8} />
    default:        return <Newspaper size={14} strokeWidth={1.8} />
  }
}

function corIconePorTipo(tipo) {
  switch (tipo) {
    case 'Evento':  return 'bg-[var(--blue-sub)] text-blue-l'
    case 'Acao':    return 'bg-green/[0.12] text-green'
    case 'Noticia': return 'bg-amber/[0.12] text-amber'
    case 'Aviso':   return 'bg-red/[0.10] text-red'
    default:        return 'bg-[var(--blue-sub)] text-blue-l'
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
  const { user, isAdmin } = useAuth()
  const iniciais  = getIniciais(user)
  const primeiroNome = user?.nomeCompleto ? user.nomeCompleto.split(' ')[0] : 'Professor'

  const [publicacoes, setPublicacoes] = useState([])
  const [qtdDocentes, setQtdDocentes] = useState(null)
  const [carregando, setCarregando]   = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await publicacaoService.listar({ Publicas: true })
        setPublicacoes(Array.isArray(res.data) ? res.data : [])
      } catch {}

      if (isAdmin) {
        try {
          const res = await usuariosService.listar()
          setQtdDocentes(Array.isArray(res.data) ? res.data.length : 0)
        } catch {}
      }

      setCarregando(false)
    }
    carregar()
  }, [isAdmin])

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
          <MenuAvatar />
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
            <CardEstatistica icon={<Calendar size={13} strokeWidth={1.8} />} iconCls="bg-[var(--blue-sub)] text-blue-l" n={carregando ? '—' : qtdEventos}  label="Eventos" />
            <CardEstatistica icon={<Zap size={13} strokeWidth={1.8} />}      iconCls="bg-green/[0.12] text-green"       n={carregando ? '—' : qtdAcoes}     label="Ações" />
            <CardEstatistica icon={<Newspaper size={13} strokeWidth={1.8} />} iconCls="bg-amber/[0.12] text-amber"       n={carregando ? '—' : qtdNoticias}  label="Notícias" />
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
                  id={ev.id}
                  icon={<Calendar size={22} strokeWidth={1.8} />}
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
                icon={<Newspaper size={13} strokeWidth={1.8} />}
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
          <SinoDropdown />
        </div>

        {/* Stats (4) */}
        <div className="flex gap-[10px] mb-[18px]">
          <CardEstatisticaWeb icon={<Calendar size={16} strokeWidth={1.8} />}  iconCls="bg-[var(--blue-sub)] text-blue-l" n={carregando ? '—' : qtdEventos}  label="Eventos próximos"    tendencia={tendEventos} />
          <CardEstatisticaWeb icon={<Zap size={16} strokeWidth={1.8} />}       iconCls="bg-green/[0.12] text-green"       n={carregando ? '—' : qtdAcoes}     label="Ações registradas"   tendencia={tendAcoes} />
          <CardEstatisticaWeb icon={<Newspaper size={16} strokeWidth={1.8} />} iconCls="bg-amber/[0.12] text-amber"       n={carregando ? '—' : qtdNoticias}  label="Notícias publicadas" tendencia={tendNoticias} />
          {isAdmin && <CardEstatisticaWeb icon={<Users size={16} strokeWidth={1.8} />} iconCls="bg-[var(--blue-sub)] text-blue-l" n={carregando ? '—' : qtdDocentes ?? '—'} label="Docentes ativos" tendencia={null} />}
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
                  id={ev.id}
                  icon={<Calendar size={16} strokeWidth={1.8} />}
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
              atividadeRecente.map((p) => (
                <ItemAtividadeWeb
                  key={p.id}
                  icone={iconePorTipo(p.tipo)}
                  iconeCls={corIconePorTipo(p.tipo)}
                  label={labelAtividadePorTipo(p.tipo)}
                  titulo={p.titulo}
                  rota={rotaPorId(p.id)}
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

function CardEventoMobile({ icon, badge, title, date, id }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(`/eventos/${id}`)} className="flex-shrink-0 w-[120px] bg-s1 border border-bdr rounded-[12px] overflow-hidden text-left cursor-pointer font-sans hover:brightness-95 transition-all duration-200">
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
        <p className="text-[10px] font-semibold text-blue-l mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
        <p className="text-[9px] text-t3 flex items-center gap-[3px]"><Calendar size={12} strokeWidth={1.8} />{date}</p>
      </div>
    </button>
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
        <p className="text-[9px] text-t3 flex items-center gap-[3px]"><Clock size={12} strokeWidth={1.8} />{time}</p>
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
        {tendencia && <span className="text-[10px] font-bold text-green flex items-center gap-[3px]"><TrendingUp size={12} strokeWidth={1.8} />{tendencia}</span>}
      </div>
      <p className="text-[24px] font-black text-t1">{n}</p>
      <p className="text-[10px] text-t3 mt-0.5">{label}</p>
    </div>
  )
}

function ItemEventoWeb({ icon, nome, meta, tag, corTag, id }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-[10px] py-[9px] border-b border-bdr2 last:border-b-0 last:pb-0">
      <div className="w-[34px] h-[34px] rounded-[9px] bg-[var(--blue-sub)] border border-[var(--blue-bdr)] flex items-center justify-center text-blue-l flex-shrink-0">
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <button onClick={() => navigate(`/eventos/${id}`)} className="text-[11px] font-semibold text-blue-l bg-transparent border-none p-0 cursor-pointer font-sans text-left whitespace-nowrap overflow-hidden text-ellipsis max-w-full block mb-0.5 hover:opacity-75 transition-opacity">
          {nome}
        </button>
        <p className="text-[10px] text-t3 flex items-center gap-[3px]"><Calendar size={12} strokeWidth={1.8} />{meta}</p>
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

function ItemAtividadeWeb({ icone, iconeCls, label, titulo, rota, tempo }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-[9px] py-[9px] border-b border-bdr2 last:border-b-0">
      <div className={clsx('w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0', iconeCls)}>
        {icone}
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="text-[10px] text-t2 leading-[1.4]">{label}</p>
        <button
          onClick={() => navigate(rota)}
          className="text-[10px] font-semibold text-blue-l bg-transparent border-none p-0 cursor-pointer font-sans text-left whitespace-nowrap overflow-hidden text-ellipsis max-w-full block hover:opacity-75 transition-opacity"
        >
          {titulo}
        </button>
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
      className="h-20 w-auto block select-none"
      draggable={false}
    />
  )
}

