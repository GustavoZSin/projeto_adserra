import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

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
      {loading ? <Loader2 size={16} strokeWidth={1.8} className="animate-spin" /> : children}
    </button>
  )
}

