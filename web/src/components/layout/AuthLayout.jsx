import { Outlet } from 'react-router-dom'
import logoImg from '../../assets/adserra-logo.png'
import './AuthLayout.css'

/**
 * Layout para páginas públicas (login, ingresso, esqueci senha).
 * Desktop: painel azul fixo à esquerda + conteúdo à direita.
 * Mobile:  apenas o conteúdo (painel some).
 */
export default function AuthLayout() {
  return (
    <div className="auth-root">

      {/* ── Painel esquerdo — fixo em todas as telas públicas ── */}
      <aside className="auth-panel">
        <div className="auth-panel-circle auth-panel-circle--tr" />
        <div className="auth-panel-circle auth-panel-circle--bl" />
        <div className="auth-panel-circle auth-panel-circle--sm" />

        <div className="auth-panel-top">
          <div className="auth-panel-logo">
            <LogoWhite />
          </div>
          <h2 className="auth-panel-title">
            Portal exclusivo<br />para docentes
          </h2>
          <p className="auth-panel-desc">
            Associação dos Docentes do Centro Universitário da Serra Gaúcha.
            Acesse eventos, notícias e ações da associação.
          </p>
        </div>

        <div className="auth-panel-stats">
          <div className="auth-stat">
            <span className="auth-stat-n">48</span>
            <span className="auth-stat-l">Docentes ativos</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-n">12+</span>
            <span className="auth-stat-l">Eventos anuais</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-n">FSG</span>
            <span className="auth-stat-l">Instituição</span>
          </div>
        </div>
      </aside>

      {/* ── Conteúdo da página ── */}
      <div className="auth-content">
        <Outlet />
      </div>

    </div>
  )
}

function LogoWhite() {
  return (
    <img
      src={logoImg}
      alt="ADSerra"
      height={76}
      style={{ width: 'auto', display: 'block', userSelect: 'none', filter: 'brightness(0) invert(1)' }}
      draggable={false}
    />
  )
}
