import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAprovacoesPendentes } from '../../contexts/AprovacoesPendentesContext'
import logoImg from '../../assets/adserra-logo.png'
import './AppLayout.css'

function getInitials(user) {
  if (user?.name) {
    return user.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
  }
  if (user?.matricula) return user.matricula.slice(0, 2)
  return 'P'
}

export default function AppLayout() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { user, isAdmin } = useAuth()
  const { pendentes }     = useAprovacoesPendentes()

  const isActive    = (path) => pathname === path
  const initials    = getInitials(user)
  const displayName = user?.matricula || user?.id || 'Usuário'

  return (
    <div className="app-root">

      {/* ── Sidebar — desktop apenas ── */}
      <aside className="app-sidebar">
        <div className="sb-logo">
          <LogoSidebar />
        </div>

        <div className="sb-sec">
          <div className="sb-sec-lbl">Menu principal</div>
          <SbItem icon={<HomeIcon />}     label="Início"   active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
          <SbItem icon={<CalendarIcon />} label="Eventos"  active={isActive('/eventos')}   badge="3"           onClick={() => navigate('/eventos')} />
          <SbItem icon={<ImageIcon />}    label="Galeria"  active={isActive('/galeria')}   onClick={() => navigate('/galeria')} />
          <SbItem icon={<SendIcon />}     label="Publicar" active={isActive('/publicar')}  onClick={() => navigate('/publicar')} />
          {isAdmin && (
            <SbItem icon={<ClipboardIcon />} label="Aprovações" active={isActive('/aprovar-cadastros')} badge={pendentes > 0 ? String(pendentes) : undefined} onClick={() => navigate('/aprovar-cadastros')} />
          )}
        </div>

        <div className="sb-sec">
          <div className="sb-sec-lbl">Conta</div>
          <SbItem icon={<UserIcon />}     label="Meu Perfil"    active={isActive('/perfil')}        onClick={() => navigate('/perfil')} />
          <SbItem icon={<BellIcon />}     label="Notificações"  active={isActive('/notificacoes')}  badgeRed="2" onClick={() => navigate('/notificacoes')} />
          <SbItem icon={<SettingsIcon />} label="Configurações" active={isActive('/configuracoes')} onClick={() => navigate('/configuracoes')} />
        </div>

        <div className="sb-user">
          <div className="sb-av">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <p className="sb-name">{displayName}</p>
            <p className="sb-role">Docente</p>
          </div>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* ── Bottom nav — mobile apenas ── */}
      <nav className="app-bnav" aria-label="Navegação principal">
        <NavItem icon={<HomeIcon lg />}     label="Início"   active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
        <NavItem icon={<CalendarIcon lg />} label="Eventos"  active={isActive('/eventos')}   onClick={() => navigate('/eventos')} />
        <NavItem icon={<ImageIcon lg />}    label="Galeria"  active={isActive('/galeria')}   onClick={() => navigate('/galeria')} />
        <NavItem icon={<SendIcon lg />}     label="Publicar" active={isActive('/publicar')}  onClick={() => navigate('/publicar')} />
        {isAdmin
          ? <NavItem icon={<ClipboardIcon lg />} label="Aprovações" active={isActive('/aprovar-cadastros')} badge={pendentes > 0 ? String(pendentes) : undefined} onClick={() => navigate('/aprovar-cadastros')} />
          : <NavItem icon={<UserIcon lg />}      label="Perfil"     active={isActive('/perfil')}            onClick={() => navigate('/perfil')} />
        }
      </nav>

    </div>
  )
}

/* ── Sub-componentes ── */

function SbItem({ icon, label, active, badge, badgeRed, onClick }) {
  return (
    <button
      className={`sb-item${active ? ' sb-item--active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span className="sb-item-label">{label}</span>
      {badge    && <span className="sb-badge">{badge}</span>}
      {badgeRed && <span className="sb-badge sb-badge--red">{badgeRed}</span>}
    </button>
  )
}

function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <button
      className={`app-ni${active ? ' app-ni--active' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="app-ni-ico">
        {icon}
        {badge && <span className="app-ni-dot">{badge}</span>}
      </span>
      <span className="app-ni-l">{label}</span>
    </button>
  )
}

/* ── Logo sidebar ── */
function LogoSidebar() {
  return (
    <img
      src={logoImg}
      alt="ADSerra"
      style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
      draggable={false}
    />
  )
}

/* ── Ícones (Lucide) — prop `lg` duplica o tamanho para a bottom nav ── */
const IC = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function HomeIcon({ lg }) {
  const s = lg ? 20 : 14
  return <svg width={s} height={s} viewBox="0 0 24 24" {...IC}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function CalendarIcon({ lg }) {
  const s = lg ? 20 : 14
  return <svg width={s} height={s} viewBox="0 0 24 24" {...IC}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
function ImageIcon({ lg }) {
  const s = lg ? 20 : 14
  return <svg width={s} height={s} viewBox="0 0 24 24" {...IC}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
}
function SendIcon({ lg }) {
  const s = lg ? 20 : 14
  return <svg width={s} height={s} viewBox="0 0 24 24" {...IC}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
}
function UserIcon({ lg }) {
  const s = lg ? 20 : 14
  return <svg width={s} height={s} viewBox="0 0 24 24" {...IC}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function BellIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" {...IC}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
}
function SettingsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" {...IC}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
}
function ClipboardIcon({ lg }) {
  const s = lg ? 20 : 14
  return <svg width={s} height={s} viewBox="0 0 24 24" {...IC}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
}
