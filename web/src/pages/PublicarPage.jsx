import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { publicacaoService } from '../services/api'
import MenuAvatar from '../components/ui/MenuAvatar'
import clsx from 'clsx'
import { Calendar, Zap, Newspaper, Megaphone, UploadCloud, MapPin, CheckCircle2, Plus, X, ImagePlus, Loader2, Globe, Lock, Users } from 'lucide-react'

function getInitials(user) {
  const nome = user?.nomeCompleto || user?.name
  if (nome)
    return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
  if (user?.matricula) return user.matricula.slice(0, 2).toUpperCase()
  return 'P'
}

const TIPOS = [
  { key: 'evento',  label: 'Evento',  Icon: Calendar },
  { key: 'acao',    label: 'Ação',    Icon: Zap },
  { key: 'noticia', label: 'Notícia', Icon: Newspaper },
  { key: 'aviso',   label: 'Aviso',   Icon: Megaphone },
]

const lbl     = 'block text-[9px] font-bold text-t3 tracking-[1px] uppercase mb-1'
const inpBase = 'w-full bg-inp border-[1.5px] rounded-[11px] px-3 py-[10px] text-t1 text-[11px] font-sans outline-none block placeholder:text-t3 transition-all duration-[350ms] focus:border-blue focus:shadow-[0_0_0_3px_var(--blue-sub)]'
const btnP    = 'w-full bg-blue-grad border-none rounded-[11px] py-3 text-white text-[12px] font-bold font-sans cursor-pointer shadow-[0_6px_18px_var(--blue-glow)] tracking-[0.3px] transition-opacity duration-200 flex items-center justify-center gap-[6px] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
const btnG    = 'w-full bg-transparent border-[1.5px] border-bdr rounded-[11px] py-[11px] text-t2 text-[12px] font-semibold font-sans cursor-pointer transition-all duration-[350ms] disabled:opacity-60 disabled:cursor-not-allowed'

