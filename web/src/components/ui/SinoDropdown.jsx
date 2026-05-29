import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, GraduationCap, Newspaper, Bell, Info, CheckCheck, ChevronRight, Loader2 } from 'lucide-react'
import { useNotificacoes } from '../../contexts/NotificacoesContext'
import { notificacaoService } from '../../services/api'
import clsx from 'clsx'

const TIPO_META = {
  NovoEvento: { cor: 'blue',  Icon: Calendar      },
  Acao:       { cor: 'green', Icon: GraduationCap  },
  Noticia:    { cor: 'amber', Icon: Newspaper      },
  Aviso:      { cor: 'amber', Icon: Bell           },
  Sistema:    { cor: 'gray',  Icon: Info           },
}

function tempoAtras(dataStr) {
  const diff = Date.now() - new Date(dataStr).getTime()
  const min  = Math.floor(diff / 60_000)
  const h    = Math.floor(diff / 3_600_000)
  const d    = Math.floor(diff / 86_400_000)
  if (min < 1)  return 'agora'
  if (min < 60) return `${min}min`
  if (h   < 24) return `${h}h`
  if (d   < 7)  return `${d}d`
  return new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function SinoDropdown({ variant = 'icon' }) {
  const navigate = useNavigate()
  const { notificacoes, recarregar } = useNotificacoes()
  const [aberto, setAberto]         = useState(false)
  const [lista, setLista]           = useState([])
  const [carregando, setCarregando] = useState(false)
  const [marcando, setMarcando]     = useState(false)
  const ref = useRef(null)

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return
    const fechar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [aberto])

  const buscarLista = useCallback(async () => {
    setCarregando(true)
    try {
      const { data } = await notificacaoService.listar()
      setLista(data.slice(0, 6))
    } catch {
      // falha silenciosa
    } finally {
      setCarregando(false)
    }
  }, [])

  const toggle = () => {
    if (!aberto) buscarLista()
    setAberto(v => !v)
  }

  const marcarUma = async (notif) => {
    if (!notif.lida) {
      setLista(prev => prev.map(n => n.id === notif.id ? { ...n, lida: true } : n))
      try {
        await notificacaoService.marcarComoLida(notif.id)
        recarregar()
      } catch {
        setLista(prev => prev.map(n => n.id === notif.id ? { ...n, lida: false } : n))
      }
    }
    setAberto(false)
    if (notif.idPublicacao) navigate(`/eventos/${notif.idPublicacao}`)
  }

  const marcarTodas = async () => {
    setMarcando(true)
    try {
      await notificacaoService.marcarTodasComoLidas()
      setLista(prev => prev.map(n => ({ ...n, lida: true })))
      recarregar()
    } catch {
      // falha silenciosa
    } finally {
      setMarcando(false)
    }
  }

  const temNaoLidas = lista.some(n => !n.lida)

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      {/* ── Botão do sino ── */}
      {variant === 'sidebar' ? (
        /* Versão sidebar desktop */
        <button
          onClick={toggle}
          className={clsx(
            'flex items-center gap-[9px] w-full px-[10px] py-2 rounded-[10px] cursor-pointer text-[11px] font-semibold mb-px border-none font-sans text-left transition-all duration-[250ms] relative',
            aberto ? 'bg-[var(--blue-sub)] text-blue-l' : 'bg-transparent text-t2 hover:bg-s2 hover:text-t1'
          )}
        >
          <Bell size={14} strokeWidth={1.8} />
          <span className="flex-1">Notificações</span>
          {notificacoes > 0 && (
            <span className="ml-auto bg-red text-white rounded-[10px] px-[7px] py-px text-[9px] font-bold leading-[1.4]">
              {notificacoes > 99 ? '99+' : notificacoes}
            </span>
          )}
        </button>
      ) : (
        /* Versão ícone (mobile headers) */
        <button
          onClick={toggle}
          className="w-[30px] h-[30px] bg-s2 rounded-[9px] flex items-center justify-center text-t2 relative cursor-pointer border-none hover:bg-s3 transition-colors"
          aria-label="Notificações"
        >
          <Bell size={16} strokeWidth={1.8} />
          {notificacoes > 0 && (
            <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] bg-red rounded-full border-[1.5px] border-bg" />
          )}
        </button>
      )}

      {/* ── Dropdown ── */}
      {aberto && (
        <div className={clsx(
          'absolute z-[200] bg-s1 border border-bdr rounded-[14px] shadow-sh overflow-hidden',
          variant === 'sidebar'
            ? 'left-full ml-2 top-0 w-[320px]'
            : 'right-0 top-[38px] w-[300px]'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-[14px] py-[11px] border-b border-bdr">
            <p className="text-[12px] font-bold text-t1">Notificações</p>
            <div className="flex items-center gap-2">
              {temNaoLidas && (
                <button
                  onClick={marcarTodas}
                  disabled={marcando}
                  className="flex items-center gap-1 text-[9px] font-semibold text-t3 hover:text-blue-l transition-colors border-none bg-transparent cursor-pointer font-sans disabled:opacity-50"
                >
                  {marcando ? <Loader2 size={11} strokeWidth={1.8} className="animate-spin" /> : <CheckCheck size={11} strokeWidth={1.8} />}
                  Marcar todas
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-[340px] overflow-y-auto scrollbar-hide">
            {carregando ? (
              <div className="flex flex-col gap-[4px] p-[8px]">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-[60px] rounded-[10px] bg-s2 animate-pulse" />
                ))}
              </div>
            ) : lista.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-t3">
                <Bell size={24} strokeWidth={1.8} />
                <p className="text-[11px] font-medium">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="flex flex-col gap-[2px] p-[6px]">
                {lista.map(notif => {
                  const meta = TIPO_META[notif.tipo] ?? TIPO_META.Sistema
                  const { Icon, cor } = meta
                  return (
                    <button
                      key={notif.id}
                      onClick={() => marcarUma(notif)}
                      className={clsx(
                        'w-full text-left flex items-start gap-[10px] px-[10px] py-[9px] rounded-[10px] border-none cursor-pointer font-sans transition-all duration-[200ms]',
                        notif.lida ? 'bg-transparent hover:bg-s2' : 'bg-s2 hover:bg-s3'
                      )}
                    >
                      <div className={clsx(
                        'w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 mt-px',
                        cor === 'blue'  && 'bg-[var(--blue-sub)] text-blue-l',
                        cor === 'green' && 'bg-green/[0.1] text-green',
                        cor === 'amber' && 'bg-amber/[0.1] text-amber',
                        cor === 'gray'  && 'bg-s3 text-t3',
                      )}>
                        <Icon size={13} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={clsx(
                            'text-[11px] leading-snug truncate',
                            notif.lida ? 'font-medium text-t2' : 'font-bold text-t1'
                          )}>
                            {notif.titulo}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[9px] text-t3">{tempoAtras(notif.dataCriacao)}</span>
                            {!notif.lida && <span className="w-[6px] h-[6px] rounded-full bg-blue flex-shrink-0" />}
                          </div>
                        </div>
                        <p className="text-[10px] text-t3 mt-[1px] line-clamp-1">{notif.descricao}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-bdr px-[14px] py-[9px]">
            <button
              onClick={() => { setAberto(false); navigate('/notificacoes') }}
              className="w-full text-[10px] font-semibold text-blue-l hover:text-blue transition-colors border-none bg-transparent cursor-pointer font-sans flex items-center justify-center gap-1"
            >
              Ver todas as notificações <ChevronRight size={10} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

