import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getIniciais } from '../utils/usuario'
import { usuariosService } from '../services/api'
import clsx from 'clsx'

const GRADIENTES_AVATAR = [
  'linear-gradient(135deg,var(--blue-d),var(--blue-l))',
  'linear-gradient(135deg,#059669,#10B981)',
  'linear-gradient(135deg,#D97706,#F59E0B)',
  'linear-gradient(135deg,#7C3AED,#A78BFA)',
  'linear-gradient(135deg,var(--s3),var(--s2))',
]

const btnBase = 'inline-flex items-center gap-[5px] px-[13px] py-[7px] rounded-[9px] text-[11px] font-bold font-sans cursor-pointer transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'

function normalizarUsuario(u, indice) {
  return {
    id: u.id,
    nome: u.nomeCompleto,
    email: u.emailInstitucional,
    matricula: u.matricula,
    departamento: u.departamento,
    gradAvatar: GRADIENTES_AVATAR[indice % GRADIENTES_AVATAR.length],
  }
}

function iniciais(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

export default function GerenciarUsuariosPage() {
  const { user } = useAuth()
  const iniciaisAdmin = getIniciais(user)

  const [usuarios, setUsuarios]       = useState([])
  const [carregando, setCarregando]   = useState(true)
  const [busca, setBusca]             = useState('')
  const [removendo, setRemovendo]     = useState(null)
  const [confirmando, setConfirmando] = useState(null)

  useEffect(() => {
    usuariosService.listar()
      .then(r => setUsuarios((r.data ?? []).map(normalizarUsuario)))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  const visiveis = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    if (!termo) return usuarios
    return usuarios.filter(u =>
      u.nome.toLowerCase().includes(termo) ||
      u.departamento?.toLowerCase().includes(termo) ||
      u.matricula?.toLowerCase().includes(termo)
    )
  }, [usuarios, busca])

  const confirmarRemocao = (usuario) => setConfirmando(usuario)

  const handleRemover = async () => {
    if (!confirmando) return
    setConfirmando(null)
    setRemovendo(confirmando.id)
    try {
      await usuariosService.deletar(confirmando.id)
      setUsuarios(prev => prev.filter(u => u.id !== confirmando.id))
    } catch {
      // TODO: exibir feedback de erro
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <>
      {confirmando && (
        <ModalConfirmarRemocao
          nome={confirmando.nome}
          onCancelar={() => setConfirmando(null)}
          onConfirmar={handleRemover}
        />
      )}

      {/* ══════════ MOBILE ══════════ */}
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden">
        <div className="px-[15px] py-[11px] flex items-center justify-between flex-shrink-0 border-b border-bdr2 bg-bg">
          <span className="text-[15px] font-extrabold text-t1">Gerenciar Usuários</span>
          <div className="w-[30px] h-[30px] bg-blue-grad rounded-[9px] flex items-center justify-center text-[11px] font-bold text-white tracking-[0.5px] font-sans select-none flex-shrink-0">
            {iniciaisAdmin}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-[13px] py-[11px] pb-5 scrollbar-hide">
          {/* Stat */}
          <div className="bg-s1 border border-bdr rounded-[12px] p-[10px] flex items-center gap-2 mb-3">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[var(--blue-sub)] text-blue-l flex items-center justify-center flex-shrink-0">
              <IconeUsuarios size={16} />
            </div>
            <div>
              <p className="text-[17px] font-extrabold text-t1 leading-[1.1]">{carregando ? '—' : usuarios.length}</p>
              <p className="text-[9px] text-t3 font-medium">Docentes cadastrados</p>
            </div>
          </div>

          {/* Busca */}
          <div className="relative mb-3">
            <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-t3 pointer-events-none">
              <IconeBusca size={13} />
            </span>
            <input
              className="w-full bg-s1 border border-bdr rounded-[10px] pl-[30px] pr-3 py-[8px] text-[11px] text-t1 placeholder-t3 outline-none focus:border-blue-l transition-colors font-sans"
              placeholder="Buscar por nome, matrícula ou departamento..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          {/* Lista */}
          {carregando && <p className="text-[11px] text-t3 text-center py-8">Carregando...</p>}
          {!carregando && visiveis.length === 0 && (
            <p className="text-[11px] text-t3 text-center py-8">
              {busca ? 'Nenhum usuário encontrado.' : 'Nenhum docente cadastrado.'}
            </p>
          )}
          {visiveis.map(u => (
            <CardUsuario
              key={u.id}
              u={u}
              removendo={removendo === u.id}
              onRemover={() => confirmarRemocao(u)}
            />
          ))}
        </div>
      </div>

      {/* ══════════ DESKTOP ══════════ */}
      <div className="hidden md:block py-5 px-[22px]">
        <div className="flex items-start justify-between mb-[18px]">
          <div>
            <p className="text-[19px] font-black text-t1">Gerenciar Usuários</p>
            <p className="text-[11px] text-t3 mt-[3px]">Docentes cadastrados no sistema</p>
          </div>
          <div className="flex items-center gap-[9px]">
            <div className="relative">
              <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-t3 pointer-events-none">
                <IconeBusca size={13} />
              </span>
              <input
                className="bg-s1 border-[1.5px] border-bdr rounded-[9px] pl-[32px] pr-3 py-[7px] text-[11px] text-t1 placeholder-t3 outline-none focus:border-blue-l transition-colors font-sans w-[220px]"
                placeholder="Buscar usuário..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stat */}
        <div className="mb-[18px]">
          <div className="inline-flex bg-s1 border border-bdr rounded-[13px] px-4 py-[14px] items-center gap-3">
            <div className="w-10 h-10 rounded-[11px] bg-[var(--blue-sub)] text-blue-l flex items-center justify-center flex-shrink-0">
              <IconeUsuarios size={18} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-t1 leading-[1.1]">{carregando ? '—' : usuarios.length}</p>
              <p className="text-[10px] text-t3 font-medium">Docentes cadastrados</p>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-2">
          {carregando && <p className="text-[11px] text-t3 text-center py-8">Carregando...</p>}
          {!carregando && visiveis.length === 0 && (
            <p className="text-[11px] text-t3 text-center py-8">
              {busca ? 'Nenhum usuário encontrado.' : 'Nenhum docente cadastrado.'}
            </p>
          )}
          {visiveis.map(u => (
            <CardUsuario
              key={u.id}
              u={u}
              removendo={removendo === u.id}
              onRemover={() => confirmarRemocao(u)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Card de usuário ── */
function CardUsuario({ u, removendo, onRemover }) {
  return (
    <div className="bg-s1 border border-bdr rounded-[13px] overflow-hidden mb-[9px] flex">
      <div className="w-1 flex-shrink-0" style={{ background: 'var(--blue-l)' }} />
      <div className="flex-1 px-3 py-3 pl-[10px] min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-[9px] min-w-0">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 font-sans"
                 style={{ background: u.gradAvatar }}>
              {iniciais(u.nome)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="text-[12px] font-bold text-t1">{u.nome}</p>
              <p className="text-[9px] text-t3 whitespace-nowrap overflow-hidden text-ellipsis">{u.email}</p>
            </div>
          </div>
          <button
            className={clsx(btnBase, 'bg-red/[0.08] border border-red/30 text-red hover:bg-red/[0.14] flex-shrink-0')}
            onClick={onRemover}
            disabled={removendo}
          >
            {removendo ? <IconeCarregando /> : <IconeLixeira />}
            <span className="hidden sm:inline">Remover</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-[10px]">
          <CelulaInfo label="Matrícula"    valor={u.matricula} />
          <CelulaInfo label="Departamento" valor={u.departamento} />
          <CelulaInfo label="E-mail"       valor={u.email} />
        </div>
      </div>
    </div>
  )
}

/* ── Sub-componentes ── */
function CelulaInfo({ label, valor }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[8px] font-semibold uppercase tracking-[0.5px] text-t3">{label}</p>
      <p className="text-[11px] font-semibold text-t1 whitespace-nowrap overflow-hidden text-ellipsis">{valor || '—'}</p>
    </div>
  )
}

function ModalConfirmarRemocao({ nome, onCancelar, onConfirmar }) {
  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur z-[200] flex items-center justify-center p-5" onClick={onCancelar}>
      <div className="bg-s1 border border-bdr rounded-[18px] px-6 py-7 max-w-[340px] w-full flex flex-col items-center text-center shadow-sh" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-[14px] bg-red/[0.10] text-red flex items-center justify-center mb-4">
          <IconeLixeira size={26} />
        </div>
        <p className="text-[16px] font-extrabold text-t1 mb-2">Remover docente?</p>
        <p className="text-[11px] text-t3 leading-[1.6] mb-[22px]">
          O acesso de <b className="text-t1">{nome}</b> será removido permanentemente. Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 bg-s2 border border-bdr rounded-[9px] py-[9px] text-t2 text-[11px] font-bold font-sans cursor-pointer hover:bg-s3 transition-colors"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="flex-1 border-none rounded-[9px] py-[9px] text-white text-[11px] font-bold font-sans cursor-pointer hover:opacity-90 transition-opacity bg-red-grad shadow-red-btn"
            onClick={onConfirmar}
          >
            Sim, remover
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Ícones ── */
const IC = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function IconeUsuarios({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconeBusca({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
}
function IconeLixeira({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...IC}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
}
function IconeCarregando() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="animate-spin-fast"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
}
