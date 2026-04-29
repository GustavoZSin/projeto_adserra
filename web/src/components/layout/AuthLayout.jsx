import { Outlet } from 'react-router-dom'
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
    <svg width="148" height="42" viewBox="0 0 296 80" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="64" fontFamily="Georgia,serif" fontSize="70" fontWeight="700" fill="rgba(255,255,255,0.75)">AD</text>
      <text x="114" y="64" fontFamily="Georgia,serif" fontSize="70" fontWeight="700" fill="#fff">Serra</text>
      <g transform="translate(266,0) scale(0.46)">
        <path d="M28,4 L58,2 L82,10 L98,20 L106,36 L112,52 L108,70 L96,84 L78,96 L58,104 L36,102 L18,92 L6,76 L2,56 L4,36 L12,18 Z" fill="rgba(255,255,255,0.3)" opacity=".9"/>
        <line x1="28" y1="4"  x2="108" y2="70" stroke="white" strokeWidth="3.5" opacity=".5"/>
        <line x1="2"  y1="56" x2="112" y2="52" stroke="white" strokeWidth="3.5" opacity=".5"/>
        <line x1="58" y1="2"  x2="58"  y2="104" stroke="white" strokeWidth="3.5" opacity=".5"/>
        <circle cx="57" cy="52" r="5" fill="white" opacity=".7"/>
      </g>
    </svg>
  )
}
