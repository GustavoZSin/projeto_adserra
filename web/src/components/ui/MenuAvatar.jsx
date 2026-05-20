import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getIniciais } from '../../utils/usuario'
import { authService } from '../../services/api'
import SinoDropdown from './SinoDropdown'

export default function MenuAvatar() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const iniciais    = getIniciais(user)
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const fechar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [aberto])

  const handleLogout = async () => {
    setAberto(false)
    try { await authService.logout() } catch { /* ignora */ }
    navigate('/login')
  }

  return (
    <div className="flex items-center gap-2">
    <SinoDropdown />
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        className="w-[30px] h-[30px] bg-blue-grad rounded-[9px] flex items-center justify-center text-[11px] font-bold text-white tracking-[0.5px] font-sans select-none cursor-pointer border-none"
        onClick={() => setAberto(v => !v)}
        aria-label="Menu do usuário"
      >
        {iniciais}
      </button>

      {aberto && (
        <div className="absolute right-0 top-[36px] w-[160px] bg-s1 border border-bdr rounded-[12px] shadow-sh z-[100] overflow-hidden">
          <button
            className="flex items-center gap-[8px] w-full px-3 py-[10px] text-[11px] font-semibold text-t2 hover:bg-s2 transition-colors border-none bg-transparent font-sans cursor-pointer text-left border-b border-bdr"
            onClick={() => { setAberto(false); navigate('/perfil') }}
          >
            <IconeUsuario /> Meu Perfil
          </button>
          <button
            className="flex items-center gap-[8px] w-full px-3 py-[10px] text-[11px] font-semibold text-red hover:bg-red/[0.08] transition-colors border-none bg-transparent font-sans cursor-pointer text-left"
            onClick={handleLogout}
          >
            <IconeSair /> Sair
          </button>
        </div>
      )}
    </div>
    </div>
  )
}

const IC = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }
function IconeUsuario() { return <svg width="13" height="13" viewBox="0 0 24 24" {...IC}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function IconeSair()    { return <svg width="13" height="13" viewBox="0 0 24 24" {...IC}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg> }
