import { Outlet } from 'react-router-dom'
import logoImg from '../../assets/adserra-logo.png'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-bg">

      {/* ── Painel esquerdo — desktop only ── */}
      <aside className="hidden md:flex w-[420px] flex-shrink-0 flex-col justify-between relative overflow-hidden px-10 py-12"
             style={{ background: 'linear-gradient(145deg, #0c3d6b 0%, #1B70B0 55%, #2484CC 100%)' }}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="absolute -bottom-[100px] -left-[60px] w-[360px] h-[360px] rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="absolute top-[140px] -right-[50px] w-[180px] h-[180px] rounded-full bg-white/[0.06] pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-10">
            <LogoWhite />
          </div>
          <h2 className="text-[28px] font-extrabold text-white leading-[1.25] mb-[14px] tracking-[-0.4px]">
            Portal exclusivo<br />para docentes
          </h2>
          <p className="text-[13px] text-white/70 leading-[1.7]">
            Associação dos Docentes do Centro Universitário da Serra Gaúcha.
            Acesse eventos, notícias e ações da associação.
          </p>
        </div>

        <div className="relative z-10 flex">
          {[
            { n: '48',  l: 'Docentes ativos' },
            { n: '12+', l: 'Eventos anuais' },
            { n: 'FSG', l: 'Instituição' },
          ].map(({ n, l }) => (
            <div key={n} className="flex-1 flex flex-col items-center gap-1 px-3 border-r border-white/[0.18] first:pl-0 last:border-r-0">
              <span className="text-[26px] font-black text-white tracking-[-0.5px]">{n}</span>
              <span className="text-[10px] text-white/60 font-medium text-center">{l}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Conteúdo da página ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
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
