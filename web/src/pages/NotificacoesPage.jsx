import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Calendar, GraduationCap, Newspaper, Info, ChevronRight, CheckCheck, Loader2 } from 'lucide-react'
import { notificacaoService } from '../services/api'
import { useNotificacoes } from '../contexts/NotificacoesContext'
import clsx from 'clsx'

const FILTROS = [
  { label: 'Todas',     valor: undefined     },
  { label: 'Não lidas', valor: 'nao-lidas'   },
  { label: 'Lidas',     valor: 'lidas'       },
]

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
  if (min < 1)  return 'agora mesmo'
  if (min < 60) return `há ${min} min`
  if (h   < 24) return `há ${h}h`
  if (d   < 7)  return `há ${d} dia${d > 1 ? 's' : ''}`
  return new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function NotificacoesPage() {
  const navigate = useNavigate()
  const { recarregar } = useNotificacoes()

  const [lista, setLista]               = useState([])
  const [carregando, setCarregando]     = useState(true)
  const [filtro, setFiltro]             = useState(FILTROS[0])
  const [marcandoTodas, setMarcandoTodas] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const { data } = await notificacaoService.listar(filtro.valor)
      setLista(data)
    } catch {
      // falha silenciosa
    } finally {
      setCarregando(false)
    }
  }, [filtro])

  useEffect(() => { carregar() }, [carregar])

  const marcarUma = async (notif) => {
    if (!notif.lida) {
      // optimistic update
      setLista(prev => prev.map(n => n.id === notif.id ? { ...n, lida: true } : n))
      try {
        await notificacaoService.marcarComoLida(notif.id)
        recarregar()
      } catch {
        setLista(prev => prev.map(n => n.id === notif.id ? { ...n, lida: false } : n))
      }
    }
    if (notif.idPublicacao) navigate(`/eventos/${notif.idPublicacao}`)
  }

  const marcarTodas = async () => {
    setMarcandoTodas(true)
    try {
      await notificacaoService.marcarTodasComoLidas()
      setLista(prev => prev.map(n => ({ ...n, lida: true })))
      recarregar()
    } catch {
      // falha silenciosa
    } finally {
      setMarcandoTodas(false)
    }
  }

  const temNaoLidas = lista.some(n => !n.lida)

  return (
    <>
      {/* ══ MOBILE ══ */}
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden">
        <header className="flex-shrink-0 px-[15px] pt-[13px] pb-[10px] border-b border-bdr2 bg-bg flex items-center justify-between">
          <p className="text-[16px] font-extrabold text-t1">Notificações</p>
          {temNaoLidas && (
            <BtnMarcarTodas loading={marcandoTodas} onClick={marcarTodas} />
          )}
        </header>

        <div className="flex-shrink-0 flex gap-2 px-[15px] py-[10px] overflow-x-auto scrollbar-hide">
          {FILTROS.map(f => (
            <FilterPill
              key={f.label}
              label={f.label}
              active={filtro.label === f.label}
              onClick={() => setFiltro(f)}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide px-[15px] pb-6">
          <NotifLista
            lista={lista}
            carregando={carregando}
            onClicar={marcarUma}
          />
        </div>
      </div>

      {/* ══ DESKTOP ══ */}
      <div className="hidden md:flex md:flex-col py-5 px-[22px] md:h-screen md:overflow-y-auto md:scrollbar-thin">
        <div className="flex items-center justify-between mb-[18px] flex-shrink-0">
          <p className="text-[19px] font-black text-t1">Notificações</p>
          {temNaoLidas && (
            <BtnMarcarTodas loading={marcandoTodas} onClick={marcarTodas} />
          )}
        </div>

        <div className="flex gap-2 mb-[18px] overflow-x-auto scrollbar-hide pb-[2px] flex-shrink-0">
          {FILTROS.map(f => (
            <FilterPill
              key={f.label}
              label={f.label}
              active={filtro.label === f.label}
              onClick={() => setFiltro(f)}
            />
          ))}
        </div>

        <div className="max-w-[680px] w-full">
          <NotifLista
            lista={lista}
            carregando={carregando}
            onClicar={marcarUma}
          />
        </div>
      </div>
    </>
  )
}

/* ── Lista de notificações ── */
function NotifLista({ lista, carregando, onClicar }) {
  if (carregando) {
    return (
      <div className="flex flex-col gap-[6px] pt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-[13px] bg-s1 border border-bdr animate-pulse" />
        ))}
      </div>
    )
  }

  if (lista.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-t3">
        <Bell size={32} strokeWidth={1.8} />
        <p className="text-[12px] font-semibold">Nenhuma notificação</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[6px] pt-1">
      {lista.map(notif => (
        <NotifCard key={notif.id} notif={notif} onClicar={onClicar} />
      ))}
    </div>
  )
}

/* ── Card de notificação ── */
function NotifCard({ notif, onClicar }) {
  const meta = TIPO_META[notif.tipo] ?? TIPO_META.Sistema
  const { Icon, cor } = meta

  return (
    <button
      onClick={() => onClicar(notif)}
      className={clsx(
        'w-full text-left flex items-start gap-3 px-[14px] py-[12px] rounded-[13px] border transition-all duration-[250ms] cursor-pointer font-sans',
        notif.lida
          ? 'bg-s1 border-bdr hover:bg-s2'
          : 'bg-s1 border-bdr hover:bg-s2'
      )}
    >
      {/* Ícone colorido */}
      <div className={clsx(
        'w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-[1px]',
        cor === 'blue'  && 'bg-[var(--blue-sub)] text-blue-l',
        cor === 'green' && 'bg-green/[0.1] text-green',
        cor === 'amber' && 'bg-amber/[0.1] text-amber',
        cor === 'gray'  && 'bg-s2 text-t3',
      )}>
        <Icon size={15} strokeWidth={1.8} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={clsx(
            'text-[12px] leading-snug',
            notif.lida ? 'font-medium text-t2' : 'font-bold text-t1'
          )}>
            {notif.titulo}
          </p>
          <div className="flex items-center gap-[6px] flex-shrink-0 mt-[1px]">
            <span className="text-[9px] text-t3 whitespace-nowrap">{tempoAtras(notif.dataCriacao)}</span>
            {!notif.lida && (
              <span className="w-[7px] h-[7px] rounded-full bg-blue flex-shrink-0" />
            )}
          </div>
        </div>
        <p className="text-[11px] text-t3 mt-[2px] line-clamp-2 leading-snug">{notif.descricao}</p>
        {notif.idPublicacao && (
          <p className="text-[9px] text-blue-l mt-[4px] font-semibold flex items-center gap-1">
            <ChevronRight size={9} strokeWidth={1.8} />Ver publicação
          </p>
        )}
      </div>
    </button>
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

/* ── Botão marcar todas ── */
function BtnMarcarTodas({ loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] bg-s1 border border-bdr text-[10px] font-semibold text-t2 cursor-pointer font-sans hover:bg-s2 transition-all duration-[200ms] disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} strokeWidth={1.8} className="animate-spin" /> : <CheckCheck size={12} strokeWidth={1.8} />}
      Marcar todas como lidas
    </button>
  )
}

