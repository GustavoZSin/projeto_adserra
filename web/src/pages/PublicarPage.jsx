import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'

function getInitials(user) {
  if (user?.name)
    return user.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
  if (user?.matricula) return user.matricula.slice(0, 2).toUpperCase()
  return 'P'
}

const TIPOS = [
  { key: 'evento',  label: 'Evento',  Icon: CalendarIcon },
  { key: 'acao',    label: 'Ação',    Icon: ZapIcon },
  { key: 'noticia', label: 'Notícia', Icon: NewspaperIcon },
  { key: 'aviso',   label: 'Aviso',   Icon: MegaphoneIcon },
]

const lbl     = 'block text-[9px] font-bold text-t3 tracking-[1px] uppercase mb-1'
const inpBase = 'w-full bg-inp border-[1.5px] rounded-[11px] px-3 py-[10px] text-t1 text-[11px] font-sans outline-none block placeholder:text-t3 transition-all duration-[350ms] focus:border-blue focus:shadow-[0_0_0_3px_var(--blue-sub)]'
const btnP    = 'w-full bg-blue-grad border-none rounded-[11px] py-3 text-white text-[12px] font-bold font-sans cursor-pointer shadow-[0_6px_18px_var(--blue-glow)] tracking-[0.3px] transition-opacity duration-200 flex items-center justify-center gap-[6px] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
const btnG    = 'w-full bg-transparent border-[1.5px] border-bdr rounded-[11px] py-[11px] text-t2 text-[12px] font-semibold font-sans cursor-pointer transition-all duration-[350ms] disabled:opacity-60 disabled:cursor-not-allowed'

