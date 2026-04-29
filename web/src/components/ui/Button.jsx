/**
 * Button — variantes primary | ghost | small-primary | small-ghost
 */
export function Button({
  variant = 'primary',
  children,
  loading = false,
  disabled = false,
  fullWidth = true,
  style = {},
  ...props
}) {
  const base = {
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
    borderRadius: 11,
    padding: '12px',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.65 : 1,
    transition: 'opacity .2s, background .35s, border-color .35s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    letterSpacing: '.3px',
    ...style,
  }

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--blue-d), var(--blue-l))',
      color: '#fff',
      boxShadow: '0 6px 18px var(--blue-glow)',
    },
    ghost: {
      background: 'transparent',
      border: '1.5px solid var(--bdr)',
      color: 'var(--t2)',
      borderRadius: 11,
      padding: '11px',
    },
  }

  return (
    <button
      style={{ ...base, ...variants[variant] }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
