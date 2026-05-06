import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import './AppLayout.css'

export default function AppLayout() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="app-root">
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="app-bnav" aria-label="Navegação principal">
        <NavItem icon={<HomeIcon />}     label="Início"   active={pathname === '/dashboard'} onClick={() => navigate('/dashboard')} />
        <NavItem icon={<CalendarIcon />} label="Eventos"  active={pathname === '/eventos'}   onClick={() => navigate('/eventos')} />
        <NavItem icon={<ImageIcon />}    label="Galeria"  active={pathname === '/galeria'}   onClick={() => navigate('/galeria')} />
        <NavItem icon={<SendIcon />}     label="Publicar" active={pathname === '/publicar'}  onClick={() => navigate('/publicar')} />
        <NavItem icon={<UserIcon />}     label="Perfil"   active={pathname === '/perfil'}    onClick={() => navigate('/perfil')} />
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      className={`app-ni${active ? ' app-ni--active' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span className="app-ni-l">{label}</span>
    </button>
  )
}

/* ── Icons (Lucide) ── */
const IC = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...IC}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...IC}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...IC}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...IC}>
      <path d="m22 2-7 20-4-9-9-4Z"/>
      <path d="M22 2 11 13"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...IC}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
