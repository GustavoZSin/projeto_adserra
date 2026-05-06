import { useAuth } from '../contexts/AuthContext'
import './HomePage.css'

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getHeroDate() {
  const raw = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function getInitials(user) {
  if (user?.name) {
    return user.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
  }
  return 'P'
}

/* ═══════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════ */
export default function HomePage() {
  const { user } = useAuth()
  const initials  = getInitials(user)
  const firstName = user?.name ? user.name.split(' ')[0] : 'Professor'

  return (
    <>
      {/* ══════════ MOBILE ══════════ */}
      <div className="home-mobile">
        <header className="home-topbar">
          <LogoSmall />
          <div className="home-tb-r">
            <button className="home-tb-btn" aria-label="Notificações">
              <BellIcon size={16} />
              <span className="home-ndot" aria-hidden="true" />
            </button>
            <div className="home-avatar">{initials}</div>
          </div>
        </header>

        <div className="home-scroll">
          {/* Hero */}
          <div className="home-hero">
            <div className="home-hero-inner">
              <div>
                <p className="home-hero-date">{getHeroDate()}</p>
                <p className="home-hero-name">{getGreeting()}, Prof. {firstName}</p>
              </div>
              <span className="home-hero-badge">Docente</span>
            </div>
          </div>

          {/* Stats (3) */}
          <div className="home-stats-row">
            <StatCard icon={<CalendarIcon size={13} />} cls="home-ico-b" n="2"  label="Eventos" />
            <StatCard icon={<ZapIcon />}                cls="home-ico-g" n="12" label="Ações" />
            <StatCard icon={<NewspaperIcon />}          cls="home-ico-a" n="5"  label="Notícias" />
          </div>

          {/* Próximos Eventos */}
          <div className="home-sec">
            <span className="home-sec-t">Próximos Eventos</span>
            <button className="home-sec-l">Ver todos</button>
          </div>
          <div className="home-events-row">
            <MobileEventCard icon={<LandmarkIcon size={22} />} badge={{ label: 'Em breve', cls: 'home-badge-blue' }} title="Evento 2 FSG"      date="26.04.2025" />
            <MobileEventCard icon={<GradCapIcon size={22} />}  badge={{ label: 'Novo',     cls: 'home-badge-green' }} title="Semana Acadêmica" date="30.04.2025" />
            <MobileEventCard icon={<MicIcon size={22} />}                                                             title="Palestra STEM"    date="05.05.2025" />
          </div>

          {/* Últimas Notícias */}
          <div className="home-sec">
            <span className="home-sec-t">Últimas Notícias</span>
            <button className="home-sec-l">Ver todas</button>
          </div>
          <MobileNewsCard icon={<MegaphoneIcon />} tag="Institucional" tagCls="home-ncard-tag--blue"  title="Novidades no calendário acadêmico 2025"  time="Hoje · 09:30" />
          <MobileNewsCard icon={<AwardIcon />}     tag="Destaque"      tagCls="home-ncard-tag--green" title="FSG conquista prêmio regional de ensino"  time="Ontem · 14:15" />
          <MobileNewsCard icon={<BookOpenIcon />}  tag="Pesquisa"      tagCls="home-ncard-tag--amber" title="Inscrições para iniciação científica"      time="22/04 · 10:00" />
        </div>
      </div>

      {/* ══════════ DESKTOP ══════════ */}
      <div className="home-desktop">
        {/* Topbar web */}
        <div className="home-web-tb">
          <p className="home-web-title">Início</p>
          <div className="home-web-tb-r">
            <div className="home-web-search">
              <SearchIcon /> <span>Buscar...</span>
            </div>
            <button className="home-web-notif" aria-label="Notificações">
              <BellIcon size={16} />
              <span className="home-ndot" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Stats (4) */}
        <div className="home-web-stats">
          <WebStatCard icon={<CalendarIcon size={16} />} cls="ico-b" n="2"  label="Eventos próximos"   trend="2 novos" />
          <WebStatCard icon={<ZapIcon size={16} />}      cls="ico-g" n="12" label="Ações registradas"  trend="5 novas" />
          <WebStatCard icon={<NewspaperIcon size={16} />} cls="ico-a" n="5"  label="Notícias publicadas" trend="3 novas" />
          <WebStatCard icon={<UsersIcon size={16} />}    cls="ico-b" n="48" label="Docentes ativos"    trend="+1 novo" />
        </div>

        {/* Grid 2 colunas */}
        <div className="home-web-grid">
          {/* Próximos Eventos */}
          <div className="home-web-panel">
            <div className="home-wp-hd">
              <span className="home-wp-t">Próximos Eventos</span>
              <button className="home-wp-l">Ver todos</button>
            </div>
            <WebEventItem icon={<LandmarkIcon size={16} />} name="Evento 2 FSG"      meta="26 de Abril · Campus Sede" tag="Evento"    tagCls="tag-blue" />
            <WebEventItem icon={<GradCapIcon size={16} />}  name="Semana Acadêmica"  meta="30 de Abril · Auditório"  tag="Acadêmico" tagCls="tag-green" />
            <WebEventItem icon={<MicIcon size={16} />}      name="Palestra STEM"     meta="05 de Maio · Sala 201"    tag="Palestra"  tagCls="tag-amber" />
          </div>

          {/* Atividade recente */}
          <div className="home-web-panel">
            <div className="home-wp-hd">
              <span className="home-wp-t">Atividade recente</span>
              <button className="home-wp-l">Ver tudo</button>
            </div>
            <WebActivityItem av="DC" avColor="linear-gradient(135deg,var(--blue-d),var(--blue-l))" text={<><b>Davi Chidem</b> publicou um novo evento</>}           time="Há 2 horas" />
            <WebActivityItem av="MA" avColor="linear-gradient(135deg,#10B981,#059669)"              text={<><b>Maria A.</b> adicionou fotos à galeria</>}            time="Há 4 horas" />
            <WebActivityItem av="JB" avColor="linear-gradient(135deg,#F59E0B,#D97706)"              text={<><b>João B.</b> publicou uma notícia</>}                  time="Ontem · 14:30" />
            <WebActivityItem av="ADM" avColor="linear-gradient(135deg,#EF4444,#DC2626)"             text={<><b>Administrador</b> aprovou solicitação de ingresso</>} time="Ontem · 10:00" />
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Sub-componentes mobile ── */

function StatCard({ icon, cls, n, label }) {
  return (
    <div className="home-stat">
      <div className={`home-stat-ico ${cls}`}>{icon}</div>
      <span className="home-stat-n">{n}</span>
      <span className="home-stat-l">{label}</span>
    </div>
  )
}

function MobileEventCard({ icon, badge, title, date }) {
  return (
    <div className="home-ecard">
      <div className="home-ecard-img">
        {icon}
        {badge && <span className={`home-badge ${badge.cls}`}>{badge.label}</span>}
      </div>
      <div className="home-ecard-body">
        <p className="home-ecard-title">{title}</p>
        <p className="home-ecard-date"><CalendarIcon size={12} />{date}</p>
      </div>
    </div>
  )
}

function MobileNewsCard({ icon, tag, tagCls, title, time }) {
  return (
    <div className="home-ncard">
      <div className="home-ncard-img">{icon}</div>
      <div className="home-ncard-body">
        <p className={`home-ncard-tag ${tagCls}`}>{tag}</p>
        <p className="home-ncard-title">{title}</p>
        <p className="home-ncard-date"><ClockIcon />{time}</p>
      </div>
    </div>
  )
}

/* ── Sub-componentes desktop ── */

function WebStatCard({ icon, cls, n, label, trend }) {
  return (
    <div className="home-wstat">
      <div className="home-wstat-top">
        <div className={`home-wstat-ico ${cls}`}>{icon}</div>
        <span className="home-wstat-trend"><TrendingUpIcon />{trend}</span>
      </div>
      <p className="home-wstat-n">{n}</p>
      <p className="home-wstat-l">{label}</p>
    </div>
  )
}

function WebEventItem({ icon, name, meta, tag, tagCls }) {
  return (
    <div className="home-wev-item">
      <div className="home-wev-dot">{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p className="home-wev-name">{name}</p>
        <p className="home-wev-meta"><CalendarIcon size={12} />{meta}</p>
      </div>
      <span className={`home-tag ${tagCls}`}>{tag}</span>
    </div>
  )
}

function WebActivityItem({ av, avColor, text, time }) {
  return (
    <div className="home-wact-item">
      <div className="home-wact-av" style={{ background: avColor }}>{av}</div>
      <div>
        <p className="home-wact-txt">{text}</p>
        <p className="home-wact-time">{time}</p>
      </div>
    </div>
  )
}

/* ── Logo topbar mobile ── */
function LogoSmall() {
  return (
    <svg width="80" height="22" viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg" aria-label="ADSerra">
      <text x="0" y="32" fontFamily="Georgia,serif" fontSize="35" fontWeight="700" fill="var(--logo-ad)" style={{ transition: 'fill .35s' }}>AD</text>
      <text x="55" y="32" fontFamily="Georgia,serif" fontSize="35" fontWeight="700" fill="#1B70B0">Serra</text>
      <g transform="translate(138,0) scale(0.22)">
        <path d="M28,4 L58,2 L82,10 L98,20 L106,36 L112,52 L108,70 L96,84 L78,96 L58,104 L36,102 L18,92 L6,76 L2,56 L4,36 L12,18 Z" fill="#1B70B0" opacity=".9"/>
        <line x1="28" y1="4"  x2="108" y2="70" stroke="white" strokeWidth="7" opacity=".7"/>
        <line x1="2"  y1="56" x2="112" y2="52" stroke="white" strokeWidth="7" opacity=".7"/>
        <line x1="58" y1="2"  x2="58"  y2="104" stroke="white" strokeWidth="7" opacity=".7"/>
        <circle cx="57" cy="52" r="9" fill="white" opacity=".9"/>
      </g>
    </svg>
  )
}

/* ── Ícones (Lucide) ── */
const IC = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function BellIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
}
function CalendarIcon({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
function ZapIcon({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function NewspaperIcon({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
}
function LandmarkIcon({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
}
function GradCapIcon({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
}
function MicIcon({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
}
function MegaphoneIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...IC}><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg>
}
function AwardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...IC}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
}
function BookOpenIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...IC}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
function ClockIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" {...IC}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function UsersIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function SearchIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...IC}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
}
function TrendingUpIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" {...IC}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
}