export default function PublicarPage() {
  const { user }                    = useAuth()
  const [searchParams]              = useSearchParams()
  const eventoId                    = searchParams.get('id')
  const isEditing                   = !!eventoId

  const [tipo, setTipo]             = useState('evento')
  const [titulo, setTitulo]         = useState('')
  const [descricao, setDescricao]   = useState('')
  const [data, setData]             = useState('')
  const [local, setLocal]           = useState('')
  const [preview, setPreview]       = useState(null)
  const [loading, setLoading]       = useState(false)
  const [errors, setErrors]         = useState({})
  const [apiError, setApiError]     = useState(null)
  const [success, setSuccess]       = useState(false)
  const fileRef = useRef(null)

  const initials = getInitials(user)

  // TODO: quando a API de eventos estiver pronta, carregar dados reais via eventosService.obter(eventoId)
  useEffect(() => {
    if (!isEditing) return
    setLoading(true)
    const timer = setTimeout(() => {
      setTitulo('Evento 2 FSG')
      setData('2025-04-26')
      setLocal('Campus Sede FSG')
      setTipo('evento')
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [eventoId, isEditing])

  const resetForm = () => {
    setTitulo(''); setDescricao(''); setData(''); setLocal('')
    setPreview(null); setErrors({}); setApiError(null)
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const errs = {}
    if (!titulo.trim()) errs.titulo = 'Informe o título'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePublicar = async () => {
    if (!validate()) return
    setLoading(true); setApiError(null)
    try {
      // TODO: isEditing ? eventosService.atualizar(eventoId, payload) : eventosService.criar(payload)
      await new Promise(r => setTimeout(r, 800))
      setSuccess(true)
    } catch {
      setApiError(isEditing ? 'Erro ao salvar alterações.' : 'Erro ao publicar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleRascunho = async () => {
    setLoading(true); setApiError(null)
    try {
      await new Promise(r => setTimeout(r, 600)) // TODO: integrar API
      setSuccess(true)
    } catch {
      setApiError('Erro ao salvar rascunho.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-60px)] md:min-h-screen p-5">
        <div className="bg-s1 border border-bdr rounded-[20px] px-7 py-9 flex flex-col items-center text-center max-w-[340px] w-full shadow-sh">
          <div className="w-16 h-16 bg-green/[0.12] rounded-2xl flex items-center justify-center text-green mb-[18px]">
            <CheckCircleIcon />
          </div>
          <h1 className="text-[18px] font-extrabold text-t1 mb-2">Publicado com sucesso!</h1>
          <p className="text-[12px] text-t3 leading-[1.6] mb-6">Sua publicação já está visível para os docentes.</p>
          <button className={btnP} onClick={() => { setSuccess(false); resetForm() }}>
            Nova publicação
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

      {/* ── Mobile ── */}
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden">
        <div className="px-[15px] py-[11px] flex items-center justify-between flex-shrink-0 border-b border-bdr2 bg-bg">
          <span className="text-[15px] font-extrabold text-t1">{isEditing ? 'Editar publicação' : 'Nova publicação'}</span>
          <div className="w-[30px] h-[30px] bg-blue-grad rounded-[9px] flex items-center justify-center text-[11px] font-bold text-white tracking-[0.5px] flex-shrink-0 font-sans select-none">
            {initials}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-[14px] py-3 pb-5 scrollbar-hide">
          <p className="text-[11px] text-t3 mb-[14px] leading-[1.5]">Compartilhe um evento, ação ou notícia com os docentes.</p>

          <div className="w-full mb-[10px]">
            <span className={lbl}>Tipo de publicação</span>
            <TipoRow tipo={tipo} setTipo={setTipo} />
          </div>

          <div className="w-full mb-[10px]">
            <span className={lbl}>Título</span>
            <input
              className={clsx(inpBase, errors.titulo ? 'border-red' : 'border-bdr')}
              type="text"
              placeholder="Ex: Evento 3 FSG — Maio 2025"
              value={titulo}
              onChange={e => { setTitulo(e.target.value); setErrors(p => ({ ...p, titulo: undefined })) }}
            />
            {errors.titulo && <span className="block text-[9px] text-red mt-[3px]">{errors.titulo}</span>}
          </div>

          <div className="w-full mb-[10px]">
            <span className={lbl}>Descrição</span>
            <textarea
              className={clsx(inpBase, 'border-bdr h-[62px] resize-none')}
              placeholder="Descreva o conteúdo..."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          <div className="w-full mb-[10px]">
            <span className={lbl}>Imagem de capa</span>
            <UploadArea preview={preview} onClickUpload={() => fileRef.current?.click()} hint="Toque para adicionar imagem" />
          </div>

          <div className="w-full mb-[10px]">
            <span className={lbl}>Data</span>
            <input className={clsx(inpBase, 'border-bdr')} type="date" value={data} onChange={e => setData(e.target.value)} />
          </div>

          <div className="w-full mb-4">
            <span className={lbl}>Local</span>
            <div className="relative">
              <input className={clsx(inpBase, 'border-bdr pr-9')} type="text" placeholder="Campus Sede FSG" value={local} onChange={e => setLocal(e.target.value)} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-icon pointer-events-none flex items-center"><MapPinIcon /></span>
            </div>
          </div>

          {apiError && <div className="bg-red/[0.1] border border-red/25 rounded-[9px] px-3 py-[9px] text-[11px] text-red mb-2">{apiError}</div>}

          <button className={clsx(btnP, 'mb-2')} onClick={handlePublicar} disabled={loading}>
            {loading ? <Spinner /> : isEditing ? 'Salvar alterações' : 'Publicar'}
          </button>
          {!isEditing && (
            <button className={btnG} onClick={handleRascunho} disabled={loading}>
              Salvar rascunho
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block py-5 px-[22px]">
        <p className="text-[19px] font-black text-t1 mb-[18px]">{isEditing ? 'Editar publicação' : 'Nova publicação'}</p>

        <div className="grid gap-[14px] items-start" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          {/* Coluna esquerda — Conteúdo */}
          <div className="bg-s1 border border-bdr rounded-[13px] p-[15px]">
            <p className="text-[12px] font-bold text-t1 mb-[14px]">Conteúdo</p>

            <div className="w-full mb-[14px]">
              <span className={lbl}>Tipo de publicação</span>
              <TipoRow tipo={tipo} setTipo={setTipo} />
            </div>

            <div className="w-full mb-[10px]">
              <span className={lbl}>Título</span>
              <input
                className={clsx(inpBase, errors.titulo ? 'border-red' : 'border-bdr')}
                type="text"
                placeholder="Ex: Evento 3 FSG — Maio 2025"
                value={titulo}
                onChange={e => { setTitulo(e.target.value); setErrors(p => ({ ...p, titulo: undefined })) }}
              />
              {errors.titulo && <span className="block text-[9px] text-red mt-[3px]">{errors.titulo}</span>}
            </div>

            <div className="w-full mb-[10px]">
              <span className={lbl}>Descrição</span>
              <textarea
                className={clsx(inpBase, 'border-bdr h-20 resize-none')}
                placeholder="Descreva..."
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-[10px]">
              <div>
                <span className={lbl}>Data</span>
                <input className={clsx(inpBase, 'border-bdr')} type="date" value={data} onChange={e => setData(e.target.value)} />
              </div>
              <div>
                <span className={lbl}>Local</span>
                <div className="relative">
                  <input className={clsx(inpBase, 'border-bdr pr-9')} type="text" placeholder="Campus FSG" value={local} onChange={e => setLocal(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-icon pointer-events-none flex items-center"><MapPinIcon /></span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="flex flex-col gap-3">
            <div className="bg-s1 border border-bdr rounded-[13px] p-[15px]">
              <p className="text-[12px] font-bold text-t1 mb-[10px]">Imagem de capa</p>
              <UploadArea preview={preview} onClickUpload={() => fileRef.current?.click()} hint="Clique ou arraste uma imagem" tall />
            </div>

            <div className="bg-s1 border border-bdr rounded-[13px] p-[15px]">
              <p className="text-[12px] font-bold text-t1 mb-3">Publicação</p>
              {apiError && <div className="bg-red/[0.1] border border-red/25 rounded-[9px] px-3 py-[9px] text-[11px] text-red mb-2">{apiError}</div>}
              <button className={clsx(btnP, 'mb-2')} onClick={handlePublicar} disabled={loading}>
                {loading ? <Spinner /> : isEditing ? 'Salvar alterações' : 'Publicar agora'}
              </button>
              {!isEditing && (
                <button className={btnG} onClick={handleRascunho} disabled={loading}>
                  Salvar rascunho
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Sub-components ── */

function TipoRow({ tipo, setTipo }) {
  return (
    <div className="flex gap-[6px] flex-wrap">
      {TIPOS.map(({ key, label, Icon }) => (
        <button key={key} type="button"
          className={clsx(
            'px-[10px] py-1 rounded-[20px] text-[10px] font-semibold cursor-pointer border flex items-center gap-[5px] font-sans transition-all duration-[250ms]',
            tipo === key
              ? 'bg-[var(--blue-sub)] border-[var(--blue-bdr)] text-blue-l'
              : 'border-bdr bg-s2 text-t3'
          )}
          onClick={() => setTipo(key)}>
          <Icon /> {label}
        </button>
      ))}
    </div>
  )
}

function UploadArea({ preview, onClickUpload, hint, tall }) {
  return (
    <div
      className={clsx(
        'w-full bg-s2 border-[1.5px] border-dashed border-bdr rounded-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer text-t3 relative overflow-hidden hover:border-blue-l hover:text-blue-l transition-all duration-[350ms]',
        tall ? 'h-[100px]' : 'h-[66px]'
      )}
      onClick={onClickUpload}
    >
      {preview
        ? <img src={preview} alt="capa" className="absolute inset-0 w-full h-full object-cover" />
        : <><UploadCloudIcon /><span className="text-[10px] font-semibold">{hint}</span></>
      }
    </div>
  )
}

/* ── Icons ── */
const SV = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function CalendarIcon({ s = 12 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
function ZapIcon({ s = 12 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function NewspaperIcon({ s = 12 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
}
function MegaphoneIcon({ s = 12 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg>
}
function UploadCloudIcon({ s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><polyline points="16 16 12 12 8 16"/><line x1="12" x2="12" y1="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
}
function MapPinIcon({ s = 13 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
}
function CheckCircleIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" {...SV}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
function Spinner() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin-fast flex-shrink-0"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
}
