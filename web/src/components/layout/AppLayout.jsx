import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/api'
import { useAprovacoesPendentes } from '../../contexts/AprovacoesPendentesContext'
import { useNotificacoes } from '../../contexts/NotificacoesContext'
import logoImg from '../../assets/adserra-logo.png'
import clsx from 'clsx'
import { Home, Calendar, Image, Send, User, Bell, LogOut, ClipboardList, Users, Shield } from 'lucide-react'

function getInitials(user) {
  const nome = user?.nomeCompleto || user?.name
  if (nome)
    return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
  if (user?.matricula) return user.matricula.slice(0, 2).toUpperCase()
  return 'P'
}

export default function AppLayout() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { user, isAdmin }  = useAuth()
  const { pendentes }    = useAprovacoesPendentes()
  const { notificacoes } = useNotificacoes()

  const isActive    = (path) => pathname === path
  const initials    = getInitials(user)
  const displayName = user?.matricula || user?.id || 'Usuário'

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignora erro */ }
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-bg">

      {/* ── Sidebar — desktop apenas ── */}
      <aside className="hidden md:flex md:flex-col md:w-72 md:flex-shrink-0 md:bg-sb-bg md:border-r md:border-bdr md:h-screen md:sticky md:top-0 md:px-[10px] md:py-[18px] md:overflow-y-auto md:scrollbar-hide">
        <div className="mb-[22px] px-[6px] flex-shrink-0">
          <LogoSidebar />
        </div>

        <div className="mb-[18px]">
          <span className="block text-[8px] font-bold tracking-[2px] uppercase text-t3 mb-[7px] px-2">Menu principal</span>
          <SbItem icon={<Home size={14} strokeWidth={1.8} />}          label="Início"   active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
          <SbItem icon={<Calendar size={14} strokeWidth={1.8} />}      label="Eventos"  active={isActive('/eventos')}   onClick={() => navigate('/eventos')} />
          <SbItem icon={<Image size={14} strokeWidth={1.8} />}         label="Galeria"  active={isActive('/galeria')}   onClick={() => navigate('/galeria')} />
          {isAdmin && (
            <SbItem icon={<Send size={14} strokeWidth={1.8} />}        label="Publicar" active={isActive('/publicar')}  onClick={() => navigate('/publicar')} />
          )}
          {isAdmin && (
            <SbItem icon={<ClipboardList size={14} strokeWidth={1.8} />} label="Aprovações"  active={isActive('/aprovar-cadastros')}  badge={pendentes > 0 ? String(pendentes) : undefined} onClick={() => navigate('/aprovar-cadastros')} />
          )}
          {isAdmin && (
            <SbItem icon={<Users size={14} strokeWidth={1.8} />}       label="Usuários"    active={isActive('/gerenciar-usuarios')} onClick={() => navigate('/gerenciar-usuarios')} />
          )}
        </div>

        <div className="mb-[18px]">
          <span className="block text-[8px] font-bold tracking-[2px] uppercase text-t3 mb-[7px] px-2">Conta</span>
          {!isAdmin && <SbItem icon={<User size={14} strokeWidth={1.8} />} label="Meu Perfil" active={isActive('/perfil')} onClick={() => navigate('/perfil')} />}
          <SbItem icon={<Bell size={14} strokeWidth={1.8} />}   label="Notificações" active={isActive('/notificacoes')} badgeRed={notificacoes > 0 ? String(notificacoes) : undefined} onClick={() => navigate('/notificacoes')} />
          <SbItem icon={<LogOut size={14} strokeWidth={1.8} />} label="Sair" active={false} onClick={handleLogout} danger />
        </div>

        <div className="mt-auto px-[10px] py-[10px] bg-s2 rounded-[11px] border border-bdr flex items-center gap-[9px] flex-shrink-0">
          {isAdmin ? (
            <div className="w-8 h-8 rounded-[9px] bg-red/[0.15] flex items-center justify-center flex-shrink-0 text-red">
              <Shield size={15} strokeWidth={1.8} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-[9px] bg-blue-grad flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 font-sans">
              {initials}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p className="text-[11px] font-bold text-t1 whitespace-nowrap overflow-hidden text-ellipsis">{displayName}</p>
            <p className={`text-[9px] ${isAdmin ? 'text-red font-semibold' : 'text-t3'}`}>
              {isAdmin ? 'Administrador' : 'Docente'}
            </p>
          </div>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <main className="flex-1 flex flex-col min-w-0 pb-[60px] md:h-screen md:overflow-y-auto md:pb-0 md:scrollbar-thin">
        <Outlet />
      </main>

      {/* ── Bottom nav — mobile apenas ── */}
      <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-nav-bg backdrop-blur-[14px] border-t border-bdr flex items-center justify-around px-1 pb-[6px] z-50 md:hidden"
           aria-label="Navegação principal">
        <NavItem icon={<Home size={20} strokeWidth={1.8} />}          label="Início"   active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
        <NavItem icon={<Calendar size={20} strokeWidth={1.8} />}      label="Eventos"  active={isActive('/eventos')}   onClick={() => navigate('/eventos')} />
        <NavItem icon={<Image size={20} strokeWidth={1.8} />}         label="Galeria"  active={isActive('/galeria')}   onClick={() => navigate('/galeria')} />
        {isAdmin && <NavItem icon={<Send size={20} strokeWidth={1.8} />} label="Publicar" active={isActive('/publicar')} onClick={() => navigate('/publicar')} />}
        {isAdmin
          ? <>
              <NavItem icon={<ClipboardList size={20} strokeWidth={1.8} />} label="Aprovações" active={isActive('/aprovar-cadastros')} badge={pendentes > 0 ? String(pendentes) : undefined} onClick={() => navigate('/aprovar-cadastros')} />
              <NavItem icon={<Users size={20} strokeWidth={1.8} />}         label="Usuários"   active={isActive('/gerenciar-usuarios')} onClick={() => navigate('/gerenciar-usuarios')} />
            </>
          : <NavItem icon={<User size={20} strokeWidth={1.8} />} label="Perfil" active={isActive('/perfil')} onClick={() => navigate('/perfil')} />
        }
      </nav>

    </div>
  )
}

