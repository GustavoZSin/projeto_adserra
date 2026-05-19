import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { publicacaoService } from '../services/api'
import MenuAvatar from '../components/ui/MenuAvatar'
import clsx from 'clsx'

function getInitials(user) {
  const nome = user?.nomeCompleto || user?.name
  if (nome)
    return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
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
  const { user }       = useAuth()
  const [searchParams] = useSearchParams()
  const eventoId       = searchParams.get('id')
  const isEditing      = !!eventoId

  const [tipo, setTipo]         = useState('evento')
  const [titulo, setTitulo]     = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData]         = useState('')
  const [local, setLocal]       = useState('')

  // imagem de capa
  const [capaPreview, setCapaPreview]   = useState(null)
  const [capaFile, setCapaFile]         = useState(null)

  // galeria — imagens já salvas (edição) e novas a enviar
  const [galeriaExistente, setGaleriaExistente] = useState([])  // [{id, url}]
  const [galeriaFiles, setGaleriaFiles]         = useState([])  // File[]
  const [galeriaPreviews, setGaleriaPreviews]   = useState([])  // blob URL[]

  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState(null)
  const [success, setSuccess]   = useState(false)

  const capaRef    = useRef(null)
  const galeriaRef = useRef(null)

  const initials = getInitials(user)

  useEffect(() => {
    if (!isEditing) return
    const carregar = async () => {
      setLoading(true)
      try {
        const { data: pub } = await publicacaoService.obter(Number(eventoId))
        setTitulo(pub.titulo)
        setDescricao(pub.descricao ?? '')
        setData(pub.data.split('T')[0])
        setLocal(pub.local ?? '')
        setTipo(pub.tipo.toLowerCase())
        if (pub.imagemCapaUrl) setCapaPreview(pub.imagemCapaUrl)
        if (pub.imagensPublicacao?.length)
          setGaleriaExistente(pub.imagensPublicacao.map(img => ({ id: img.id, url: img.uRL })))
      } catch {
        setApiError('Não foi possível carregar a publicação.')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [eventoId, isEditing])

  const resetForm = () => {
    setTitulo(''); setDescricao(''); setData(''); setLocal('')
    setCapaPreview(null); setCapaFile(null)
    setGaleriaExistente([]); setGaleriaFiles([]); setGaleriaPreviews([])
    setErrors({}); setApiError(null)
  }

  const handleCapaFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCapaFile(file)
    setCapaPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleGaleriaFiles = (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setGaleriaFiles(prev => [...prev, ...files])
    setGaleriaPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeGaleriaFile = (idx) => {
    URL.revokeObjectURL(galeriaPreviews[idx])
    setGaleriaFiles(prev => prev.filter((_, i) => i !== idx))
    setGaleriaPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const validate = () => {
    const errs = {}
    if (!titulo.trim()) errs.titulo = 'Informe o título'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const buildFormData = (publica) => {
    const fd = new FormData()
    fd.append('Tipo', tipo.charAt(0).toUpperCase() + tipo.slice(1))
    fd.append('Titulo', titulo)
    fd.append('Descricao', descricao)
    if (data) fd.append('Data', data)
    if (local) fd.append('Local', local)
    if (capaFile) fd.append('ImagemCapa', capaFile)
    galeriaFiles.forEach(f => fd.append('ImagensParaGaleria', f))
    fd.append('Publica', publica)
    return fd
  }

  const handlePublicar = async () => {
    if (!validate()) return
    setLoading(true); setApiError(null)
    try {
      const fd = buildFormData(true)
      if (isEditing) await publicacaoService.editar(Number(eventoId), fd)
      else await publicacaoService.criar(fd)
      setSuccess(true)
    } catch {
      setApiError(isEditing ? 'Erro ao salvar alterações.' : 'Erro ao publicar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleRascunho = async () => {
    if (!validate()) return
    setLoading(true); setApiError(null)
    try {
      await publicacaoService.criar(buildFormData(false))
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
          <h1 className="text-[18px] font-extrabold text-t1 mb-2">
            {isEditing ? 'Alterações salvas!' : 'Publicado com sucesso!'}
          </h1>
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
      <input ref={capaRef}    type="file" accept="image/*"          style={{ display: 'none' }} onChange={handleCapaFile} />
      <input ref={galeriaRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGaleriaFiles} />

      {/* ── Mobile ── */}
      <div className="flex flex-col md:hidden h-[calc(100vh-60px)] overflow-hidden">
        <div className="px-[15px] py-[11px] flex items-center justify-between flex-shrink-0 border-b border-bdr2 bg-bg">
          <span className="text-[15px] font-extrabold text-t1">{isEditing ? 'Editar publicação' : 'Nova publicação'}</span>
          <MenuAvatar />
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
            <span className={lbl}>Imagem de capa <span className="normal-case text-[8px] font-normal">(opcional)</span></span>
            <CapaUpload preview={capaPreview} onClickUpload={() => capaRef.current?.click()} onRemove={() => { setCapaPreview(null); setCapaFile(null) }} hint="Toque para adicionar imagem" />
          </div>

          <div className="w-full mb-[10px]">
            <GaleriaSection
              existentes={galeriaExistente}
              previews={galeriaPreviews}
              onAdd={() => galeriaRef.current?.click()}
              onRemoveNew={removeGaleriaFile}
            />
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
              <p className="text-[12px] font-bold text-t1 mb-[10px]">
                Imagem de capa <span className="text-[9px] font-normal text-t3">(opcional)</span>
              </p>
              <CapaUpload preview={capaPreview} onClickUpload={() => capaRef.current?.click()} onRemove={() => { setCapaPreview(null); setCapaFile(null) }} hint="Clique ou arraste uma imagem" tall />
            </div>

            <div className="bg-s1 border border-bdr rounded-[13px] p-[15px]">
              <GaleriaSection
                existentes={galeriaExistente}
                previews={galeriaPreviews}
                onAdd={() => galeriaRef.current?.click()}
                onRemoveNew={removeGaleriaFile}
              />
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

function CapaUpload({ preview, onClickUpload, onRemove, hint, tall }) {
  return (
    <div className="relative">
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
      {preview && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="absolute top-[6px] right-[6px] w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors border-none cursor-pointer z-10"
        >
          <XIcon />
        </button>
      )}
    </div>
  )
}

function GaleriaSection({ existentes, previews, onAdd, onRemoveNew }) {
  const total = existentes.length + previews.length
  return (
    <div>
      <div className="flex items-center justify-between mb-[7px]">
        <span className={lbl + ' mb-0'}>
          Galeria <span className="normal-case text-[8px] font-normal">(opcional)</span>
          {total > 0 && <span className="ml-1 text-blue-l">{total}</span>}
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-[4px] text-[9px] font-bold text-blue-l bg-[var(--blue-sub)] border border-[var(--blue-bdr)] rounded-[6px] px-[8px] py-[4px] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <PlusIcon s={10} /> Adicionar
        </button>
      </div>

      {total === 0 && (
        <div
          className="w-full h-[54px] bg-s2 border-[1.5px] border-dashed border-bdr rounded-[11px] flex items-center justify-center gap-1 cursor-pointer text-t3 hover:border-blue-l hover:text-blue-l transition-all duration-[350ms]"
          onClick={onAdd}
        >
          <ImagePlusIcon /><span className="text-[10px] font-semibold">Nenhuma imagem na galeria</span>
        </div>
      )}

      {total > 0 && (
        <div className="flex flex-wrap gap-[6px]">
          {existentes.map(img => (
            <div key={img.id} className="relative w-[60px] h-[60px] rounded-[8px] overflow-hidden border border-bdr flex-shrink-0">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[7px] text-center py-[2px] font-semibold">salva</span>
            </div>
          ))}
          {previews.map((url, idx) => (
            <div key={idx} className="relative w-[60px] h-[60px] rounded-[8px] overflow-hidden border border-[var(--blue-bdr)] flex-shrink-0">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveNew(idx)}
                className="absolute top-[3px] right-[3px] w-[16px] h-[16px] bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 border-none cursor-pointer"
              >
                <XIcon s={8} />
              </button>
            </div>
          ))}
          <div
            className="w-[60px] h-[60px] rounded-[8px] bg-s2 border-[1.5px] border-dashed border-bdr flex items-center justify-center text-t3 cursor-pointer hover:border-blue-l hover:text-blue-l transition-all duration-[350ms] flex-shrink-0"
            onClick={onAdd}
          >
            <PlusIcon s={18} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Icons ── */
const SV = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }

function CalendarIcon({ s = 12 })   { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> }
function ZapIcon({ s = 12 })        { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function NewspaperIcon({ s = 12 })  { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg> }
function MegaphoneIcon({ s = 12 })  { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg> }
function UploadCloudIcon({ s = 20 }){ return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><polyline points="16 16 12 12 8 16"/><line x1="12" x2="12" y1="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg> }
function MapPinIcon({ s = 13 })     { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> }
function CheckCircleIcon()          { return <svg width="32" height="32" viewBox="0 0 24 24" {...SV}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
function PlusIcon({ s = 18 })       { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV}><path d="M5 12h14"/><path d="M12 5v14"/></svg> }
function XIcon({ s = 10 })          { return <svg width={s} height={s} viewBox="0 0 24 24" {...SV} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function ImagePlusIcon()            { return <svg width="14" height="14" viewBox="0 0 24 24" {...SV}><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" x2="22" y1="5" y2="5"/><line x1="19" x2="19" y1="2" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> }
function Spinner()                  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin-fast flex-shrink-0"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