export default function PublicarPage() {
  const { user }       = useAuth()
  const navigate       = useNavigate()
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

  const [visibilidade, setVisibilidade] = useState('publica')

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
        setVisibilidade(pub.publica ? 'publica' : 'rascunho')
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
    setErrors({}); setApiError(null); setVisibilidade('publica')
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

  const buildFormData = () => {
    const fd = new FormData()
    fd.append('Tipo', tipo.charAt(0).toUpperCase() + tipo.slice(1))
    fd.append('Titulo', titulo)
    fd.append('Descricao', descricao)
    if (data) fd.append('Data', data)
    if (local) fd.append('Local', local)
    if (capaFile) fd.append('ImagemCapa', capaFile)
    galeriaFiles.forEach(f => fd.append('ImagensParaGaleria', f))
    fd.append('Publica', String(visibilidade !== 'rascunho'))
    return fd
  }

  const handleSalvar = async () => {
    if (!validate()) return
    setLoading(true); setApiError(null)
    try {
      const fd = buildFormData()
      if (isEditing) await publicacaoService.editar(Number(eventoId), fd)
      else await publicacaoService.criar(fd)
      setSuccess(true)
    } catch {
      setApiError(isEditing ? 'Erro ao salvar alterações.' : 'Erro ao publicar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-60px)] md:min-h-screen p-5">
        <div className="bg-s1 border border-bdr rounded-[20px] px-7 py-9 flex flex-col items-center text-center max-w-[340px] w-full shadow-sh">
          <div className="w-16 h-16 bg-green/[0.12] rounded-2xl flex items-center justify-center text-green mb-[18px]">
            <CheckCircle2 size={32} strokeWidth={1.8} />
          </div>
          <h1 className="text-[18px] font-extrabold text-t1 mb-2">
            {isEditing ? 'Alterações salvas!' : visibilidade === 'rascunho' ? 'Rascunho salvo!' : 'Publicado com sucesso!'}
          </h1>
          <p className="text-[12px] text-t3 leading-[1.6] mb-6">
            {visibilidade === 'publica'
              ? 'Sua publicação está visível publicamente.'
              : visibilidade === 'interna'
              ? 'Sua publicação está visível para todos os docentes.'
              : 'Visível apenas para administradores. Você pode ativá-la a qualquer momento.'}
          </p>
          <button className={clsx(btnP, 'mb-2')} onClick={() => { setSuccess(false); resetForm() }}>
            Nova publicação
          </button>
          <button className={btnG} onClick={() => navigate('/eventos')}>
            Ver publicações
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-icon pointer-events-none flex items-center"><MapPin size={13} strokeWidth={1.8} /></span>
            </div>
          </div>

          <VisibilidadeToggle visibilidade={visibilidade} onChange={setVisibilidade} />

          {apiError && <div className="bg-red/[0.1] border border-red/25 rounded-[9px] px-3 py-[9px] text-[11px] text-red mb-2">{apiError}</div>}

          <button className={clsx(btnP)} onClick={handleSalvar} disabled={loading}>
            {loading ? <Loader2 size={16} strokeWidth={1.8} className="animate-spin-fast flex-shrink-0" /> : isEditing ? 'Salvar alterações' : visibilidade === 'rascunho' ? 'Salvar rascunho' : 'Publicar'}
          </button>
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-icon pointer-events-none flex items-center"><MapPin size={13} strokeWidth={1.8} /></span>
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
              <VisibilidadeToggle visibilidade={visibilidade} onChange={setVisibilidade} />
              {apiError && <div className="bg-red/[0.1] border border-red/25 rounded-[9px] px-3 py-[9px] text-[11px] text-red mb-2">{apiError}</div>}
              <button className={clsx(btnP)} onClick={handleSalvar} disabled={loading}>
                {loading ? <Loader2 size={16} strokeWidth={1.8} className="animate-spin-fast flex-shrink-0" /> : isEditing ? 'Salvar alterações' : visibilidade === 'rascunho' ? 'Salvar rascunho' : 'Publicar agora'}
              </button>
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
          <Icon size={12} strokeWidth={1.8} /> {label}
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
          : <><UploadCloud size={20} strokeWidth={1.8} /><span className="text-[10px] font-semibold">{hint}</span></>
        }
      </div>
      {preview && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="absolute top-[6px] right-[6px] w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors border-none cursor-pointer z-10"
        >
          <X size={10} strokeWidth={2.5} />
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
          <Plus size={10} strokeWidth={1.8} /> Adicionar
        </button>
      </div>

      {total === 0 && (
        <div
          className="w-full h-[54px] bg-s2 border-[1.5px] border-dashed border-bdr rounded-[11px] flex items-center justify-center gap-1 cursor-pointer text-t3 hover:border-blue-l hover:text-blue-l transition-all duration-[350ms]"
          onClick={onAdd}
        >
          <ImagePlus size={14} strokeWidth={1.8} /><span className="text-[10px] font-semibold">Nenhuma imagem na galeria</span>
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
                <X size={8} strokeWidth={2.5} />
              </button>
            </div>
          ))}
          <div
            className="w-[60px] h-[60px] rounded-[8px] bg-s2 border-[1.5px] border-dashed border-bdr flex items-center justify-center text-t3 cursor-pointer hover:border-blue-l hover:text-blue-l transition-all duration-[350ms] flex-shrink-0"
            onClick={onAdd}
          >
            <Plus size={18} strokeWidth={1.8} />
          </div>
        </div>
      )}
    </div>
  )
}

const VISIBILIDADE_OPCOES = [
  { key: 'publica',  label: 'Pública',  Icon: Globe,  desc: 'Visível para todos'     },
  { key: 'interna',  label: 'Interna',  Icon: Users,  desc: 'Só docentes'            },
  { key: 'rascunho', label: 'Rascunho', Icon: Lock,   desc: 'Só administradores'     },
]

function VisibilidadeToggle({ visibilidade, onChange }) {
  return (
    <div className="mb-3">
      <span className={lbl}>Visibilidade</span>
      <div className="flex rounded-[10px] border border-bdr overflow-hidden">
        {VISIBILIDADE_OPCOES.map(({ key, label, Icon }, i) => {
          const ativo = visibilidade === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-[3px] py-[8px] px-1 text-[10px] font-semibold font-sans cursor-pointer border-none transition-all duration-200',
                i > 0 && 'border-l border-bdr',
                ativo ? 'bg-blue-grad text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]'
                  : 'bg-s2 text-t3 hover:bg-s3'
              )}
            >
              <Icon size={12} strokeWidth={1.8} />
              {label}
            </button>
          )
        })}
      </div>
      <p className="text-[9px] text-t3 mt-[5px]">
        {VISIBILIDADE_OPCOES.find(o => o.key === visibilidade)?.desc}
      </p>
    </div>
  )
}

