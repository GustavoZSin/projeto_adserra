import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import './PublicarPage.css'

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
      // Placeholder: pré-preenche com dados fictícios até o backend estar disponível
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
      <div className="pub-success-wrap">
        <div className="pub-success-card">
          <div className="pub-success-ico"><CheckCircleIcon /></div>
          <h1 className="pub-success-title">Publicado com sucesso!</h1>
          <p className="pub-success-sub">Sua publicação já está visível para os docentes.</p>
          <button className="pub-btn-p" onClick={() => { setSuccess(false); resetForm() }}>
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
      <div className="pub-mobile">
        <div className="pub-topbar">
          <span className="pub-topbar-title">{isEditing ? 'Editar publicação' : 'Nova publicação'}</span>
          <div className="pub-avatar">{initials}</div>
        </div>

        <div className="pub-scroll">
          <p className="pub-sub">Compartilhe um evento, ação ou notícia com os docentes.</p>

          <div className="pub-inp-grp">
            <span className="pub-inp-lbl">Tipo de publicação</span>
            <div className="pub-cat-row">
              {TIPOS.map(({ key, label, Icon }) => (
                <button key={key} type="button"
                  className={`pub-cat-pill${tipo === key ? ' pub-cat-pill--on' : ''}`}
                  onClick={() => setTipo(key)}>
                  <Icon /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pub-inp-grp">
            <span className="pub-inp-lbl">Título</span>
            <input
              className={`pub-inp-f${errors.titulo ? ' pub-inp-f--error' : ''}`}
              type="text"
              placeholder="Ex: Evento 3 FSG — Maio 2025"
              value={titulo}
              onChange={e => { setTitulo(e.target.value); setErrors(p => ({ ...p, titulo: undefined })) }}
            />
            {errors.titulo && <span className="pub-inp-err">{errors.titulo}</span>}
          </div>

          <div className="pub-inp-grp">
            <span className="pub-inp-lbl">Descrição</span>
            <textarea
              className="pub-textarea"
              placeholder="Descreva o conteúdo..."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          <div className="pub-inp-grp">
            <span className="pub-inp-lbl">Imagem de capa</span>
            <div className="pub-upload" onClick={() => fileRef.current?.click()}>
              {preview
                ? <img src={preview} alt="capa" className="pub-upload-preview" />
                : <><UploadCloudIcon /><span className="pub-upload-txt">Toque para adicionar imagem</span></>
              }
            </div>
          </div>

          <div className="pub-inp-grp">
            <span className="pub-inp-lbl">Data</span>
            <input
              className="pub-inp-f"
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
            />
          </div>

          <div className="pub-inp-grp" style={{ marginBottom: 16 }}>
            <span className="pub-inp-lbl">Local</span>
            <div className="pub-inp-f-wrap">
              <input
                className="pub-inp-f pub-inp-f--icon"
                type="text"
                placeholder="Campus Sede FSG"
                value={local}
                onChange={e => setLocal(e.target.value)}
              />
              <span className="pub-inp-ico"><MapPinIcon /></span>
            </div>
          </div>

          {apiError && <div className="pub-api-error">{apiError}</div>}

          <button className="pub-btn-p" onClick={handlePublicar} disabled={loading} style={{ marginBottom: 8 }}>
            {loading ? <Spinner /> : isEditing ? 'Salvar alterações' : 'Publicar'}
          </button>
          {!isEditing && (
            <button className="pub-btn-g" onClick={handleRascunho} disabled={loading}>
              Salvar rascunho
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="pub-desktop">
        <div className="pub-web-tb">
          <p className="pub-web-title">{isEditing ? 'Editar publicação' : 'Nova publicação'}</p>
        </div>

        <div className="pub-web-grid">
          {/* Coluna esquerda — Conteúdo */}
          <div className="pub-panel">
            <div className="pub-panel-hd" style={{ marginBottom: 14 }}>
              <span className="pub-panel-t">Conteúdo</span>
            </div>

            <div className="pub-inp-grp">
              <span className="pub-inp-lbl">Tipo de publicação</span>
              <div className="pub-cat-row" style={{ marginBottom: 14 }}>
                {TIPOS.map(({ key, label, Icon }) => (
                  <button key={key} type="button"
                    className={`pub-cat-pill${tipo === key ? ' pub-cat-pill--on' : ''}`}
                    onClick={() => setTipo(key)}>
                    <Icon /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pub-inp-grp">
              <span className="pub-inp-lbl">Título</span>
              <input
                className={`pub-inp-f${errors.titulo ? ' pub-inp-f--error' : ''}`}
                type="text"
                placeholder="Ex: Evento 3 FSG — Maio 2025"
                value={titulo}
                onChange={e => { setTitulo(e.target.value); setErrors(p => ({ ...p, titulo: undefined })) }}
              />
              {errors.titulo && <span className="pub-inp-err">{errors.titulo}</span>}
            </div>

            <div className="pub-inp-grp">
              <span className="pub-inp-lbl">Descrição</span>
              <textarea
                className="pub-textarea pub-textarea--lg"
                placeholder="Descreva..."
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              />
            </div>

            <div className="pub-date-local-row">
              <div className="pub-inp-grp">
                <span className="pub-inp-lbl">Data</span>
                <input
                  className="pub-inp-f"
                  type="date"
                  value={data}
                  onChange={e => setData(e.target.value)}
                />
              </div>
              <div className="pub-inp-grp">
                <span className="pub-inp-lbl">Local</span>
                <div className="pub-inp-f-wrap">
                  <input
                    className="pub-inp-f pub-inp-f--icon"
                    type="text"
                    placeholder="Campus FSG"
                    value={local}
                    onChange={e => setLocal(e.target.value)}
                  />
                  <span className="pub-inp-ico"><MapPinIcon /></span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="pub-right-col">
            <div className="pub-panel">
              <div className="pub-panel-hd" style={{ marginBottom: 10 }}>
                <span className="pub-panel-t">Imagem de capa</span>
              </div>
              <div className="pub-upload pub-upload--web" onClick={() => fileRef.current?.click()}>
                {preview
                  ? <img src={preview} alt="capa" className="pub-upload-preview" />
                  : <><UploadCloudIcon s={22} /><span className="pub-upload-txt">Clique ou arraste uma imagem</span></>
                }
              </div>
            </div>

            <div className="pub-panel">
              <div className="pub-panel-hd" style={{ marginBottom: 12 }}>
                <span className="pub-panel-t">Publicação</span>
              </div>
              {apiError && <div className="pub-api-error" style={{ marginBottom: 8 }}>{apiError}</div>}
              <button className="pub-btn-p" onClick={handlePublicar} disabled={loading} style={{ marginBottom: 8 }}>
                {loading ? <Spinner /> : isEditing ? 'Salvar alterações' : 'Publicar agora'}
              </button>
              {!isEditing && (
                <button className="pub-btn-g" onClick={handleRascunho} disabled={loading}>
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
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ animation: 'pub-spin .8s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes pub-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}
