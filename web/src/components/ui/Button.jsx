import clsx from 'clsx'

export function Button({ variant = 'primary', children, loading = false, disabled = false, fullWidth = true, className = '', ...props }) {
  const base = clsx(
    'border-none rounded-[11px] py-3 text-[13px] font-bold font-sans cursor-pointer',
    'flex items-center justify-center gap-2 tracking-[0.3px]',
    'transition-all duration-200',
    fullWidth ? 'w-full' : 'w-auto',
    (disabled || loading) && 'opacity-65 cursor-not-allowed'
  )

  const variants = {
    primary: 'bg-blue-grad text-white shadow-[0_6px_18px_var(--blue-glow)] hover:brightness-110',
    ghost:   'bg-transparent border-[1.5px] border-bdr text-t2 hover:border-blue-l hover:text-blue-l hover:bg-[var(--blue-sub)]',
  }

  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         className="animate-spin-fast">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