/* ── Sub-componentes ── */

function SbItem({ icon, label, active, badge, badgeRed, onClick, danger }) {
  return (
    <button
      className={clsx(
        'flex items-center gap-[9px] w-full px-[10px] py-2 rounded-[10px] cursor-pointer text-[11px] font-semibold mb-px border-none font-sans text-left transition-all duration-[250ms]',
        danger  ? 'bg-transparent text-red hover:bg-red/[0.08]' :
        active  ? 'bg-[var(--blue-sub)] text-blue-l' :
                  'bg-transparent text-t2 hover:bg-s2 hover:text-t1'
      )}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge    && <span className="ml-auto bg-blue text-white rounded-[10px] px-[7px] py-px text-[9px] font-bold leading-[1.4]">{badge}</span>}
      {badgeRed && <span className="ml-auto bg-red text-white rounded-[10px] px-[7px] py-px text-[9px] font-bold leading-[1.4]">{badgeRed}</span>}
    </button>
  )
}

function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <button
      className={clsx(
        'flex flex-col items-center gap-[3px] px-[14px] py-[5px] rounded-[10px] cursor-pointer border-none font-sans transition-all duration-[250ms] min-w-[48px]',
        active ? 'bg-[var(--blue-sub)] text-blue-l' : 'bg-transparent text-t3 hover:text-t2'
      )}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="relative flex items-center justify-center">
        {icon}
        {badge && (
          <span className="absolute -top-[5px] -right-[7px] bg-amber text-white rounded-[10px] min-w-[14px] h-[14px] text-[8px] font-bold flex items-center justify-center px-[3px] font-sans leading-none">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[9px] font-bold leading-none">{label}</span>
    </button>
  )
}

/* ── Logo sidebar ── */
function LogoSidebar() {
  return (
    <img
      src={logoImg}
      alt="ADSerra"
      className="w-full h-auto block select-none"
      draggable={false}
    />
  )
}

