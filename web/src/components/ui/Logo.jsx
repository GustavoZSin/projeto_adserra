import logoImg from '../../assets/adserra-logo.png'

export function Logo({ size = 'md' }) {
  const heights = { sm: 40, md: 60, lg: 80 }
  return (
    <img
      src={logoImg}
      alt="ADSerra"
      height={heights[size]}
      style={{ width: 'auto', display: 'block', userSelect: 'none' }}
      draggable={false}
    />
  )
}
