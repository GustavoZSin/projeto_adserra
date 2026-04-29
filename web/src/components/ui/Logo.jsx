/**
 * Logo ADSerra — fiel ao design v11
 * size: 'sm' | 'md' | 'lg'
 */
export function Logo({ size = 'md', showSubtitle = false }) {
  const sizes = {
    sm:  { width: 80,  height: 22, vw: 160, vh: 40,  fontSize: 35, tx: 55,  gx: 138, gs: 0.22 },
    md:  { width: 148, height: 42, vw: 296, vh: 80,  fontSize: 70, tx: 114, gx: 266, gs: 0.46 },
    lg:  { width: 200, height: 56, vw: 296, vh: 80,  fontSize: 70, tx: 114, gx: 266, gs: 0.60 },
  }
  const s = sizes[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <svg
        width={s.width}
        height={s.height}
        viewBox={`0 0 ${s.vw} ${s.vh}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="0"
          y={s.vh - 16}
          fontFamily="Georgia, serif"
          fontSize={s.fontSize}
          fontWeight="700"
          fill="var(--logo-ad)"
          style={{ transition: 'fill .35s' }}
        >
          AD
        </text>
        <text
          x={s.tx}
          y={s.vh - 16}
          fontFamily="Georgia, serif"
          fontSize={s.fontSize}
          fontWeight="700"
          fill="#1B70B0"
        >
          Serra
        </text>
        <g transform={`translate(${s.gx},0) scale(${s.gs})`}>
          <path
            d="M28,4 L58,2 L82,10 L98,20 L106,36 L112,52 L108,70 L96,84 L78,96 L58,104 L36,102 L18,92 L6,76 L2,56 L4,36 L12,18 Z"
            fill="#1B70B0"
            opacity=".9"
          />
          <line x1="28" y1="4"   x2="108" y2="70"  stroke="white" strokeWidth="3.5" opacity=".7" />
          <line x1="2"  y1="56"  x2="112" y2="52"  stroke="white" strokeWidth="3.5" opacity=".7" />
          <line x1="58" y1="2"   x2="58"  y2="104" stroke="white" strokeWidth="3.5" opacity=".7" />
          <circle cx="57" cy="52" r="5" fill="white" opacity=".9" />
        </g>
      </svg>

      {showSubtitle && (
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: 'var(--t3)',
            transition: 'color .35s',
          }}
        >
          Associação dos Docentes · Serra Gaúcha
        </span>
      )}
    </div>
  )
}
